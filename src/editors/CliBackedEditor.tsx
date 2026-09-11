import { useEffect, useRef, useState } from 'react';
import { EditorLayout, toolbarBtn } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { ExamplesMenu } from '../ExamplesMenu';
import { downloadText } from '../export';
import { useI18n } from '../i18n';
import type { Language } from '../i18n/types';

// Shared shape for every editor whose render is a POST to
// /api/render-<apiPath> (see vite-plugin-diagrams-api.ts). Adding a new
// CLI-backed diagram format means adding a backend renderer plus a config
// object here, not a new component.
export interface CliBackedEditorConfig {
  apiPath: string;
  examples: Record<Language, Record<string, string>>;
  exampleLabels: Record<string, string>;
  fileExt: string;
  downloadFilename: string;
  exportFilename: string;
  whiteBg?: boolean;
  loadingLabel?: (t: ReturnType<typeof useI18n>['t']) => string;
}

export default function CliBackedEditor({
  apiPath,
  examples,
  exampleLabels,
  fileExt,
  downloadFilename,
  exportFilename,
  whiteBg = true,
  loadingLabel,
}: CliBackedEditorConfig) {
  const { t, language } = useI18n();
  const defaultCode = Object.values(examples[language])[0];
  const [code, setCode] = useState(defaultCode);
  const [svgMarkup, setSvgMarkup] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const exampleList = Object.keys(examples[language]).map((key) => ({
    label: exampleLabels[key] ?? key,
    code: examples[language][key],
  }));

  const prevLangRef = useRef(language);
  useEffect(() => {
    if (prevLangRef.current !== language) {
      const prevLang = prevLangRef.current;
      prevLangRef.current = language;
      const matchedKey = Object.entries(examples[prevLang]).find(([, value]) => value === code)?.[0];
      const nextCode = matchedKey ? examples[language][matchedKey] : undefined;
      if (nextCode !== undefined) {
        setCode(nextCode);
        render(nextCode);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, code]);

  const render = async (src: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/render-${apiPath}`, {
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
    render(defaultCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <EditorLayout
      examples={
        <ExamplesMenu
          examples={exampleList}
          onSelect={(exampleCode) => {
            setCode(exampleCode);
            render(exampleCode);
          }}
        />
      }
      actions={
        <>
          <OpenFileButton
            accept={`${fileExt},.txt`}
            label={t.openFileBtn(fileExt)}
            onOpen={(text) => {
              setCode(text);
              render(text);
            }}
          />
          <button className={toolbarBtn} onClick={() => render(code)} disabled={loading}>
            {loading ? (loadingLabel?.(t) ?? t.renderingBtn) : t.renderBtn}
          </button>
          <button className={toolbarBtn} onClick={() => downloadText(code, downloadFilename)}>
            {t.downloadFileBtn(fileExt)}
          </button>
          <ExportButtons filename={exportFilename} getSvg={async () => svgMarkup} />
        </>
      }
      error={error}
      code={code}
      onCodeChange={setCode}
      onAutoRender={(src) => render(src)}
      renderArea={
        <div
          className={`w-full h-full flex items-center justify-center overflow-auto p-6 ${whiteBg ? 'bg-white ' : ''}[&_svg]:max-w-none`}
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
      }
    />
  );
}
