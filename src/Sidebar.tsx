import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { ChevronLeft, ChevronRight, Search, Waypoints, X } from 'lucide-react';
import { useI18n } from './i18n';

export type SidebarTool = { id: string; icon: ComponentType<{ className?: string }>; category: string };

const COLLAPSE_KEY = 'diagram-studio:sidebar-collapsed';
// Below this, the sidebar stops being a static docked column and becomes an
// off-canvas drawer — must match the `lg:` breakpoint used in the classNames
// below, since that's the only way to keep the icon-only "collapsed" rail a
// desktop-only affordance (collapsing it on a phone would leave no way to
// see labels or reach the search box at all).
const DESKTOP_QUERY = '(min-width: 1024px)';

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === '1';
  } catch {
    return false;
  }
}

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches);
  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => setIsDesktop(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return isDesktop;
}

export function Sidebar({
  tools,
  categoryOrder,
  active,
  onSelect,
  mobileOpen,
  onMobileClose,
}: {
  tools: SidebarTool[];
  categoryOrder: readonly string[];
  active: string;
  onSelect: (id: string) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const { t } = useI18n();
  const isDesktop = useIsDesktop();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [query, setQuery] = useState('');
  // Icon-only rail only ever applies on desktop — on a phone-width drawer
  // there's no docked sliver to shrink to, so always show full labels there.
  const iconOnly = collapsed && isDesktop;

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
      } catch {
        /* private window / blocked storage — collapse state just won't persist */
      }
      return next;
    });
    // Collapsing hides the search box but not its query — without this the
    // icon rail silently stays stuck on a filtered (often single-result)
    // list the user has no way to see or clear until expanding again.
    setQuery('');
  };

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!q) return null;
    return tools.filter((tool) => {
      const label = t.tools[tool.id]?.label ?? tool.id;
      return label.toLowerCase().includes(q) || tool.id.toLowerCase().includes(q);
    });
  }, [q, tools, t]);

  const select = (id: string) => {
    onSelect(id);
    onMobileClose();
  };

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={onMobileClose} />
      )}
      <aside
        className={
          'fixed inset-y-0 left-0 z-40 flex flex-col w-72 border-r border-zinc-800/80 bg-zinc-950 shadow-2xl ' +
          'transition-transform duration-200 lg:static lg:z-auto lg:shadow-none lg:bg-zinc-950/60 lg:transition-[width] ' +
          (mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0') +
          ' ' +
          (collapsed ? 'lg:w-16' : 'lg:w-72')
        }
      >
        <div className="flex items-center border-b border-zinc-800/80 shrink-0">
          <button
            onClick={() => select('home')}
            className="flex-1 flex items-center gap-2.5 px-4 py-4 text-teal-400 font-mono-code font-bold text-sm tracking-widest min-w-0 cursor-pointer"
            title={t.sidebar.home}
          >
            <Waypoints className="w-5 h-5 shrink-0" />
            {!iconOnly && <span className="truncate">DIAGRAM STUDIO</span>}
          </button>
          <button
            onClick={onMobileClose}
            className="p-4 text-zinc-500 hover:text-teal-400 cursor-pointer lg:hidden shrink-0"
            title={t.sidebar.collapse}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!iconOnly && (
          <div className="px-3.5 pt-3.5 pb-2.5 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.sidebar.searchPlaceholder}
                autoComplete="off"
                spellCheck={false}
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg pl-9 pr-2.5 py-2 text-sm font-mono-code text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-teal-500/50 transition-colors"
              />
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto min-h-0 px-2.5 pb-2.5">
          {filtered ? (
            filtered.length === 0 ? (
              <p className="px-2.5 py-3.5 text-xs text-zinc-600 font-mono-code">{t.sidebar.noResults}</p>
            ) : (
              <div className="flex flex-col gap-1 pt-1.5">
                {filtered.map((tool) => (
                  <ToolButton key={tool.id} tool={tool} active={active === tool.id} collapsed={iconOnly} onSelect={select} />
                ))}
              </div>
            )
          ) : (
            categoryOrder.map((cat) => {
              const catTools = tools.filter((tool) => tool.category === cat);
              if (catTools.length === 0) return null;
              return (
                <div key={cat} className="mb-1.5">
                  {!iconOnly && (
                    <div className="px-2.5 pt-4 pb-1.5 text-[11px] font-mono-code font-bold tracking-widest uppercase text-zinc-600">
                      {t.categories[cat] ?? cat}
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    {catTools.map((tool) => (
                      <ToolButton key={tool.id} tool={tool} active={active === tool.id} collapsed={iconOnly} onSelect={select} />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </nav>

        <button
          onClick={toggle}
          className="hidden lg:flex items-center justify-center gap-2 px-3 py-3 border-t border-zinc-800/80 text-zinc-600 hover:text-teal-400 text-xs font-mono-code uppercase tracking-wide cursor-pointer shrink-0"
          title={collapsed ? t.sidebar.expand : t.sidebar.collapse}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" /> {t.sidebar.collapse}
            </>
          )}
        </button>
      </aside>
    </>
  );
}

function ToolButton({
  tool,
  active,
  collapsed,
  onSelect,
}: {
  tool: SidebarTool;
  active: boolean;
  collapsed: boolean;
  onSelect: (id: string) => void;
}) {
  const { t } = useI18n();
  const Icon = tool.icon;
  const label = t.tools[tool.id]?.label ?? tool.id;
  return (
    <button
      onClick={() => onSelect(tool.id)}
      title={collapsed ? label : undefined}
      className={
        'flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-bold whitespace-nowrap cursor-pointer transition-all ' +
        (active
          ? 'bg-teal-950/50 border border-teal-500/40 text-teal-400'
          : 'border border-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60')
      }
    >
      <Icon className="w-[18px] h-[18px] shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );
}
