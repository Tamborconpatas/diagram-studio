import { useEffect, useRef, useState } from 'react';
import plantumlEncoder from 'plantuml-encoder';
import { EditorLayout, toolbarBtn, toolbarSelect, toolbarOption } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { ExamplesMenu } from '../ExamplesMenu';
import { downloadText } from '../export';
import { useI18n } from '../i18n';

const THEMES = [
  '_none_', 'amiga', 'aws-orange', 'black-knight', 'bluegray', 'cerulean',
  'crt-amber', 'mars', 'materia', 'metal', 'mono', 'plain', 'sketchy', 'spacelab', 'vibrant',
] as const;

const DEFAULT_CODE_BY_LANG = {
  es: `@startuml
Alice -> Bob: Hola
Bob --> Alice: Respuesta
@enduml`,
  en: `@startuml
Alice -> Bob: Hello
Bob --> Alice: Response
@enduml`,
};

const EXAMPLES_BY_LANG: Record<'es' | 'en', readonly { label: string; code: string }[]> = {
  es: [
    { label: 'Sequence', code: DEFAULT_CODE_BY_LANG.es },
    {
      label: 'Class',
      code: `@startuml
class Animal {
  +String nombre
  +hacerSonido()
}
class Perro
Animal <|-- Perro
@enduml`,
    },
    {
      label: 'Use Case',
      code: `@startuml
actor Usuario
usecase "Iniciar sesión" as UC1
usecase "Ver reportes" as UC2
Usuario -- UC1
Usuario -- UC2
@enduml`,
    },
    {
      label: 'C4 Container',
      code: `@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

Person(user, "Usuario")
System_Boundary(sys, "Sistema") {
  Container(app, "App", "React")
  Container(db, "DB", "Postgres")
}
Rel(user, app, "usa")
Rel(app, db, "lee/escribe")
@enduml`,
    },
    {
      label: 'Activity',
      code: `@startuml
start
:Recibir pedido;
if (¿Stock disponible?) then (sí)
  :Preparar envío;
else (no)
  :Notificar demora;
endif
:Enviar confirmación;
stop
@enduml`,
    },
    {
      label: 'Component',
      code: `@startuml
package "Sistema" {
  [Frontend] --> [API]
  [API] --> [Base de Datos]
  [API] --> [Cache]
}
@enduml`,
    },
    {
      label: 'State',
      code: `@startuml
[*] --> Inactivo
Inactivo --> Activo : iniciar
Activo --> Pausado : pausar
Pausado --> Activo : reanudar
Activo --> [*] : detener
@enduml`,
    },
    {
      label: 'Deployment',
      code: `@startuml
node "Servidor Web" {
  [App]
}
node "Servidor DB" {
  database "Postgres"
}
[App] --> Postgres : JDBC
@enduml`,
    },
    {
      label: 'Object',
      code: `@startuml
object Usuario {
  nombre = "Ana"
  rol = "admin"
}
object Pedido {
  id = 1023
  total = 59.90
}
Usuario -- Pedido
@enduml`,
    },
    {
      label: 'Timing',
      code: `@startuml
robust "Servidor" as S
S is Idle
@0
S is Idle
@100
S is Busy
@enduml`,
    },
    {
      label: 'Wireframe',
      code: `@startsalt
{
  Login
  ==
  Password
  [OK]
}
@endsalt`,
    },
    {
      label: 'Gantt',
      code: `@startgantt
[Diseño] lasts 5 days
[Desarrollo] lasts 8 days
[Desarrollo] starts at [Diseño]'s end
@endgantt`,
    },
    {
      label: 'MindMap',
      code: `@startmindmap
* Proyecto
** Diseño
*** UI
*** UX
** Desarrollo
*** Frontend
*** Backend
@endmindmap`,
    },
    {
      label: 'WBS',
      code: `@startwbs
* Proyecto
** Diseño
** Desarrollo
*** Frontend
*** Backend
** Lanzamiento
@endwbs`,
    },
    {
      label: 'JSON',
      code: `@startjson
{
  "usuario": "ana",
  "activo": true,
  "roles": ["admin", "editor"]
}
@endjson`,
    },
    {
      label: 'YAML',
      code: `@startyaml
usuario: ana
activo: true
roles:
  - admin
  - editor
@endyaml`,
    },
    {
      label: 'Archimate',
      code: `@startuml
!include <archimate/Archimate>
Business_Actor(a, "Cliente")
Application_Component(b, "App")
Rel_Serving(b, a)
@enduml`,
    },
    {
      label: 'Network',
      code: `@startnwdiag
nwdiag {
  network dmz {
    web01;
    web02;
  }
  network internal {
    web01;
    db01;
  }
}
@endnwdiag`,
    },
    {
      label: 'Regex',
      code: `@startregex
[a-zA-Z][a-zA-Z0-9_]*
@endregex`,
    },
    {
      label: 'EBNF',
      code: `@startebnf
regla = "a", "b" | "c";
otra = { regla }, [ "opcional" ];
@endebnf`,
    },
  ],
  en: [
    { label: 'Sequence', code: DEFAULT_CODE_BY_LANG.en },
    {
      label: 'Class',
      code: `@startuml
class Animal {
  +String name
  +makeSound()
}
class Dog
Animal <|-- Dog
@enduml`,
    },
    {
      label: 'Use Case',
      code: `@startuml
actor User
usecase "Log in" as UC1
usecase "View reports" as UC2
User -- UC1
User -- UC2
@enduml`,
    },
    {
      label: 'C4 Container',
      code: `@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

Person(user, "User")
System_Boundary(sys, "System") {
  Container(app, "App", "React")
  Container(db, "DB", "Postgres")
}
Rel(user, app, "uses")
Rel(app, db, "reads/writes")
@enduml`,
    },
    {
      label: 'Activity',
      code: `@startuml
start
:Receive order;
if (Stock available?) then (yes)
  :Prepare shipment;
else (no)
  :Notify delay;
endif
:Send confirmation;
stop
@enduml`,
    },
    {
      label: 'Component',
      code: `@startuml
package "System" {
  [Frontend] --> [API]
  [API] --> [Database]
  [API] --> [Cache]
}
@enduml`,
    },
    {
      label: 'State',
      code: `@startuml
[*] --> Inactive
Inactive --> Active : start
Active --> Paused : pause
Paused --> Active : resume
Active --> [*] : stop
@enduml`,
    },
    {
      label: 'Deployment',
      code: `@startuml
node "Web Server" {
  [App]
}
node "DB Server" {
  database "Postgres"
}
[App] --> Postgres : JDBC
@enduml`,
    },
    {
      label: 'Object',
      code: `@startuml
object User {
  name = "Ana"
  role = "admin"
}
object Order {
  id = 1023
  total = 59.90
}
User -- Order
@enduml`,
    },
    {
      label: 'Timing',
      code: `@startuml
robust "Server" as S
S is Idle
@0
S is Idle
@100
S is Busy
@enduml`,
    },
    {
      label: 'Wireframe',
      code: `@startsalt
{
  Login
  ==
  Password
  [OK]
}
@endsalt`,
    },
    {
      label: 'Gantt',
      code: `@startgantt
[Design] lasts 5 days
[Development] lasts 8 days
[Development] starts at [Design]'s end
@endgantt`,
    },
    {
      label: 'MindMap',
      code: `@startmindmap
* Project
** Design
*** UI
*** UX
** Development
*** Frontend
*** Backend
@endmindmap`,
    },
    {
      label: 'WBS',
      code: `@startwbs
* Project
** Design
** Development
*** Frontend
*** Backend
** Launch
@endwbs`,
    },
    {
      label: 'JSON',
      code: `@startjson
{
  "user": "ana",
  "active": true,
  "roles": ["admin", "editor"]
}
@endjson`,
    },
    {
      label: 'YAML',
      code: `@startyaml
user: ana
active: true
roles:
  - admin
  - editor
@endyaml`,
    },
    {
      label: 'Archimate',
      code: `@startuml
!include <archimate/Archimate>
Business_Actor(a, "Customer")
Application_Component(b, "App")
Rel_Serving(b, a)
@enduml`,
    },
    {
      label: 'Network',
      code: `@startnwdiag
nwdiag {
  network dmz {
    web01;
    web02;
  }
  network internal {
    web01;
    db01;
  }
}
@endnwdiag`,
    },
    {
      label: 'Regex',
      code: `@startregex
[a-zA-Z][a-zA-Z0-9_]*
@endregex`,
    },
    {
      label: 'EBNF',
      code: `@startebnf
rule = "a", "b" | "c";
other = { rule }, [ "optional" ];
@endebnf`,
    },
  ],
};

// Force the classic UML stick-figure actor: some themes (and the public
// server's current default) swap it for a modern "avatar" icon otherwise.
// PlantUML applies skinparams in document order and locks in an actor's
// style as soon as it's declared, so a later override is too late if the
// source already set actorStyle (or a !theme did) before its own actors.
// Instead of injecting alongside whatever the source already has, strip any
// @start/@end wrapper and conflicting actorStyle lines, then rebuild with
// our skinparam guaranteed first.
//
// Only applies to @startuml/@enduml documents: the other diagram families
// (gantt, mindmap, wbs, json, yaml, salt, regex, ebnf, nwdiag, timing...)
// use their own dedicated start/end tags and don't have actors or themes —
// rewriting those to @startuml would break them, so pass them through as-is.
function withTheme(code: string, theme: string) {
  const clean = code.replace(/^﻿/, '');
  if (!/^\s*@startuml\b/im.test(clean)) return clean;
  const body = clean
    .replace(/^\s*@start\w+.*$/im, '')
    .replace(/\s*@end\w+\s*$/im, '')
    .replace(/^\s*skinparam\s+actorStyle\s+\S+\s*$/gim, '')
    .replace(/^\s*!theme\s+\S+\s*$/gim, '')
    .trim();
  const themeLine = theme === '_none_' ? '' : `!theme ${theme}\n`;
  return `@startuml\n${themeLine}skinparam actorStyle stick\n${body}\n@enduml`;
}

function toUrl(text: string, theme: string) {
  return `https://www.plantuml.com/plantuml/svg/${plantumlEncoder.encode(withTheme(text, theme))}`;
}

export default function PlantUmlEditor() {
  const { t, language } = useI18n();
  const examples = EXAMPLES_BY_LANG[language];
  const [code, setCode] = useState(() => DEFAULT_CODE_BY_LANG[language]);
  const [theme, setTheme] = useState<(typeof THEMES)[number]>('_none_');
  const [src, setSrc] = useState(() => toUrl(DEFAULT_CODE_BY_LANG[language], '_none_'));
  const [error, setError] = useState<string | null>(null);

  const prevLangRef = useRef(language);
  useEffect(() => {
    if (prevLangRef.current !== language) {
      const prevLang = prevLangRef.current;
      prevLangRef.current = language;
      const prevExamples = EXAMPLES_BY_LANG[prevLang];
      const prevIndex = prevExamples.findIndex((ex) => ex.code === code);
      if (prevIndex !== -1) {
        const nextCode = EXAMPLES_BY_LANG[language][prevIndex].code;
        setCode(nextCode);
        setSrc(toUrl(nextCode, theme));
      }
    }
  }, [language, code, theme]);

  const getSvg = async () => {
    const res = await fetch(src);
    if (!res.ok) throw new Error(t.plantuml.fetchError(res.status));
    return res.text();
  };

  return (
    <EditorLayout
      examples={
        <ExamplesMenu
          examples={examples}
          onSelect={(exampleCode) => {
            setCode(exampleCode);
            setSrc(toUrl(exampleCode, theme));
          }}
        />
      }
      actions={
        <>
          <OpenFileButton
            accept=".puml,.pu,.plantuml,.txt"
            label={t.openFileBtn('.puml')}
            onOpen={(text) => {
              setCode(text);
              setSrc(toUrl(text, theme));
            }}
          />
          <button className={toolbarBtn} onClick={() => setSrc(toUrl(code, theme))}>{t.renderBtn}</button>
          <select
            className={toolbarSelect}
            value={theme}
            onChange={(e) => {
              const th = e.target.value as (typeof THEMES)[number];
              setTheme(th);
              setSrc(toUrl(code, th));
            }}
          >
            {THEMES.map((th) => (
              <option key={th} value={th} className={toolbarOption}>{th === '_none_' ? t.plantuml.noTheme : th}</option>
            ))}
          </select>
          <button className={toolbarBtn} onClick={() => downloadText(code, 'diagrama.puml')}>
            {t.downloadFileBtn('.puml')}
          </button>
          <ExportButtons filename="diagrama-plantuml" getSvg={getSvg} />
        </>
      }
      error={error}
      code={code}
      onCodeChange={setCode}
      renderArea={
        <div className="w-full h-full flex items-center justify-center overflow-auto p-6">
          <img
            src={src}
            alt={t.plantuml.altText}
            className="max-w-none"
            onError={() => setError(t.plantuml.renderError)}
            onLoad={() => setError(null)}
          />
        </div>
      }
    />
  );
}
