import { useEffect, useRef, useState } from 'react';
import { renderAbc } from 'abcjs';
import { EditorLayout, toolbarBtn } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { ExamplesMenu } from '../ExamplesMenu';
import { downloadText } from '../export';
import { useI18n } from '../i18n';

const CODE_EXAMPLES = {
  scale: `X:1
T:Escala simple
M:4/4
L:1/4
K:C
C D E F | G A B c |
`,
  tune: `X:1
T:Ode to Joy (fragmento)
M:4/4
L:1/4
K:D
F F G A | A G F E | D D E F | F3/2 E/2 E2 |
`,
};

export default function AbcEditor() {
  const { t } = useI18n();
  const outRef = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState(() => CODE_EXAMPLES.scale);
  const [svgMarkup, setSvgMarkup] = useState('');
  const [error, setError] = useState<string | null>(null);

  const examples = [
    { label: t.abc.examples.scale, code: CODE_EXAMPLES.scale },
    { label: t.abc.examples.tune, code: CODE_EXAMPLES.tune },
  ];

  const render = (src: string) => {
    if (!outRef.current) return;
    try {
      renderAbc(outRef.current, src);
      const svg = outRef.current.querySelector('svg');
      setSvgMarkup(svg ? svg.outerHTML : '');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  useEffect(() => {
    render(CODE_EXAMPLES.scale);
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
            accept=".abc,.txt"
            label={t.openFileBtn('.abc')}
            onOpen={(text) => {
              setCode(text);
              render(text);
            }}
          />
          <button className={toolbarBtn} onClick={() => render(code)}>{t.renderBtn}</button>
          <button className={toolbarBtn} onClick={() => downloadText(code, 'partitura.abc')}>
            {t.downloadFileBtn('.abc')}
          </button>
          <ExportButtons filename="diagrama-abc" getSvg={async () => svgMarkup} />
        </>
      }
      error={error}
      code={code}
      onCodeChange={setCode}
      onAutoRender={(src) => render(src)}
      renderArea={
        <div
          ref={outRef}
          className="w-full h-full overflow-auto p-6 bg-white [&_svg]:max-w-none"
        />
      }
    />
  );
}
