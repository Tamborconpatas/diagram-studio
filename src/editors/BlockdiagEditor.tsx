import { useEffect, useRef, useState } from 'react';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { ExamplesMenu } from '../ExamplesMenu';
import { downloadText } from '../export';
import { useI18n } from '../i18n';

const CODE_EXAMPLES = {
  es: {
}
`,
    colors: `blockdiag {
  A [color = "#e0f2fe"];
  B [color = "#dcfce7"];
  C [color = "#fef3c7"];
  A -> B -> C;
}
  group {
    label = "Frontend";
    App; UI;
  }
  group {
    label = "Backend";
    API; DB;
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
  en: {
    simple: `blockdiag {
  Client -> Server -> Database;
  Server -> Cache;
}
`,
    colors: `blockdiag {
  A [color = "#e0f2fe"];
  const examples = [
    { label: t.blockdiag.examples.simple, code: CODE_EXAMPLES[language].simple },
    { label: t.blockdiag.examples.colors, code: CODE_EXAMPLES[language].colors },
    { label: t.blockdiag.examples.groups, code: CODE_EXAMPLES[language].groups },
    { label: t.blockdiag.examples.shapes, code: CODE_EXAMPLES[language].shapes },
  const prevLangRef = useRef(language);
  useEffect(() => {
    if (prevLangRef.current !== language) {
      const prevLang = prevLangRef.current;
      prevLangRef.current = language;
      const prevCodes = Object.values(CODE_EXAMPLES[prevLang]);
      const nextCodes = Object.values(CODE_EXAMPLES[language]);
      const idx = prevCodes.indexOf(code);
      if (idx !== -1) {
    }
  }, [language, code]);
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
      renderArea={
        <div
          className="w-full h-full flex items-center justify-center overflow-auto p-6 bg-white [&_svg]:max-w-none"
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
      }
    />
  );
}
