import { useEffect, useRef, type ReactNode } from 'react';
import { CollapsibleSection } from './CollapsibleSection';
import { useI18n } from './i18n';

export const toolbarBtn =
  'px-3 py-2 rounded-lg text-xs font-mono-code font-bold tracking-wide uppercase ' +
  'bg-zinc-950/60 hover:bg-teal-950/40 border border-zinc-800 hover:border-teal-500/40 ' +
  'text-zinc-400 hover:text-teal-400 cursor-pointer active:scale-95 transition-all';

export const toolbarSelect =
  'px-3 py-2 rounded-lg text-xs font-mono-code font-bold tracking-wide uppercase ' +
  'bg-zinc-950/60 border border-zinc-800 hover:border-teal-500/40 ' +
  'text-zinc-400 cursor-pointer transition-all outline-none';

// The <select> itself picks up toolbarSelect fine, but its <option> popup is
// painted by the browser using its own colors unless the options carry their
// own — without this the dropdown list shows up light-gray-on-black-text,
// clashing with the dark theme.
export const toolbarOption = 'bg-zinc-900 text-zinc-200';

export function EditorLayout({
  examples,
  actions,
  error,
  code,
  onCodeChange,
  renderArea,
  examplesTitle,
  actionsTitle,
  codeTitle,
  onAutoRender,
}: {
  examples?: ReactNode;
  actions: ReactNode;
  error: string | null;
  code: string;
  onCodeChange: (v: string) => void;
  renderArea: ReactNode;
  examplesTitle?: string;
  actionsTitle?: string;
  codeTitle?: string;
  onAutoRender?: (code: string) => void;
}) {
  const { t } = useI18n();
  const lastRenderedCodeRef = useRef(code);
  const isFirstMountRef = useRef(true);

  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      lastRenderedCodeRef.current = code;
      return;
    }

    if (!onAutoRender) return;
    if (code === lastRenderedCodeRef.current) return;

    const timer = setTimeout(() => {
      lastRenderedCodeRef.current = code;
      onAutoRender(code);
    }, 150);

    return () => clearTimeout(timer);
  }, [code, onAutoRender]);

  return (
    <div className="flex flex-col md:flex-row flex-1 min-h-0">
      <div className="h-[45vh] md:h-auto md:w-115 flex flex-col border-b md:border-b-0 md:border-r border-zinc-800/80 bg-zinc-950/40 shrink-0 min-h-0">
        {/* Código arriba como sección principal */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/80 bg-zinc-950/60 text-xs font-mono-code font-bold tracking-widest uppercase text-teal-400 shrink-0 select-none">
            <span>{codeTitle ?? t.codeTitle}</span>
          </div>
          {error && (
            <div className="px-4 py-2.5 text-xs text-red-400 font-mono-code border-b border-red-900/40 bg-red-950/20 shrink-0 max-h-28 overflow-y-auto">
              {error}
            </div>
          )}
          <textarea
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full bg-transparent text-zinc-200 font-mono-code text-[15px] leading-relaxed p-4 resize-none outline-none overflow-auto"
          />
        </div>

        {/* Los demás abajo: Acciones y Ejemplos */}
        <div className="shrink-0 max-h-[35vh] md:max-h-[45vh] overflow-y-auto border-t border-zinc-800/80 flex flex-col">
          <CollapsibleSection title={actionsTitle ?? t.actionsTitle} defaultOpen={true}>
            {actions}
          </CollapsibleSection>
          {examples && (
            <CollapsibleSection title={examplesTitle ?? t.examplesTitle} defaultOpen={false}>
              {examples}
            </CollapsibleSection>
          )}
        </div>
      </div>
      <div className="flex-1 min-h-0 relative bg-[#0a0b0e]">{renderArea}</div>
    </div>
  );
}
