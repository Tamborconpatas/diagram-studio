import { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useI18n } from './i18n';
import type { SidebarTool } from './Sidebar';

export function CommandPalette({
  open,
  onClose,
  tools,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  tools: SidebarTool[];
  onSelect: (id: string) => void;
}) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setSelected(0);
    const id = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(id);
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? tools
      : tools.filter((tool) => {
          const label = t.tools[tool.id]?.label ?? tool.id;
          return label.toLowerCase().includes(q) || tool.id.toLowerCase().includes(q);
        });
    return list.slice(0, 40);
  }, [query, tools, t]);

  useEffect(() => setSelected(0), [query]);

  if (!open) return null;

  const choose = (id: string) => {
    onSelect(id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl mx-4 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative border-b border-zinc-800">
          <Search className="w-[18px] h-[18px] text-zinc-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelected((s) => Math.min(s + 1, results.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelected((s) => Math.max(s - 1, 0));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                if (results[selected]) choose(results[selected].id);
              } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
              }
            }}
            placeholder={t.sidebar.searchPlaceholder}
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent pl-11 pr-4 py-4 text-base font-mono-code text-zinc-100 placeholder:text-zinc-600 outline-none"
          />
        </div>
        <div className="max-h-[50vh] overflow-y-auto py-2">
          {results.length === 0 ? (
            <p className="px-4 py-7 text-center text-sm text-zinc-600 font-mono-code">{t.sidebar.noResults}</p>
          ) : (
            results.map((tool, i) => {
              const Icon = tool.icon;
              const label = t.tools[tool.id]?.label ?? tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => choose(tool.id)}
                  onMouseEnter={() => setSelected(i)}
                  className={
                    'w-full flex items-center gap-3.5 px-4 py-2.5 text-left text-[15px] cursor-pointer transition-colors ' +
                    (i === selected ? 'bg-teal-950/50 text-teal-400' : 'text-zinc-300')
                  }
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <span className="font-mono-code font-medium truncate">{label}</span>
                  <span className="ml-auto text-xs text-zinc-600 font-mono-code uppercase shrink-0">
                    {t.categories[tool.category] ?? tool.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
