import { useEffect, useState } from 'react';
import { EditorLayout, toolbarBtn } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { downloadText } from '../export';

const DEFAULT_CODE = `\\begin{tikzpicture}
  \\node[draw, circle] (a) {A};
  \\node[draw, circle, right=2cm of a] (b) {B};
  \\draw[-{Latex}] (a) -- (b);
\\end{tikzpicture}
`;

export default function TikzEditor() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [svgMarkup, setSvgMarkup] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const render = async (src: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/render-tikz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: src }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`);
      setSvgMarkup(data.svg);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    render(DEFAULT_CODE);
  }, []);

  return (
    <EditorLayout
      toolbar={
        <>
          <button className={toolbarBtn} onClick={() => render(code)} disabled={loading}>
            {loading ? 'Compilando…' : 'Renderizar'}
          </button>
          <button className={toolbarBtn} onClick={() => downloadText(code, 'diagrama.tex')}>
            Descargar .tex
          </button>
          <ExportButtons filename="diagrama-tikz" getSvg={async () => svgMarkup} />
        </>
      }
      error={error}
      code={code}
      onCodeChange={setCode}
      renderArea={
        <div
          className="w-full h-full flex items-center justify-center overflow-auto p-6 bg-white [&_svg]:max-w-none"
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
      }
    />
  );
}
