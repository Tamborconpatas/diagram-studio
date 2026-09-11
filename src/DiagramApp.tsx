import { useCallback, useState, type ComponentType } from 'react';
import { Workflow, GitBranch, Waypoints, Share2, PenTool, Cloud, Waves, Component as ComponentIcon, Globe, LayoutTemplate, AudioWaveform, Brain, TestTube, Box, Music } from 'lucide-react';
import BpmnEditor from './editors/BpmnEditor';
import MermaidEditor from './editors/MermaidEditor';
import PlantUmlEditor from './editors/PlantUmlEditor';
import GraphvizEditor from './editors/GraphvizEditor';
import ExcalidrawEditor from './editors/ExcalidrawEditor';
import PythonDiagramsEditor from './editors/PythonDiagramsEditor';
import DrawioEditor from './editors/DrawioEditor';
import SankeyEditor from './editors/SankeyEditor';
import NomnomlEditor from './editors/NomnomlEditor';
import WaveDromEditor from './editors/WaveDromEditor';
import MarkmapEditor from './editors/MarkmapEditor';
import SmilesEditor from './editors/SmilesEditor';
import PikchrEditor from './editors/PikchrEditor';
import AbcEditor from './editors/AbcEditor';
import { CliFormatEditor } from './editors/CliBackedEditor';
import { CLI_BACKED_FORMATS } from './cliBackedFormats';
import type { PendingScene } from './sceneHandoff';
import { useI18n } from './i18n';

// Category groups the home screen by tool (single value per tool); useCases
// groups it by what you're trying to draw (a tool can match several, since
// e.g. Mermaid/PlantUML alone cover sequence/class/state/ER diagrams). The
// top nav stays flat (it's already a compact scrollable strip, grouping
// there buys nothing).
//
// Tools with a bespoke editor (client-side lib, or a hand-built layout) are
// listed here directly. CLI-backed ones (one POST to /api/render-<id>, see
// vite-plugin-diagrams-api.ts) come from CLI_BACKED_FORMATS instead — adding
// one of those needs no edit here, see src/cliBackedFormats.ts.
const CUSTOM_TOOLS = [
  { id: 'bpmn', icon: Workflow, Component: BpmnEditor, category: 'software', useCases: ['process'] },
  { id: 'mermaid', icon: GitBranch, Component: MermaidEditor, category: 'software', useCases: ['sequence', 'classUml', 'state', 'database', 'flow'] },
  { id: 'plantuml', icon: Waypoints, Component: PlantUmlEditor, category: 'software', useCases: ['sequence', 'usecase', 'process', 'classUml', 'state'] },
  { id: 'graphviz', icon: Share2, Component: GraphvizEditor, category: 'software', useCases: ['architecture', 'flow'] },
  { id: 'nomnoml', icon: ComponentIcon, Component: NomnomlEditor, category: 'software', useCases: ['classUml'] },
  { id: 'pikchr', icon: Box, Component: PikchrEditor, category: 'software', useCases: ['flow'] },
  { id: 'markmap', icon: Brain, Component: MarkmapEditor, category: 'software', useCases: ['flow'] },
  { id: 'wavedrom', icon: AudioWaveform, Component: WaveDromEditor, category: 'technical', useCases: ['scientific'] },
  { id: 'smiles', icon: TestTube, Component: SmilesEditor, category: 'technical', useCases: ['scientific'] },
  { id: 'abc', icon: Music, Component: AbcEditor, category: 'technical', useCases: ['scientific'] },
  { id: 'aws', icon: Cloud, Component: PythonDiagramsEditor, category: 'infra', useCases: ['architecture'] },
  { id: 'sankey', icon: Waves, Component: SankeyEditor, category: 'process', useCases: ['flow'] },
  { id: 'excalidraw', icon: PenTool, Component: ExcalidrawEditor, category: 'drawing', useCases: ['freeform'] },
  { id: 'drawio', icon: LayoutTemplate, Component: DrawioEditor, category: 'drawing', useCases: ['architecture', 'flow', 'freeform'] },
] as const;

const TOOLS = [
  ...CUSTOM_TOOLS,
  ...CLI_BACKED_FORMATS.map((format) => ({
    id: format.id,
    icon: format.icon,
    Component: () => <CliFormatEditor format={format} />,
    category: format.category,
    useCases: format.useCases,
  })),
];

const CATEGORY_ORDER = ['software', 'infra', 'process', 'technical', 'drawing'] as const;
const USE_CASE_ORDER = [
  'sequence',
  'usecase',
  'process',
  'classUml',
  'state',
  'database',
  'architecture',
  'network',
  'flow',
  'scientific',
  'freeform',
] as const;

type ToolId = (typeof TOOLS)[number]['id'];

// Only MermaidEditor (onEditInExcalidraw) and ExcalidrawEditor
// (pendingScene/onSceneConsumed) read these; the rest ignore them.
type HandoffProps = {
  onEditInExcalidraw?: (scene: PendingScene) => void;
  pendingScene?: PendingScene | null;
  onSceneConsumed?: () => void;
};

function ToolCard({ id, icon: Icon, onSelect }: { id: ToolId; icon: ComponentType<{ className?: string }>; onSelect: (id: ToolId) => void }) {
  const { t } = useI18n();
  const toolTrans = t.tools[id];
  return (
    <button
      onClick={() => onSelect(id)}
      className="cyber-card cyber-corners text-left p-5 flex flex-col gap-3 cursor-pointer"
    >
      <Icon className="w-6 h-6 text-teal-400" />
      <div className="font-mono-code text-sm font-bold text-zinc-100">{toolTrans?.label ?? id}</div>
      <p className="text-xs text-zinc-500 leading-relaxed">{toolTrans?.description ?? ''}</p>
    </button>
  );
}

function HomeGrid({ onSelect }: { onSelect: (id: ToolId) => void }) {
  const { t } = useI18n();
  const [viewMode, setViewMode] = useState<'tool' | 'usecase'>('tool');

  const groups =
    viewMode === 'tool'
      ? CATEGORY_ORDER.map((key) => ({
          key,
          title: t.categories[key] ?? key,
          tools: TOOLS.filter((tool) => tool.category === key),
        }))
      : USE_CASE_ORDER.map((key) => ({
          key,
          title: t.useCases[key] ?? key,
          tools: TOOLS.filter((tool) => (tool.useCases as readonly string[]).includes(key)),
        }));

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <p className="text-zinc-500 text-xs font-mono-code">{t.homeSubtitle}</p>
          <div className="flex items-center gap-1 shrink-0">
            {(['tool', 'usecase'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={
                  'px-2.5 py-1 rounded-lg text-[10px] font-mono-code font-bold tracking-wide uppercase cursor-pointer transition-all ' +
                  (viewMode === mode
                    ? 'bg-teal-950/70 border border-teal-500/50 text-teal-400'
                    : 'border border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-800')
                }
              >
                {mode === 'tool' ? t.homeViewToggle.byTool : t.homeViewToggle.byUseCase}
              </button>
            ))}
          </div>
        </div>
        {groups.map(({ key, title, tools }) => (
          <div key={key} className="mb-8 last:mb-0">
            <h2 className="text-[11px] font-mono-code font-bold tracking-widest uppercase text-teal-400 mb-3">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {tools.map(({ id, icon }) => (
                <ToolCard key={id} id={id} icon={icon} onSelect={onSelect} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DiagramApp() {
  const { t, language, setLanguage } = useI18n();
  const [active, setActive] = useState<ToolId | 'home'>('home');
  const [pendingScene, setPendingScene] = useState<PendingScene | null>(null);
  const tool = active === 'home' ? null : TOOLS.find((t) => t.id === active)!;
  const Active = tool?.Component as ComponentType<HandoffProps> | undefined;

  // Stable identities: ExcalidrawEditor keeps mounted (same `key`) across the
  // pendingScene->null transition, and inline callbacks here would otherwise
  // get a fresh reference on every render, which resets the Excalidraw canvas.
  const handleEditInExcalidraw = useCallback((scene: PendingScene) => {
    setPendingScene(scene);
    setActive('excalidraw');
  }, []);
  const handleSceneConsumed = useCallback(() => setPendingScene(null), []);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#040507] text-zinc-100 font-sans">
      <header className="flex items-center gap-4 px-4 py-2.5 border-b border-zinc-800/80 bg-zinc-950/60 font-mono-code">
        <button
          onClick={() => setActive('home')}
          className="flex items-center gap-2 text-xs font-bold tracking-widest text-teal-400 shrink-0 cursor-pointer"
        >
          <Waypoints className="w-4 h-4" />
          <span>DIAGRAM STUDIO</span>
        </button>
        <nav className="flex items-center gap-1.5 overflow-x-auto">
          {TOOLS.map(({ id, icon: Icon }) => {
            const label = t.tools[id]?.label ?? id;
            return (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide whitespace-nowrap cursor-pointer transition-all ' +
                  (id === active
                    ? 'bg-teal-950/50 border border-teal-500/40 text-teal-400'
                    : 'border border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-800')
                }
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1 shrink-0 pl-2">
          <Globe className="w-3.5 h-3.5 text-zinc-500 mr-1" />
          <button
            onClick={() => setLanguage('es')}
            className={
              'px-2 py-1 rounded text-[11px] font-mono-code font-bold transition-all cursor-pointer ' +
              (language === 'es'
                ? 'bg-teal-950/70 text-teal-400 border border-teal-500/50'
                : 'text-zinc-500 hover:text-zinc-300 border border-transparent')
            }
            title="Español"
          >
            ES
          </button>
          <span className="text-zinc-700 text-xs select-none">/</span>
          <button
            onClick={() => setLanguage('en')}
            className={
              'px-2 py-1 rounded text-[11px] font-mono-code font-bold transition-all cursor-pointer ' +
              (language === 'en'
                ? 'bg-teal-950/70 text-teal-400 border border-teal-500/50'
                : 'text-zinc-500 hover:text-zinc-300 border border-transparent')
            }
            title="English"
          >
            EN
          </button>
        </div>
      </header>
      {active === 'home' || !Active ? (
        <HomeGrid onSelect={setActive} />
      ) : (
        <Active
          key={active}
          onEditInExcalidraw={handleEditInExcalidraw}
          pendingScene={pendingScene}
          onSceneConsumed={handleSceneConsumed}
        />
      )}
    </div>
  );
}
