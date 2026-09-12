import { useEffect, useRef, useState } from 'react';
import embed from 'vega-embed';
import { EditorLayout, toolbarBtn } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { ExamplesMenu } from '../ExamplesMenu';
import { downloadText } from '../export';
import { useI18n } from '../i18n';

const CODE_EXAMPLES = {
  bar: `{
  "data": {
    "values": [
      {"categoria": "A", "valor": 28},
      {"categoria": "B", "valor": 55},
      {"categoria": "C", "valor": 43},
      {"categoria": "D", "valor": 91}
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {"field": "categoria", "type": "nominal"},
    "y": {"field": "valor", "type": "quantitative"}
  }
}
`,
  line: `{
  "data": {
    "values": [
      {"mes": "Ene", "ventas": 20},
      {"mes": "Feb", "ventas": 35},
      {"mes": "Mar", "ventas": 30},
      {"mes": "Abr", "ventas": 50},
      {"mes": "May", "ventas": 45}
    ]
  },
  "mark": {"type": "line", "point": true},
  "encoding": {
    "x": {"field": "mes", "type": "ordinal", "sort": null},
    "y": {"field": "ventas", "type": "quantitative"}
  }
}
`,
  scatter: `{
  "data": {
    "values": [
      {"x": 1, "y": 3, "grupo": "A"},
      {"x": 2, "y": 5, "grupo": "A"},
      {"x": 3, "y": 4, "grupo": "B"},
      {"x": 4, "y": 8, "grupo": "B"},
      {"x": 5, "y": 6, "grupo": "A"},
      {"x": 6, "y": 9, "grupo": "B"}
    ]
  },
  "mark": "point",
  "encoding": {
    "x": {"field": "x", "type": "quantitative"},
    "y": {"field": "y", "type": "quantitative"},
    "color": {"field": "grupo", "type": "nominal"}
  }
}
`,
};

export default function VegaLiteEditor() {
  const { t } = useI18n();
  const outRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<import('vega').View | null>(null);
  const [code, setCode] = useState(() => CODE_EXAMPLES.bar);
  const [error, setError] = useState<string | null>(null);

  const examples = [
    { label: t.vegalite.examples.bar, code: CODE_EXAMPLES.bar },
    { label: t.vegalite.examples.line, code: CODE_EXAMPLES.line },
    { label: t.vegalite.examples.scatter, code: CODE_EXAMPLES.scatter },
  ];

  const render = async (src: string) => {
    if (!outRef.current) return;
    try {
      const spec = JSON.parse(src);
      const result = await embed(outRef.current, spec, { mode: 'vega-lite', actions: false, renderer: 'svg' });
      viewRef.current = result.view;
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const getSvg = async () => (viewRef.current ? viewRef.current.toSVG() : '');

  useEffect(() => {
    render(CODE_EXAMPLES.bar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            accept=".json,.vl.json,.txt"
            label={t.openFileBtn('.json')}
            onOpen={(text) => {
              setCode(text);
              render(text);
            }}
          />
          <button className={toolbarBtn} onClick={() => render(code)}>{t.renderBtn}</button>
          <button className={toolbarBtn} onClick={() => downloadText(code, 'grafico.vl.json')}>
            {t.downloadFileBtn('.json')}
          </button>
          <ExportButtons filename="diagrama-vegalite" getSvg={getSvg} />
        </>
      }
      error={error}
      code={code}
      onCodeChange={setCode}
      onAutoRender={(src) => render(src)}
      renderArea={
        <div
          ref={outRef}
          className="w-full h-full flex items-center justify-center overflow-auto p-6 bg-white"
        />
      }
    />
  );
}
