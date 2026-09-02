import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { parseMermaidToExcalidraw } from '@excalidraw/mermaid-to-excalidraw';
import { EditorLayout, toolbarBtn, toolbarSelect } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { downloadText } from '../export';
import { withMermaidIdCompat } from '../mermaidToExcalidrawCompat';
import type { PendingScene } from '../sceneHandoff';

const THEMES = ['default', 'neutral', 'dark', 'forest', 'base'] as const;

const DEFAULT_CODE = `flowchart TD
  A[Inicio] --> B{Decisión}
  B -->|Sí| C[Hacer algo]
  B -->|No| D[Fin]`;

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
      toolbar={
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
              <option key={t} value={t}>{t}</option>
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
