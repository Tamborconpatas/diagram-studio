import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { EditorLayout, toolbarBtn, toolbarSelect } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { downloadText } from '../export';

const THEMES = ['default', 'neutral', 'dark', 'forest', 'base'] as const;

const DEFAULT_CODE = `flowchart TD
  A[Inicio] --> B{Decisión}
  B -->|Sí| C[Hacer algo]
  B -->|No| D[Fin]`;

let renderCount = 0;

export default function MermaidEditor() {
  const outRef = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [theme, setTheme] = useState<(typeof THEMES)[number]>('dark');
  const [svgMarkup, setSvgMarkup] = useState('');
  const [error, setError] = useState<string | null>(null);

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
