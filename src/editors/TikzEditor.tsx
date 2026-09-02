import { useEffect, useState } from 'react';
import { EditorLayout, toolbarBtn } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { ExamplesMenu } from '../ExamplesMenu';
import { downloadText } from '../export';

const DEFAULT_CODE = `\\begin{tikzpicture}
  \\node[draw, circle] (a) {A};
  \\node[draw, circle, right=2cm of a] (b) {B};
  \\draw[-{Latex}] (a) -- (b);
\\end{tikzpicture}
`;

const EXAMPLES = [
  { label: 'Nodos y flecha', code: DEFAULT_CODE },
  {
    label: 'Función matemática',
    code: `\\begin{tikzpicture}
  \\draw[->] (-0.2,0) -- (3.2,0) node[right] {$x$};
  \\draw[->] (0,-0.2) -- (0,3.2) node[above] {$y$};
  \\draw[domain=0:3, smooth, variable=\\x, blue] plot ({\\x}, {\\x*\\x/3});
\\end{tikzpicture}
`,
  },
  {
    label: 'Árbol',
    code: `\\begin{tikzpicture}[level distance=1.5cm, sibling distance=2.2cm]
  \\node {Raíz}
    child { node {Hijo A}
      child { node {A1} }
      child { node {A2} } }
    child { node {Hijo B} };
\\end{tikzpicture}
`,
  },
  {
    label: 'Diagrama de Venn',
    code: `\\begin{tikzpicture}
  \\draw[fill=blue, opacity=0.4] (0,0) circle (1.5cm);
  \\draw[fill=red, opacity=0.4] (1.5,0) circle (1.5cm);
  \\node at (-0.6,0) {A};
  \\node at (2.1,0) {B};
  \\node at (0.75,0) {A∩B};
\\end{tikzpicture}
`,
  },
  {
    label: 'Gráfico de barras',
    code: `\\begin{tikzpicture}
  \\draw[->] (0,0) -- (5,0);
  \\draw[->] (0,0) -- (0,4);
  \\draw[fill=blue!60] (0.5,0) rectangle (1.2,1.5);
  \\draw[fill=blue!60] (1.7,0) rectangle (2.4,3);
  \\draw[fill=blue!60] (2.9,0) rectangle (3.6,2.2);
  \\node at (0.85,-0.3) {Ene};
  \\node at (2.05,-0.3) {Feb};
  \\node at (3.25,-0.3) {Mar};
\\end{tikzpicture}
`,
  },
  {
    label: 'Patrón/relleno',
    code: `\\begin{tikzpicture}
  \\draw[pattern=north east lines] (0,0) rectangle (2,2);
  \\draw[pattern=dots] (2.5,0) rectangle (4.5,2);
\\end{tikzpicture}
`,
  },
] as const;

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
      examples={
        <ExamplesMenu
          examples={EXAMPLES}
          onSelect={(exampleCode) => {
            setCode(exampleCode);
            render(exampleCode);
          }}
        />
      }
      actions={
        <>
          <OpenFileButton
            accept=".tex,.txt"
            label="Abrir .tex"
            onOpen={(text) => {
              setCode(text);
              render(text);
            }}
          />
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
