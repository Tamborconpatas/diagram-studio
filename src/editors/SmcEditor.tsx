import { useEffect, useRef, useState } from 'react';
import { EditorLayout, toolbarBtn } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { ExamplesMenu } from '../ExamplesMenu';
import { downloadText } from '../export';
import { useI18n } from '../i18n';

const DEFAULT_CODE = `%class Turnstile
%start MainMap::Locked
%map MainMap
%%
Locked
{
  coin Unlocked { unlock(); }
  pass nil { alarm(); }
}
Unlocked
{
  pass Locked { lock(); }
  coin nil { thankyou(); }
}
%%
`;

const CODE_EXAMPLES = {
  es: {
    turnstile: DEFAULT_CODE,
    trafficLight: `%class Semaforo
%start MainMap::Rojo
%map MainMap
%%
Rojo
{
  siguiente Verde { encenderVerde(); }
}
Verde
{
  siguiente Amarillo { encenderAmarillo(); }
}
Amarillo
{
  siguiente Rojo { encenderRojo(); }
}
%%
`,
    guards: `%class Cajero
%start MainMap::Esperando
%map MainMap
%%
Esperando
{
  ingresarPin [saldoDisponible()] Validado { mostrarMenu(); }
  ingresarPin [!saldoDisponible()] Bloqueado { alertar(); }
}
Validado
{
  retirar Esperando { entregarEfectivo(); }
}
Bloqueado
{
}
%%
`,
  },
  en: {
    turnstile: DEFAULT_CODE,
    trafficLight: `%class TrafficLight
%start MainMap::Red
%map MainMap
%%
Red
{
  next Green { turnGreen(); }
}
Green
{
  next Yellow { turnYellow(); }
}
Yellow
{
  next Red { turnRed(); }
}
%%
`,
    guards: `%class ATM
%start MainMap::Waiting
%map MainMap
%%
Waiting
{
  enterPin [hasBalance()] Validated { showMenu(); }
  enterPin [!hasBalance()] Blocked { alert(); }
}
Validated
{
  withdraw Waiting { dispenseCash(); }
}
Blocked
{
}
%%
`,
  },
};

export default function SmcEditor() {
  const { t, language } = useI18n();
  const [code, setCode] = useState(DEFAULT_CODE);
  const [svgMarkup, setSvgMarkup] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const examples = [
    { label: t.smc.examples.turnstile, code: CODE_EXAMPLES[language].turnstile },
    { label: t.smc.examples.trafficLight, code: CODE_EXAMPLES[language].trafficLight },
    { label: t.smc.examples.guards, code: CODE_EXAMPLES[language].guards },
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
      const res = await fetch('/api/render-smc', {
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
            accept=".sm,.txt"
            label={t.openFileBtn('.sm')}
            onOpen={(text) => {
              setCode(text);
              render(text);
            }}
          />
          <button className={toolbarBtn} onClick={() => render(code)} disabled={loading}>
            {loading ? t.renderingBtn : t.renderBtn}
          </button>
          <button className={toolbarBtn} onClick={() => downloadText(code, 'maquina.sm')}>
            {t.downloadFileBtn('.sm')}
          </button>
          <ExportButtons filename="diagrama-smc" getSvg={async () => svgMarkup} />
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
