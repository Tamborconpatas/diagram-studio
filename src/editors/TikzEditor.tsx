import { useEffect, useRef, useState } from 'react';
import { EditorLayout, toolbarBtn } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { ExamplesMenu } from '../ExamplesMenu';
import { downloadText } from '../export';
import { useI18n } from '../i18n';

const DEFAULT_CODE = `\\begin{tikzpicture}
  \\node[draw, circle] (a) {A};
  \\node[draw, circle, right=2cm of a] (b) {B};
  \\draw[-{Latex}] (a) -- (b);
\\end{tikzpicture}
`;

const CODE_EXAMPLES = {
  es: {
    nodesArrow: DEFAULT_CODE,
    math: `\\begin{tikzpicture}
  \\draw[->] (-0.2,0) -- (3.2,0) node[right] {$x$};
  \\draw[->] (0,-0.2) -- (0,3.2) node[above] {$y$};
  \\draw[domain=0:3, smooth, variable=\\x, blue] plot ({\\x}, {\\x*\\x/3});
\\end{tikzpicture}
`,
    tree: `\\begin{tikzpicture}[level distance=1.5cm, sibling distance=2.2cm]
  \\node {Raíz}
    child { node {Hijo A}
      child { node {A1} }
      child { node {A2} } }
    child { node {Hijo B} };
\\end{tikzpicture}
`,
    venn: `\\begin{tikzpicture}
  \\draw[fill=blue, opacity=0.4] (0,0) circle (1.5cm);
  \\draw[fill=red, opacity=0.4] (1.5,0) circle (1.5cm);
  \\node at (-0.6,0) {A};
  \\node at (2.1,0) {B};
  \\node at (0.75,0) {A∩B};
\\end{tikzpicture}
`,
    bars: `\\begin{tikzpicture}
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
    pattern: `\\begin{tikzpicture}
  \\draw[pattern=north east lines] (0,0) rectangle (2,2);
  \\draw[pattern=dots] (2.5,0) rectangle (4.5,2);
\\end{tikzpicture}
`,
  },
  en: {
    nodesArrow: DEFAULT_CODE,
    math: `\\begin{tikzpicture}
  \\draw[->] (-0.2,0) -- (3.2,0) node[right] {$x$};
  \\draw[->] (0,-0.2) -- (0,3.2) node[above] {$y$};
  \\draw[domain=0:3, smooth, variable=\\x, blue] plot ({\\x}, {\\x*\\x/3});
\\end{tikzpicture}
`,
    tree: `\\begin{tikzpicture}[level distance=1.5cm, sibling distance=2.2cm]
  \\node {Root}
    child { node {Child A}
      child { node {A1} }
      child { node {A2} } }
    child { node {Child B} };
\\end{tikzpicture}
`,
    venn: `\\begin{tikzpicture}
  \\draw[fill=blue, opacity=0.4] (0,0) circle (1.5cm);
  \\draw[fill=red, opacity=0.4] (1.5,0) circle (1.5cm);
  \\node at (-0.6,0) {A};
  \\node at (2.1,0) {B};
  \\node at (0.75,0) {A∩B};
\\end{tikzpicture}
`,
    bars: `\\begin{tikzpicture}
  \\draw[->] (0,0) -- (5,0);
  \\draw[->] (0,0) -- (0,4);
  \\draw[fill=blue!60] (0.5,0) rectangle (1.2,1.5);
  \\draw[fill=blue!60] (1.7,0) rectangle (2.4,3);
  \\draw[fill=blue!60] (2.9,0) rectangle (3.6,2.2);
  \\node at (0.85,-0.3) {Jan};
  \\node at (2.05,-0.3) {Feb};
  \\node at (3.25,-0.3) {Mar};
\\end{tikzpicture}
`,
    pattern: `\\begin{tikzpicture}
  \\draw[pattern=north east lines] (0,0) rectangle (2,2);
  \\draw[pattern=dots] (2.5,0) rectangle (4.5,2);
\\end{tikzpicture}
`,
  },
};

export default function TikzEditor() {
  const { t, language } = useI18n();
  const [code, setCode] = useState(DEFAULT_CODE);
  const [svgMarkup, setSvgMarkup] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const examples = [
    { label: t.tikz.examples.nodesArrow, code: CODE_EXAMPLES[language].nodesArrow },
    { label: t.tikz.examples.math, code: CODE_EXAMPLES[language].math },
    { label: t.tikz.examples.tree, code: CODE_EXAMPLES[language].tree },
    { label: t.tikz.examples.venn, code: CODE_EXAMPLES[language].venn },
    { label: t.tikz.examples.bars, code: CODE_EXAMPLES[language].bars },
    { label: t.tikz.examples.pattern, code: CODE_EXAMPLES[language].pattern },
  ];

  const prevLangRef = useRef(language);
  useEffect(() => {
    if (prevLangRef.current !== language) {
      const prevLang = prevLangRef.current;
      prevLangRef.current = language;
      const prevCodes = Object.values(CODE_EXAMPLES[prevLang]);
      const nextCodes = Object.values(CODE_EXAMPLES[language]);
      const idx = prevCodes.indexOf(code);
      if (idx !== -1) {
        const nextCode = nextCodes[idx];
        setCode(nextCode);
        render(nextCode);
      }
    }
  }, [language, code]);

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
          examples={examples}
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
            label={t.openFileBtn('.tex')}
            onOpen={(text) => {
              setCode(text);
              render(text);
            }}
          />
          <button className={toolbarBtn} onClick={() => render(code)} disabled={loading}>
            {loading ? t.compilingBtn : t.renderBtn}
          </button>
          <button className={toolbarBtn} onClick={() => downloadText(code, 'diagrama.tex')}>
            {t.downloadFileBtn('.tex')}
          </button>
          <ExportButtons filename="diagrama-tikz" getSvg={async () => svgMarkup} />
        </>
      }
      error={error}
      code={code}
      onCodeChange={setCode}
      onAutoRender={(src) => render(src)}
      renderArea={
        <div
          className="w-full h-full flex items-center justify-center overflow-auto p-6 bg-white [&_svg]:max-w-none"
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
      }
    />
  );
}
