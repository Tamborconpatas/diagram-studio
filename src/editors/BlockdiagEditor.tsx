import { useEffect, useRef, useState } from 'react';
import { EditorLayout, toolbarBtn } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { ExamplesMenu } from '../ExamplesMenu';
import { downloadText } from '../export';
import { useI18n } from '../i18n';

const CODE_EXAMPLES = {
  es: {
    simple: `blockdiag {
  Cliente -> Servidor -> Base_de_datos;
  Servidor -> Cache;
}
`,
    colors: `blockdiag {
  A [color = "#e0f2fe"];
  B [color = "#dcfce7"];
  C [color = "#fef3c7"];
  A -> B -> C;
}
`,
    groups: `blockdiag {
  group {
    label = "Frontend";
    App; UI;
  }
  group {
    label = "Backend";
    API; DB;
  }
  App -> API -> DB;
  UI -> API;
}
`,
    shapes: `blockdiag {
  Inicio [shape = beginpoint];
  Decision [shape = diamond];
  Proceso [shape = box];
  Fin [shape = endpoint];
  Inicio -> Decision -> Proceso -> Fin;
  Decision -> Fin [style = dashed, label = "atajo"];
}
`,
  },
  en: {
    simple: `blockdiag {
  Client -> Server -> Database;
  Server -> Cache;
}
`,
    colors: `blockdiag {
  A [color = "#e0f2fe"];
  B [color = "#dcfce7"];
  C [color = "#fef3c7"];
  A -> B -> C;
}
`,
    groups: `blockdiag {
  group {
    label = "Frontend";
    App; UI;
  }
  group {
    label = "Backend";
    API; DB;
  }
  App -> API -> DB;
  UI -> API;
}
`,
    shapes: `blockdiag {
  Start [shape = beginpoint];
  Decision [shape = diamond];
  Process [shape = box];
  End [shape = endpoint];
  Start -> Decision -> Process -> End;
  Decision -> End [style = dashed, label = "shortcut"];
}
`,
  },
};

export default function BlockdiagEditor() {
  const { t, language } = useI18n();
  const [code, setCode] = useState(() => CODE_EXAMPLES[language].simple);
  const [svgMarkup, setSvgMarkup] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const examples = [
    { label: t.blockdiag.examples.simple, code: CODE_EXAMPLES[language].simple },
    { label: t.blockdiag.examples.colors, code: CODE_EXAMPLES[language].colors },
    { label: t.blockdiag.examples.groups, code: CODE_EXAMPLES[language].groups },
    { label: t.blockdiag.examples.shapes, code: CODE_EXAMPLES[language].shapes },
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
      const res = await fetch('/api/render-blockdiag', {
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
            accept=".diag,.txt"
            label={t.openFileBtn('.diag')}
            onOpen={(text) => {
              setCode(text);
              render(text);
            }}
          />
          <button className={toolbarBtn} onClick={() => render(code)} disabled={loading}>
            {loading ? t.renderingBtn : t.renderBtn}
          </button>
          <button className={toolbarBtn} onClick={() => downloadText(code, 'diagrama.diag')}>
            {t.downloadFileBtn('.diag')}
          </button>
          <ExportButtons filename="diagrama-blockdiag" getSvg={async () => svgMarkup} />
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
