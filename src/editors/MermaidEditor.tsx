import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import zenuml from '@mermaid-js/mermaid-zenuml';
import { parseMermaidToExcalidraw } from '@excalidraw/mermaid-to-excalidraw';
import { EditorLayout, toolbarBtn, toolbarSelect, toolbarOption } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { ExamplesMenu } from '../ExamplesMenu';
import { downloadText } from '../export';
import { withMermaidIdCompat } from '../mermaidToExcalidrawCompat';
import type { PendingScene } from '../sceneHandoff';
import { useI18n } from '../i18n';

const THEMES = ['default', 'neutral', 'dark', 'forest', 'base'] as const;

const DEFAULT_CODE_BY_LANG = {
  es: `flowchart TD
  A[Inicio] --> B{Decisión}
  B -->|Sí| C[Hacer algo]
  B -->|No| D[Fin]`,
  en: `flowchart TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Do something]
  B -->|No| D[End]`,
};

const EXAMPLES_BY_LANG: Record<'es' | 'en', readonly { label: string; code: string }[]> = {
  es: [
    { label: 'Flowchart', code: DEFAULT_CODE_BY_LANG.es },
    {
      label: 'Sequence',
      code: `sequenceDiagram
  participant Cliente
  participant Servidor
  Cliente->>Servidor: Solicitud
  Servidor-->>Cliente: Respuesta`,
    },
    {
      label: 'Class',
      code: `classDiagram
  class Animal {
    +String nombre
    +hacerSonido()
  }
  class Perro
  Animal <|-- Perro`,
    },
    {
      label: 'Entity Relationship',
      code: `erDiagram
  USUARIO ||--o{ PEDIDO : realiza
  PEDIDO ||--|{ ITEM : contiene`,
    },
    {
      label: 'State',
      code: `stateDiagram-v2
  [*] --> Inactivo
  Inactivo --> Activo: iniciar
  Activo --> Inactivo: detener
  Activo --> [*]`,
    },
    {
      label: 'Gantt',
      code: `gantt
  title Plan de proyecto
  dateFormat YYYY-MM-DD
  section Diseño
  Investigación :a1, 2026-01-01, 5d
  Prototipo     :a2, after a1, 5d
  section Desarrollo
  Build         :a3, after a2, 10d`,
    },
    {
      label: 'Pie',
      code: `pie title Distribución
  "Vivienda" : 40
  "Comida" : 25
  "Ahorro" : 20
  "Ocio" : 15`,
    },
    {
      label: 'Journey',
      code: `journey
  title Compra online
  section Buscar
    Ver catálogo: 5: Cliente
    Comparar precios: 3: Cliente
  section Comprar
    Agregar al carrito: 4: Cliente
    Pagar: 2: Cliente`,
    },
    {
      label: 'Mindmap',
      code: `mindmap
  root((Proyecto))
    Diseño
      UI
      UX
    Desarrollo
      Frontend
      Backend
    Lanzamiento
      Marketing
      Soporte`,
    },
    {
      label: 'Quadrant',
      code: `quadrantChart
  title Esfuerzo vs Impacto
  x-axis Bajo Esfuerzo --> Alto Esfuerzo
  y-axis Bajo Impacto --> Alto Impacto
  quadrant-1 Ganancia rápida
  quadrant-2 Proyecto grande
  quadrant-3 Relleno
  quadrant-4 Reconsiderar
  Tarea A: [0.3, 0.7]
  Tarea B: [0.7, 0.8]
  Tarea C: [0.2, 0.2]`,
    },
    {
      label: 'Timeline',
      code: `timeline
  title Historia del proyecto
  2024 : Idea inicial
  2025 : Primer prototipo : Beta pública
  2026 : Lanzamiento : Escalamiento`,
    },
    {
      label: 'GitGraph',
      code: `gitGraph
  commit
  branch develop
  checkout develop
  commit
  commit
  checkout main
  merge develop
  commit`,
    },
    {
      label: 'Sankey',
      code: `sankey-beta
Salario,Presupuesto,1500
Presupuesto,Vivienda,600
Presupuesto,Comida,400
Presupuesto,Ahorro,300
Presupuesto,Ocio,200`,
    },
    {
      label: 'Block',
      code: `block-beta
  columns 3
  Cliente space:2
  down<["usa"]>(down) space:2
  API space:2
  down2<["consulta"]>(down) space:2
  DB space:2`,
    },
    {
      label: 'XY Chart',
      code: `xychart-beta
  title "Ventas mensuales"
  x-axis [Ene, Feb, Mar, Abr, May]
  y-axis "Unidades" 0 --> 1000
  bar [500, 620, 480, 750, 900]`,
    },
    {
      label: 'Requirement',
      code: `requirementDiagram
requirement test_req {
id: 1
text: el sistema debe autenticar usuarios
risk: high
verifymethod: test
}
element test_entity {
type: simulation
}
test_entity - satisfies -> test_req`,
    },
    {
      label: 'C4',
      code: `C4Context
title Diagrama de contexto
Person(user, "Usuario")
System(sys, "Sistema")
Rel(user, sys, "usa")`,
    },
    {
      label: 'Packet',
      code: `packet-beta
title Paquete UDP
0-7: "Puerto origen"
8-15: "Puerto destino"
16-31: "Longitud"`,
    },
    {
      label: 'Kanban',
      code: `kanban
  Por hacer
    task1[Diseñar UI]
    task2[Definir API]
  En progreso
    task3[Implementar backend]
  Hecho
    task4[Setup inicial]`,
    },
    {
      label: 'Architecture',
      code: `architecture-beta
  group api(cloud)[API]
  service db(database)[Database] in api
  service server(server)[Server] in api
  server:R -- L:db`,
    },
    {
      label: 'Radar',
      code: `radar-beta
title Habilidades
axis Diseno, Codigo, Testing, Docs
curve Actual{80, 90, 60, 40}
curve Meta{90, 95, 85, 70}`,
    },
    {
      label: 'Ishikawa',
      code: `ishikawa
Causa raiz del bug
Personas
  Falta capacitacion
Proceso
  Sin revision de codigo
Tecnologia
  Libreria desactualizada`,
    },
    {
      label: 'Wardley',
      code: `wardley-beta
title Mapa Wardley
component Usuario [0.9, 0.1]
component App [0.7, 0.5]
component Base de datos [0.3, 0.8]
Usuario -> App
App -> Base de datos`,
    },
    {
      label: 'Treemap',
      code: `treemap-beta
  "Categoría A"
  "Item A1": 10
  "Item A2": 20
  "Categoría B"
  "Item B1": 15
  "Item B2": 25`,
    },
    {
      label: 'Venn',
      code: `venn-beta
  set A
  set B
  set C
  union A, B
  union B, C`,
    },
    {
      label: 'Cynefin',
      code: `cynefin-beta
  title Respuesta a incidentes

  complex
  "Investigar causa raíz"
  "Ejecutar experimento controlado"

  complicated
  "Analizar datos de rendimiento"
  "Requiere revisión experta"

  clear
  "Reiniciar servicio"
  "Aplicar solución conocida"

  chaotic
  "Escalar a guardia inmediatamente"`,
    },
    {
      label: 'TreeView',
      code: `treeView-beta
  "raíz"
  "carpeta1"
      "archivo1.js"
      "archivo2.ts"
  "carpeta2"
      "archivo3.spec.ts"
  "archivo4.ts"`,
    },
    {
      label: 'Event Modeling',
      code: `eventmodeling

tf 01 ui CarritoUI
tf 02 cmd AgregarItem
tf 03 evt ItemAgregado
tf 04 rmo VistaCarrito ->> 03`,
    },
    {
      label: 'ZenUML',
      code: `zenuml
    Servicio.Procesar(id) {
      usuario = Sesion.ObtenerUsuario()
      if (usuario.activo) {
        Repositorio.Actualizar(id, usuario)
        return "ok"
      } else {
        return "rechazado"
      }
    }`,
    },
  ],
  en: [
    { label: 'Flowchart', code: DEFAULT_CODE_BY_LANG.en },
    {
      label: 'Sequence',
      code: `sequenceDiagram
  participant Client
  participant Server
  Client->>Server: Request
  Server-->>Client: Response`,
    },
    {
      label: 'Class',
      code: `classDiagram
  class Animal {
    +String name
    +makeSound()
  }
  class Dog
  Animal <|-- Dog`,
    },
    {
      label: 'Entity Relationship',
      code: `erDiagram
  USER ||--o{ ORDER : places
  ORDER ||--|{ ITEM : contains`,
    },
    {
      label: 'State',
      code: `stateDiagram-v2
  [*] --> Inactive
  Inactive --> Active: start
  Active --> Inactive: stop
  Active --> [*]`,
    },
    {
      label: 'Gantt',
      code: `gantt
  title Project Plan
  dateFormat YYYY-MM-DD
  section Design
  Research  :a1, 2026-01-01, 5d
  Prototype :a2, after a1, 5d
  section Development
  Build     :a3, after a2, 10d`,
    },
    {
      label: 'Pie',
      code: `pie title Distribution
  "Housing" : 40
  "Food" : 25
  "Savings" : 20
  "Leisure" : 15`,
    },
    {
      label: 'Journey',
      code: `journey
  title Online Shopping
  section Search
    Browse catalog: 5: Customer
    Compare prices: 3: Customer
  section Buy
    Add to cart: 4: Customer
    Checkout: 2: Customer`,
    },
    {
      label: 'Mindmap',
      code: `mindmap
  root((Project))
    Design
      UI
      UX
    Development
      Frontend
      Backend
    Launch
      Marketing
      Support`,
    },
    {
      label: 'Quadrant',
      code: `quadrantChart
  title Effort vs Impact
  x-axis Low Effort --> High Effort
  y-axis Low Impact --> High Impact
  quadrant-1 Quick Win
  quadrant-2 Major Project
  quadrant-3 Fill-in
  quadrant-4 Reconsider
  Task A: [0.3, 0.7]
  Task B: [0.7, 0.8]
  Task C: [0.2, 0.2]`,
    },
    {
      label: 'Timeline',
      code: `timeline
  title Project History
  2024 : Initial idea
  2025 : First prototype : Public beta
  2026 : Launch : Scaling`,
    },
    {
      label: 'GitGraph',
      code: `gitGraph
  commit
  branch develop
  checkout develop
  commit
  commit
  checkout main
  merge develop
  commit`,
    },
    {
      label: 'Sankey',
      code: `sankey-beta
Salary,Budget,1500
Budget,Housing,600
Budget,Food,400
Budget,Savings,300
Budget,Leisure,200`,
    },
    {
      label: 'Block',
      code: `block-beta
  columns 3
  Client space:2
  down<["uses"]>(down) space:2
  API space:2
  down2<["queries"]>(down) space:2
  DB space:2`,
    },
    {
      label: 'XY Chart',
      code: `xychart-beta
  title "Monthly Sales"
  x-axis [Jan, Feb, Mar, Apr, May]
  y-axis "Units" 0 --> 1000
  bar [500, 620, 480, 750, 900]`,
    },
    {
      label: 'Requirement',
      code: `requirementDiagram
requirement test_req {
id: 1
text: the system shall authenticate users
risk: high
verifymethod: test
}
element test_entity {
type: simulation
}
test_entity - satisfies -> test_req`,
    },
    {
      label: 'C4',
      code: `C4Context
title Context Diagram
Person(user, "User")
System(sys, "System")
Rel(user, sys, "uses")`,
    },
    {
      label: 'Packet',
      code: `packet-beta
title UDP Packet
0-7: "Source Port"
8-15: "Destination Port"
16-31: "Length"`,
    },
    {
      label: 'Kanban',
      code: `kanban
  To Do
    task1[Design UI]
    task2[Define API]
  In Progress
    task3[Implement backend]
  Done
    task4[Initial setup]`,
    },
    {
      label: 'Architecture',
      code: `architecture-beta
  group api(cloud)[API]
  service db(database)[Database] in api
  service server(server)[Server] in api
  server:R -- L:db`,
    },
    {
      label: 'Radar',
      code: `radar-beta
title Skills
axis Design, Code, Testing, Docs
curve Current{80, 90, 60, 40}
curve Target{90, 95, 85, 70}`,
    },
    {
      label: 'Ishikawa',
      code: `ishikawa
Bug root cause
People
  Lack of training
Process
  No code review
Technology
  Outdated library`,
    },
    {
      label: 'Wardley',
      code: `wardley-beta
title Wardley Map
component User [0.9, 0.1]
component App [0.7, 0.5]
component Database [0.3, 0.8]
User -> App
App -> Database`,
    },
    {
      label: 'Treemap',
      code: `treemap-beta
  "Category A"
  "Item A1": 10
  "Item A2": 20
  "Category B"
  "Item B1": 15
  "Item B2": 25`,
    },
    {
      label: 'Venn',
      code: `venn-beta
  set A
  set B
  set C
  union A, B
  union B, C`,
    },
    {
      label: 'Cynefin',
      code: `cynefin-beta
  title Incident Response

  complex
  "Investigate root cause"
  "Run controlled experiment"

  complicated
  "Analyze performance data"
  "Requires expert review"

  clear
  "Restart service"
  "Apply known fix"

  chaotic
  "Escalate to on-call immediately"`,
    },
    {
      label: 'TreeView',
      code: `treeView-beta
  "root"
  "folder1"
      "file1.js"
      "file2.ts"
  "folder2"
      "file3.spec.ts"
  "file4.ts"`,
    },
    {
      label: 'Event Modeling',
      code: `eventmodeling

tf 01 ui CartUI
tf 02 cmd AddItem
tf 03 evt ItemAdded
tf 04 rmo CartView ->> 03`,
    },
    {
      label: 'ZenUML',
      code: `zenuml
    Service.Process(id) {
      user = Session.GetUser()
      if (user.active) {
        Repository.Update(id, user)
        return "ok"
      } else {
        return "rejected"
      }
    }`,
    },
  ],
};

let renderCount = 0;

// zenuml is a separate rendering engine, not bundled in mermaid core —
// registered once so the `zenuml` diagram type is recognized.
const zenumlReady = mermaid.registerExternalDiagrams([zenuml]);

export default function MermaidEditor({ onEditInExcalidraw }: { onEditInExcalidraw?: (scene: PendingScene) => void }) {
  const { t, language } = useI18n();
  const outRef = useRef<HTMLDivElement>(null);
  const examples = EXAMPLES_BY_LANG[language];
  const [code, setCode] = useState(() => DEFAULT_CODE_BY_LANG[language]);
  const [theme, setTheme] = useState<(typeof THEMES)[number]>('dark');
  const [svgMarkup, setSvgMarkup] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);

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
        render(nextCode, theme);
      }
    }
  }, [language, code, theme]);

  const editVisually = async () => {
    setConverting(true);
    try {
      const { elements, files } = await withMermaidIdCompat(() => parseMermaidToExcalidraw(code));
      // The converter only breaks flowchart/sequence/class/ER/state diagrams
      // into real editable elements; anything else (pie, gantt, mindmap,
      // gitGraph, journey...) comes back as a single flat embedded image.
      // The warning has to travel with the scene: we switch tabs right after,
      // so setting our own `error` here would never be seen.
      const isFlatImage = elements.length === 1 && elements[0].type === 'image';
      onEditInExcalidraw?.({
        elements,
        files,
        warning: isFlatImage
          ? t.mermaid.flatWarning
          : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setConverting(false);
    }
  };

  const render = async (src: string, tTheme: (typeof THEMES)[number]) => {
    try {
      await zenumlReady;
      mermaid.initialize({ startOnLoad: false, theme: tTheme, securityLevel: 'strict' });
      const { svg } = await mermaid.render(`mermaid-diagram-${renderCount++}`, src);
      setSvgMarkup(svg);
      if (outRef.current) outRef.current.innerHTML = svg;
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  useEffect(() => {
    render(DEFAULT_CODE_BY_LANG[language], theme);
  }, []);

  return (
    <EditorLayout
      examples={
        <ExamplesMenu
          examples={examples}
          onSelect={(exampleCode) => {
            setCode(exampleCode);
            render(exampleCode, theme);
          }}
        />
      }
      actions={
        <>
          <OpenFileButton
            accept=".mmd,.mermaid,.txt"
            label={t.openFileBtn('.mmd')}
            onOpen={(text) => {
              setCode(text);
              render(text, theme);
            }}
          />
          <button className={toolbarBtn} onClick={() => render(code, theme)}>{t.renderBtn}</button>
          <select
            className={toolbarSelect}
            value={theme}
            onChange={(e) => {
              const themeVal = e.target.value as (typeof THEMES)[number];
              setTheme(themeVal);
              render(code, themeVal);
            }}
          >
            {THEMES.map((th) => (
              <option key={th} value={th} className={toolbarOption}>{th}</option>
            ))}
          </select>
          <button className={toolbarBtn} onClick={() => downloadText(code, 'diagrama.mmd')}>
            {t.downloadFileBtn('.mmd')}
          </button>
          {onEditInExcalidraw && (
            <button className={toolbarBtn} onClick={editVisually} disabled={converting}>
              {converting ? t.mermaid.converting : t.mermaid.editVisually}
            </button>
          )}
          <ExportButtons filename="diagrama-mermaid" getSvg={async () => svgMarkup} />
        </>
      }
      error={error}
      code={code}
      onCodeChange={setCode}
      renderArea={
        <div
          ref={outRef}
          className="w-full h-full flex items-center justify-center overflow-auto p-6 [&_svg]:max-w-none"
        />
      }
    />
  );
}
