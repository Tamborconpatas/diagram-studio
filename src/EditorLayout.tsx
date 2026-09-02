import type { ReactNode } from 'react';

export const toolbarBtn =
  'px-2.5 py-1.5 rounded-lg text-[10px] font-mono-code font-bold tracking-wide uppercase ' +
  'bg-zinc-950/60 hover:bg-teal-950/40 border border-zinc-800 hover:border-teal-500/40 ' +
  'text-zinc-400 hover:text-teal-400 cursor-pointer active:scale-95 transition-all';

export const toolbarSelect =
  'px-2.5 py-1.5 rounded-lg text-[10px] font-mono-code font-bold tracking-wide uppercase ' +
  'bg-zinc-950/60 border border-zinc-800 hover:border-teal-500/40 ' +
  'text-zinc-400 cursor-pointer transition-all outline-none';

export function EditorLayout({
  toolbar,
  error,
  code,
  onCodeChange,
  renderArea,
}: {
  toolbar: ReactNode;
  error: string | null;
  code: string;
  onCodeChange: (v: string) => void;
  renderArea: ReactNode;
}) {
  return (
    <div className="flex flex-1 min-h-0">
      <div className="w-105 flex flex-col border-r border-zinc-800/80 bg-zinc-950/40 shrink-0">
        <div className="flex flex-wrap items-center gap-2 p-3 border-b border-zinc-800/80">{toolbar}</div>
        {error && (
          <div className="px-3 py-2 text-[11px] text-red-400 font-mono-code border-b border-red-900/40 bg-red-950/20">
            {error}
          </div>
        )}
        <textarea
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          spellCheck={false}
          className="flex-1 bg-transparent text-zinc-200 font-mono-code text-xs p-3 resize-none outline-none"
        />
      </div>
      <div className="flex-1 relative bg-[#0a0b0e]">{renderArea}</div>
    </div>
  );
}
