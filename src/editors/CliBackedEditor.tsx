import { useEffect, useRef, useState } from 'react';
import { EditorLayout, toolbarBtn } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { ExamplesMenu } from '../ExamplesMenu';
import { downloadText } from '../export';
import { useI18n } from '../i18n';
import type { Language } from '../i18n/types';
import type { CliBackedFormat } from '../cliBackedFormats';

// The blockdiag family (blockdiag/seqdiag/actdiag/nwdiag/packetdiag/rackdiag)
// emits SVG with only a viewBox, no width/height attributes. Without them a
// browser falls back to an unpredictable default replaced-element size
// instead of the viewBox's real aspect ratio — harmless for near-square
// diagrams, but a tall/narrow one like rackdiag rendered badly distorted and
// broke ZoomPane's fit-to-view (which measures natural size via scrollWidth/
// Height). Inject width/height from the viewBox whenever they're missing.
function ensureSvgDimensions(svg: string): string {
  const openTagMatch = svg.match(/<svg\b[^>]*>/);
  if (!openTagMatch) return svg;
  const openTag = openTagMatch[0];
  if (/\bwidth\s*=/.test(openTag) && /\bheight\s*=/.test(openTag)) return svg;
  const viewBoxMatch = openTag.match(/viewBox\s*=\s*["']([^"']+)["']/i);
  if (!viewBoxMatch) return svg;
  const parts = viewBoxMatch[1].trim().split(/[\s,]+/).map(Number);
  if (parts.length !== 4 || parts.some((n) => !isFinite(n))) return svg;
  const [, , w, h] = parts;
  if (w <= 0 || h <= 0) return svg;
  const patchedTag = openTag.replace('<svg', `<svg width="${w}" height="${h}"`);
  return svg.replace(openTag, patchedTag);
}

// The single render path every CLI_BACKED_FORMATS entry (src/cliBackedFormats.ts)
// goes through — this is what DiagramApp.tsx's TOOLS array points its
// Component at for all of them, instead of one bespoke component per format.
export function CliFormatEditor({ format }: { format: CliBackedFormat }) {
  const { t } = useI18n();
  return (
    <CliBackedEditor
      apiPath={format.id}
      examples={format.examples}
      exampleLabels={t.cliFormats[format.id]?.examples ?? {}}
      fileExt={format.fileExt}
      downloadFilename={format.downloadFilename}
      exportFilename={`diagrama-${format.id}`}
      loadingLabel={format.loadingLabel}
    />
  );
}

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
      setSvgMarkup(ensureSvgDimensions(data.svg));
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
          className={`w-full h-full flex items-center justify-center overflow-auto p-6 ${whiteBg ? 'bg-white text-black ' : ''}[&_svg]:max-w-none`}
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
      }
    />
  );
}
