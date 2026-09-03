import { useEffect, useRef, type ReactNode } from 'react';
import { CollapsibleSection } from './CollapsibleSection';
import { useI18n } from './i18n';

export const toolbarBtn =
  'px-2.5 py-1.5 rounded-lg text-[10px] font-mono-code font-bold tracking-wide uppercase ' +
  'bg-zinc-950/60 hover:bg-teal-950/40 border border-zinc-800 hover:border-teal-500/40 ' +
  'text-zinc-400 hover:text-teal-400 cursor-pointer active:scale-95 transition-all';

export const toolbarSelect =
  'px-2.5 py-1.5 rounded-lg text-[10px] font-mono-code font-bold tracking-wide uppercase ' +
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
    <div className="flex flex-1 min-h-0">
      <div className="w-105 flex flex-col border-r border-zinc-800/80 bg-zinc-950/40 shrink-0 min-h-0">
        {/* Código arriba como sección principal */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/80 bg-zinc-950/60 text-[10px] font-mono-code font-bold tracking-widest uppercase text-teal-400 shrink-0 select-none">
            <span>{codeTitle ?? t.codeTitle}</span>
          </div>
          {error && (
            <div className="px-3 py-2 text-[11px] text-red-400 font-mono-code border-b border-red-900/40 bg-red-950/20 shrink-0 max-h-28 overflow-y-auto">
              {error}
            </div>
          )}
          <textarea
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full bg-transparent text-zinc-200 font-mono-code text-xs p-3 resize-none outline-none overflow-auto"
          />
        </div>

        {/* Los demás abajo: Acciones y Ejemplos */}
        <div className="shrink-0 max-h-[45vh] overflow-y-auto border-t border-zinc-800/80 flex flex-col">
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
      <div className="flex-1 relative bg-[#0a0b0e]">{renderArea}</div>
    </div>
  );
}
