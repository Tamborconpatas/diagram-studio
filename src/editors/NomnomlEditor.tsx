import { useEffect, useRef, useState } from 'react';
import { renderSvg } from 'nomnoml';
import { EditorLayout, toolbarBtn } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { ExamplesMenu } from '../ExamplesMenu';
import { downloadText } from '../export';
import { useI18n } from '../i18n';

const DEFAULT_CODE = `[<abstract>Shape]
[Shape]<:--[Circle]
[Shape]<:--[Square]
[Circle]->[Point]
[Circle|radius: float|area()]
`;

const CODE_EXAMPLES = {
  es: {
    inheritance: DEFAULT_CODE,
    association: `[Usuario|+nombre: string|+login()]
[Pedido|+fecha: date|+total()]
[Usuario] 1 -- * [Pedido]
`,
    notePackage: `[<frame>Módulo Auth|
  [Login]
  [Token]
  [Login] -> [Token]
]
[<note>Requiere HTTPS] -- [Login]
`,
    state: `[<start>Inicio] -> [<state>Activo]
[<state>Activo] -> [<state>Pausado]: pausar
[<state>Pausado] -> [<state>Activo]: reanudar
[<state>Activo] -> [<end>Fin]: terminar
`,
  },
  en: {
    inheritance: DEFAULT_CODE,
    association: `[User|+name: string|+login()]
[Order|+date: date|+total()]
[User] 1 -- * [Order]
`,
    notePackage: `[<frame>Auth Module|
  [Login]
  [Token]
  [Login] -> [Token]
]
[<note>Requires HTTPS] -- [Login]
`,
    state: `[<start>Start] -> [<state>Active]
[<state>Active] -> [<state>Paused]: pause
[<state>Paused] -> [<state>Active]: resume
[<state>Active] -> [<end>End]: terminate
`,
  },
};

export default function NomnomlEditor() {
  const { t, language } = useI18n();
  const [code, setCode] = useState(DEFAULT_CODE);
  const [svgMarkup, setSvgMarkup] = useState('');
  const [error, setError] = useState<string | null>(null);

  const examples = [
    { label: t.nomnoml.examples.inheritance, code: CODE_EXAMPLES[language].inheritance },
    { label: t.nomnoml.examples.association, code: CODE_EXAMPLES[language].association },
    { label: t.nomnoml.examples.notePackage, code: CODE_EXAMPLES[language].notePackage },
    { label: t.nomnoml.examples.state, code: CODE_EXAMPLES[language].state },
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

  const render = (src: string) => {
    try {
      setSvgMarkup(renderSvg(src));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
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
            accept=".nomnoml,.txt"
            label={t.openFileBtn('.nomnoml')}
            onOpen={(text) => {
              setCode(text);
              render(text);
            }}
          />
          <button className={toolbarBtn} onClick={() => render(code)}>{t.renderBtn}</button>
          <button className={toolbarBtn} onClick={() => downloadText(code, 'diagrama.nomnoml')}>
            {t.downloadFileBtn('.nomnoml')}
          </button>
          <ExportButtons filename="diagrama-nomnoml" getSvg={async () => svgMarkup} />
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
