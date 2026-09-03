import { useEffect, useRef, useState } from 'react';
import { Graphviz } from '@hpcc-js/wasm-graphviz';
import { EditorLayout, toolbarBtn, toolbarSelect, toolbarOption } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { ExamplesMenu } from '../ExamplesMenu';
import { downloadText } from '../export';
import { useI18n } from '../i18n';

const STYLE_PRESETS = {
  none: '',
  claro: 'graph [bgcolor="white" fontname="Helvetica"]; node [shape=box, style="filled,rounded", fillcolor="#e0f2fe", color="#0284c7", fontname="Helvetica"]; edge [color="#0284c7"];',
  oscuro: 'graph [bgcolor="#0a0b0e" fontcolor="#c0caf5" fontname="Helvetica"]; node [shape=box, style="filled,rounded", fillcolor="#1f2335", fontcolor="#c0caf5", color="#7aa2f7", fontname="Helvetica"]; edge [color="#7aa2f7", fontcolor="#c0caf5"];',
  pastel: 'graph [bgcolor="#fdf6f0" fontname="Helvetica"]; node [shape=box, style="filled,rounded", fillcolor="#fde2e4", color="#c9184a", fontname="Helvetica"]; edge [color="#c9184a"];',
} as const;

type StylePreset = keyof typeof STYLE_PRESETS;

const CODE_EXAMPLES = {
  es: {
    simple: `digraph G {
  rankdir=LR;
  Inicio -> Proceso -> Fin;
}`,
    subgraphs: `digraph G {
  subgraph cluster_0 {
    label="Frontend";
    App -> API;
  }
  subgraph cluster_1 {
    label="Backend";
    API -> DB;
  }
}`,
    undirected: `graph G {
  A -- B;
  B -- C;
  C -- A;
}`,
    tree: `digraph G {
  CEO -> Ventas;
  CEO -> Ingeniería;
  Ingeniería -> Frontend;
  Ingeniería -> Backend;
  Ventas -> "Cuentas Clave";
}`,
    record: `digraph G {
  node [shape=record];
  usuario [label="Usuario|+id: int\\l+nombre: string\\l"];
  pedido [label="Pedido|+id: int\\l+total: float\\l"];
  usuario -> pedido;
}`,
    circo: `digraph G {
  layout=circo;
  A -> B -> C -> D -> A;
  A -> C;
}`,
    twopi: `digraph G {
  layout=twopi;
  root -- a; root -- b; root -- c;
  a -- a1; a -- a2;
  b -- b1;
}`,
  },
  en: {
    simple: `digraph G {
  rankdir=LR;
  Start -> Process -> End;
}`,
    subgraphs: `digraph G {
  subgraph cluster_0 {
    label="Frontend";
    App -> API;
  }
  subgraph cluster_1 {
    label="Backend";
    API -> DB;
  }
}`,
    undirected: `graph G {
  A -- B;
  B -- C;
  C -- A;
}`,
    tree: `digraph G {
  CEO -> Sales;
  CEO -> Engineering;
  Engineering -> Frontend;
  Engineering -> Backend;
  Sales -> "Key Accounts";
}`,
    record: `digraph G {
  node [shape=record];
  user [label="User|+id: int\\l+name: string\\l"];
  order [label="Order|+id: int\\l+total: float\\l"];
  user -> order;
}`,
    circo: `digraph G {
  layout=circo;
  A -> B -> C -> D -> A;
  A -> C;
}`,
    twopi: `digraph G {
  layout=twopi;
  root -- a; root -- b; root -- c;
  a -- a1; a -- a2;
  b -- b1;
}`,
  },
};

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
  const { t, language } = useI18n();
  const outRef = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState(() => CODE_EXAMPLES[language].simple);
  const [style, setStyle] = useState<StylePreset>('oscuro');
  const [svgMarkup, setSvgMarkup] = useState('');
  const [error, setError] = useState<string | null>(null);

  const examples = [
    { label: t.graphviz.examples.simple, code: CODE_EXAMPLES[language].simple },
    { label: t.graphviz.examples.subgraphs, code: CODE_EXAMPLES[language].subgraphs },
    { label: t.graphviz.examples.undirected, code: CODE_EXAMPLES[language].undirected },
    { label: t.graphviz.examples.tree, code: CODE_EXAMPLES[language].tree },
    { label: t.graphviz.examples.record, code: CODE_EXAMPLES[language].record },
    { label: t.graphviz.examples.circo, code: CODE_EXAMPLES[language].circo },
    { label: t.graphviz.examples.twopi, code: CODE_EXAMPLES[language].twopi },
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
        render(nextCode, style);
      }
    }
  }, [language, code, style]);

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
    render(CODE_EXAMPLES[language].simple, style);
  }, []);

  return (
    <EditorLayout
      examples={
        <ExamplesMenu
          examples={examples}
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
            label={t.openFileBtn('.dot')}
            onOpen={(text) => {
              setCode(text);
              render(text, style);
            }}
          />
          <button className={toolbarBtn} onClick={() => render(code, style)}>{t.renderBtn}</button>
          <select
            className={toolbarSelect}
            value={style}
            onChange={(e) => {
              const s = e.target.value as StylePreset;
              setStyle(s);
              render(code, s);
            }}
          >
            {(Object.keys(STYLE_PRESETS) as StylePreset[]).map((s) => (
              <option key={s} value={s} className={toolbarOption}>{t.graphviz.presets[s] ?? s}</option>
            ))}
          </select>
          <button className={toolbarBtn} onClick={() => downloadText(code, 'diagrama.dot')}>
            {t.downloadFileBtn('.dot')}
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
