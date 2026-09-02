import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { parseMermaidToExcalidraw } from '@excalidraw/mermaid-to-excalidraw';
import { EditorLayout, toolbarBtn, toolbarSelect, toolbarOption } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { ExamplesMenu } from '../ExamplesMenu';
import { downloadText } from '../export';
import { withMermaidIdCompat } from '../mermaidToExcalidrawCompat';
import type { PendingScene } from '../sceneHandoff';

const THEMES = ['default', 'neutral', 'dark', 'forest', 'base'] as const;

const DEFAULT_CODE = `flowchart TD
  A[Inicio] --> B{Decisión}
  B -->|Sí| C[Hacer algo]
  B -->|No| D[Fin]`;

const EXAMPLES = [
  { label: 'Flowchart', code: DEFAULT_CODE },
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
] as const;

let renderCount = 0;

export default function MermaidEditor({ onEditInExcalidraw }: { onEditInExcalidraw?: (scene: PendingScene) => void }) {
  const outRef = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [theme, setTheme] = useState<(typeof THEMES)[number]>('dark');
  const [svgMarkup, setSvgMarkup] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);

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
          ? 'Este tipo de diagrama Mermaid no se puede editar nodo por nodo (solo flowchart, sequence, class, ER y state) — se pegó como una sola imagen.'
          : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setConverting(false);
    }
  };

  const render = async (src: string, t: (typeof THEMES)[number]) => {
    try {
      mermaid.initialize({ startOnLoad: false, theme: t, securityLevel: 'strict' });
      const { svg } = await mermaid.render(`mermaid-diagram-${renderCount++}`, src);
      setSvgMarkup(svg);
      if (outRef.current) outRef.current.innerHTML = svg;
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  useEffect(() => {
    render(DEFAULT_CODE, theme);
  }, []);

  return (
    <EditorLayout
      examples={
        <ExamplesMenu
          examples={EXAMPLES}
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
            label="Abrir .mmd"
            onOpen={(text) => {
              setCode(text);
              render(text, theme);
            }}
          />
          <button className={toolbarBtn} onClick={() => render(code, theme)}>Renderizar</button>
          <select
            className={toolbarSelect}
            value={theme}
            onChange={(e) => {
              const t = e.target.value as (typeof THEMES)[number];
              setTheme(t);
              render(code, t);
            }}
          >
            {THEMES.map((t) => (
              <option key={t} value={t} className={toolbarOption}>{t}</option>
            ))}
          </select>
          <button className={toolbarBtn} onClick={() => downloadText(code, 'diagrama.mmd')}>
            Descargar .mmd
          </button>
          {onEditInExcalidraw && (
            <button className={toolbarBtn} onClick={editVisually} disabled={converting}>
              {converting ? 'Convirtiendo…' : 'Editar visualmente'}
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
