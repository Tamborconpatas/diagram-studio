import { useEffect, useRef, useState } from 'react';
import { Graphviz } from '@hpcc-js/wasm-graphviz';
import { EditorLayout, toolbarBtn, toolbarSelect } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { ExamplesMenu } from '../ExamplesMenu';
import { downloadText } from '../export';

const STYLE_PRESETS = {
  none: '',
  claro: 'graph [bgcolor="white" fontname="Helvetica"]; node [shape=box, style="filled,rounded", fillcolor="#e0f2fe", color="#0284c7", fontname="Helvetica"]; edge [color="#0284c7"];',
  oscuro: 'graph [bgcolor="#0a0b0e" fontcolor="#c0caf5" fontname="Helvetica"]; node [shape=box, style="filled,rounded", fillcolor="#1f2335", fontcolor="#c0caf5", color="#7aa2f7", fontname="Helvetica"]; edge [color="#7aa2f7", fontcolor="#c0caf5"];',
  pastel: 'graph [bgcolor="#fdf6f0" fontname="Helvetica"]; node [shape=box, style="filled,rounded", fillcolor="#fde2e4", color="#c9184a", fontname="Helvetica"]; edge [color="#c9184a"];',
} as const;

type StylePreset = keyof typeof STYLE_PRESETS;

const DEFAULT_CODE = `digraph G {
  rankdir=LR;
  Inicio -> Proceso -> Fin;
}`;

const EXAMPLES = [
  { label: 'Grafo simple', code: DEFAULT_CODE },
  {
    label: 'Subgrafos/clusters',
    code: `digraph G {
  subgraph cluster_0 {
    label="Frontend";
    App -> API;
  }
  subgraph cluster_1 {
    label="Backend";
    API -> DB;
  }
}`,
  },
  {
    label: 'No dirigido',
    code: `graph G {
  A -- B;
  B -- C;
  C -- A;
}`,
  },
] as const;

function withStyle(dot: string, preset: StylePreset) {
  const inject = STYLE_PRESETS[preset];
  if (!inject) return dot;
  return dot.replace('{', `{\n  ${inject}\n`);
}

let graphvizPromise: Promise<Graphviz> | null = null;
function loadGraphviz() {
  graphvizPromise ??= Graphviz.load();
  return graphvizPromise;
}

export default function GraphvizEditor() {
  const outRef = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [style, setStyle] = useState<StylePreset>('oscuro');
  const [svgMarkup, setSvgMarkup] = useState('');
  const [error, setError] = useState<string | null>(null);

  const render = async (src: string, preset: StylePreset) => {
    try {
      const graphviz = await loadGraphviz();
      const svg = graphviz.dot(withStyle(src, preset), 'svg');
      setSvgMarkup(svg);
      if (outRef.current) outRef.current.innerHTML = svg;
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  useEffect(() => {
    render(DEFAULT_CODE, style);
  }, []);

  return (
    <EditorLayout
      examples={
        <ExamplesMenu
          examples={EXAMPLES}
          onSelect={(exampleCode) => {
            setCode(exampleCode);
            render(exampleCode, style);
          }}
        />
      }
      actions={
        <>
          <OpenFileButton
            accept=".dot,.gv,.txt"
            label="Abrir .dot"
            onOpen={(text) => {
              setCode(text);
              render(text, style);
            }}
          />
          <button className={toolbarBtn} onClick={() => render(code, style)}>Renderizar</button>
          <select
            className={toolbarSelect}
            value={style}
            onChange={(e) => {
              const s = e.target.value as StylePreset;
              setStyle(s);
              render(code, s);
            }}
          >
            {Object.keys(STYLE_PRESETS).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button className={toolbarBtn} onClick={() => downloadText(code, 'diagrama.dot')}>
            Descargar .dot
          </button>
          <ExportButtons filename="diagrama-graphviz" getSvg={async () => svgMarkup} />
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
