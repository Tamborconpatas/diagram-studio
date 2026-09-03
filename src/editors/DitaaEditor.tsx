import { useEffect, useRef, useState } from 'react';
import { EditorLayout, toolbarBtn } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { ExamplesMenu } from '../ExamplesMenu';
import { downloadText } from '../export';
import { useI18n } from '../i18n';

const CODE_EXAMPLES = {
  es: {
    simple: `+--------+   +----------+   +-------+
| Cliente|-->| Servidor |-->|  DB   |
+--------+   +----------+   +-------+
`,
    decision: `+---------+
| Entrada |
+---------+
     |
     v
 /--------\\
< ¿Válido? >
 \\--------/
   |     |
  Sí     No
   |     |
   v     v
+-----+ +-------+
| OK  | | Error |
+-----+ +-------+
`,
    colors: `+------------+
| cREDCache  |
+------------+
     |
     v
+------------+
| cGREOrigen |
+------------+
     |
     v
+------------+
|  cBLULog   |
+------------+
`,
    rounded: `/---------\\
| Sistema |
\\---------/
     |
     v
/-----------\\
| Respuesta |
\\-----------/
`,
  },
  en: {
    simple: `+--------+   +----------+   +-------+
| Client |-->|  Server  |-->|  DB   |
+--------+   +----------+   +-------+
`,
    decision: `+---------+
|  Input  |
+---------+
     |
     v
 /--------\\
<  Valid?  >
 \\--------/
   |     |
  Yes    No
   |     |
   v     v
+-----+ +-------+
| OK  | | Error |
+-----+ +-------+
`,
    colors: `+------------+
| cREDCache  |
+------------+
     |
     v
+------------+
| cGREOrigin |
+------------+
     |
     v
+------------+
|  cBLULog   |
+------------+
`,
    rounded: `/---------\\
| System  |
\\---------/
     |
     v
/-----------\\
| Response  |
\\-----------/
`,
  },
};

export default function DitaaEditor() {
  const { t, language } = useI18n();
  const [code, setCode] = useState(() => CODE_EXAMPLES[language].simple);
  const [svgMarkup, setSvgMarkup] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const examples = [
    { label: t.ditaa.examples.simple, code: CODE_EXAMPLES[language].simple },
    { label: t.ditaa.examples.decision, code: CODE_EXAMPLES[language].decision },
    { label: t.ditaa.examples.colors, code: CODE_EXAMPLES[language].colors },
    { label: t.ditaa.examples.rounded, code: CODE_EXAMPLES[language].rounded },
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
      const res = await fetch('/api/render-ditaa', {
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
    render(CODE_EXAMPLES[language].simple);
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
            accept=".ditaa,.txt"
            label={t.openFileBtn('.ditaa')}
            onOpen={(text) => {
              setCode(text);
              render(text);
            }}
          />
          <button className={toolbarBtn} onClick={() => render(code)} disabled={loading}>
            {loading ? t.renderingBtn : t.renderBtn}
          </button>
          <button className={toolbarBtn} onClick={() => downloadText(code, 'diagrama.ditaa')}>
            {t.downloadFileBtn('.ditaa')}
          </button>
          <ExportButtons filename="diagrama-ditaa" getSvg={async () => svgMarkup} />
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
