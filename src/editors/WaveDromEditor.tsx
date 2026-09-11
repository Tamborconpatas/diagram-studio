import { useEffect, useRef, useState } from 'react';
import { renderAny, waveSkin } from 'wavedrom';
import { stringify } from 'onml';
import JSON5 from 'json5';
import { EditorLayout, toolbarBtn } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { ExamplesMenu } from '../ExamplesMenu';
import { downloadText } from '../export';
import { useI18n } from '../i18n';

const CODE_EXAMPLES = {
  clock: `{ signal: [
  { name: "clk", wave: "P......" },
  { name: "data", wave: "x.==.=x", data: ["head", "body", "tail", "data"] },
  { name: "wire", wave: "0.1..0." },
]}
`,
  request: `{ signal: [
  { name: "req", wave: "01.0...." },
  { name: "ack", wave: "0..1..0." },
  {},
  { name: "state", wave: "=.=.=.=.", data: ["idle", "req", "busy", "done"] },
]}
`,
  edges: `{ signal: [
  { name: "A", wave: "01..0..1" },
  { name: "B", wave: "0..1..0." },
],
  edge: ["A|B t1", "A+B t2"],
}
`,
};

export default function WaveDromEditor() {
  const { t } = useI18n();
  const outRef = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState(() => CODE_EXAMPLES.clock);
  const [svgMarkup, setSvgMarkup] = useState('');
  const [error, setError] = useState<string | null>(null);

  const examples = [
    { label: t.wavedrom.examples.clock, code: CODE_EXAMPLES.clock },
    { label: t.wavedrom.examples.request, code: CODE_EXAMPLES.request },
    { label: t.wavedrom.examples.edges, code: CODE_EXAMPLES.edges },
  ];

  const render = (src: string) => {
    try {
      const source = JSON5.parse(src);
      const res = renderAny(0, source, waveSkin);
      const svg = stringify(res);
      setSvgMarkup(svg);
      if (outRef.current) outRef.current.innerHTML = svg;
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  useEffect(() => {
    render(CODE_EXAMPLES.clock);
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
            accept=".json5,.json,.txt"
            label={t.openFileBtn('.json5')}
            onOpen={(text) => {
              setCode(text);
              render(text);
            }}
          />
          <button className={toolbarBtn} onClick={() => render(code)}>{t.renderBtn}</button>
          <button className={toolbarBtn} onClick={() => downloadText(code, 'diagrama.json5')}>
            {t.downloadFileBtn('.json5')}
          </button>
          <ExportButtons filename="diagrama-wavedrom" getSvg={async () => svgMarkup} />
        </>
      }
      error={error}
      code={code}
      onCodeChange={setCode}
      onAutoRender={(src) => render(src)}
      renderArea={
        <div
          ref={outRef}
          className="w-full h-full flex items-center justify-center overflow-auto p-6 bg-white [&_svg]:max-w-none"
        />
      }
    />
  );
}
