import { useState } from 'react';
import plantumlEncoder from 'plantuml-encoder';
import { EditorLayout, toolbarBtn, toolbarSelect, toolbarOption } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { ExamplesMenu } from '../ExamplesMenu';
import { downloadText } from '../export';

const THEMES = [
  '_none_', 'amiga', 'aws-orange', 'black-knight', 'bluegray', 'cerulean',
  'crt-amber', 'mars', 'materia', 'metal', 'mono', 'plain', 'sketchy', 'spacelab', 'vibrant',
] as const;

const DEFAULT_CODE = `@startuml
Alice -> Bob: Hola
Bob --> Alice: Respuesta
@enduml`;

// C4-PlantUML isn't a separate tool — it's include-able templates on top of
// PlantUML itself, fetched by the public server at render time.
const C4_EXAMPLE = `@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

Person(user, "Usuario")
System_Boundary(sys, "Sistema") {
  Container(app, "App", "React")
  Container(db, "DB", "Postgres")
}
Rel(user, app, "usa")
Rel(app, db, "lee/escribe")
@enduml`;

const EXAMPLES = [
  { label: 'Sequence', code: DEFAULT_CODE },
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
  { label: 'C4 Container', code: C4_EXAMPLE },
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
] as const;

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
  const [code, setCode] = useState(DEFAULT_CODE);
  const [theme, setTheme] = useState<(typeof THEMES)[number]>('_none_');
  const [src, setSrc] = useState(() => toUrl(DEFAULT_CODE, '_none_'));
  const [error, setError] = useState<string | null>(null);

  const getSvg = async () => {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`No se pudo obtener el SVG (${res.status})`);
    return res.text();
  };

  return (
    <EditorLayout
      examples={
        <ExamplesMenu
          examples={EXAMPLES}
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
            label="Abrir .puml"
            onOpen={(text) => {
              setCode(text);
              setSrc(toUrl(text, theme));
            }}
          />
          <button className={toolbarBtn} onClick={() => setSrc(toUrl(code, theme))}>Renderizar</button>
          <select
            className={toolbarSelect}
            value={theme}
            onChange={(e) => {
              const t = e.target.value as (typeof THEMES)[number];
              setTheme(t);
              setSrc(toUrl(code, t));
            }}
          >
            {THEMES.map((t) => (
              <option key={t} value={t} className={toolbarOption}>{t === '_none_' ? 'sin tema' : t}</option>
            ))}
          </select>
          <button className={toolbarBtn} onClick={() => downloadText(code, 'diagrama.puml')}>
            Descargar .puml
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
            alt="Diagrama PlantUML"
            className="max-w-none"
            onError={() => setError('No se pudo renderizar el diagrama (servidor PlantUML público, requiere internet)')}
            onLoad={() => setError(null)}
          />
        </div>
      }
    />
  );
}
