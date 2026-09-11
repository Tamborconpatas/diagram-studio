import { useEffect, useRef, useState } from 'react';
import pikchr from 'pikchr-wasm';
import { EditorLayout, toolbarBtn } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { ExamplesMenu } from '../ExamplesMenu';
import { downloadText } from '../export';
import { useI18n } from '../i18n';

// pikchr-wasm's port doesn't support object labels (`D: diamond ...` /
// `last diamond.e`) or the diamond shape — both error out ("no such
// variable" / "syntax error") even though real Pikchr supports them fine.
// Stick to box/circle/arrow chains in examples.
const CODE_EXAMPLES = {
  flow: `box "Start"
arrow
box "Process" fit
arrow
box "End"
`,
  colors: `circle "A" fill lightblue
arrow right
circle "B" fill lightgreen
arrow right
circle "C" fill lightyellow
`,
};

let loadPromise: Promise<void> | null = null;
function ensureLoaded() {
  loadPromise ??= pikchr.loadWASM();
  return loadPromise;
}

export default function PikchrEditor() {
  const { t } = useI18n();
  const outRef = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState(() => CODE_EXAMPLES.flow);
  const [svgMarkup, setSvgMarkup] = useState('');
  const [error, setError] = useState<string | null>(null);

  const examples = [
    { label: t.pikchr.examples.flow, code: CODE_EXAMPLES.flow },
    { label: t.pikchr.examples.colors, code: CODE_EXAMPLES.colors },
  ];

  const render = async (src: string) => {
    try {
      await ensureLoaded();
      const svg = pikchr.render(src);
      setSvgMarkup(svg);
      if (outRef.current) outRef.current.innerHTML = svg;
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  useEffect(() => {
    render(CODE_EXAMPLES.flow);
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
            accept=".pikchr,.txt"
            label={t.openFileBtn('.pikchr')}
            onOpen={(text) => {
              setCode(text);
              render(text);
            }}
          />
          <button className={toolbarBtn} onClick={() => render(code)}>{t.renderBtn}</button>
          <button className={toolbarBtn} onClick={() => downloadText(code, 'diagrama.pikchr')}>
            {t.downloadFileBtn('.pikchr')}
          </button>
          <ExportButtons filename="diagrama-pikchr" getSvg={async () => svgMarkup} />
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
