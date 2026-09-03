import { useCallback, useState, type ComponentType } from 'react';
import { Workflow, GitBranch, Waypoints, Share2, PenTool, Cloud, Sigma, Terminal, Database, Boxes, Waves, Component as ComponentIcon, ArrowRightLeft, Globe } from 'lucide-react';
import BpmnEditor from './editors/BpmnEditor';
import MermaidEditor from './editors/MermaidEditor';
import PlantUmlEditor from './editors/PlantUmlEditor';
import GraphvizEditor from './editors/GraphvizEditor';
import ExcalidrawEditor from './editors/ExcalidrawEditor';
import PythonDiagramsEditor from './editors/PythonDiagramsEditor';
import TikzEditor from './editors/TikzEditor';
import DitaaEditor from './editors/DitaaEditor';
import DbmlEditor from './editors/DbmlEditor';
import BlockdiagEditor from './editors/BlockdiagEditor';
import SankeyEditor from './editors/SankeyEditor';
import NomnomlEditor from './editors/NomnomlEditor';
import SmcEditor from './editors/SmcEditor';
import type { PendingScene } from './sceneHandoff';
import { useI18n } from './i18n';

const TOOLS = [
  { id: 'bpmn', icon: Workflow, Component: BpmnEditor },
  { id: 'mermaid', icon: GitBranch, Component: MermaidEditor },
  { id: 'plantuml', icon: Waypoints, Component: PlantUmlEditor },
  { id: 'graphviz', icon: Share2, Component: GraphvizEditor },
  { id: 'excalidraw', icon: PenTool, Component: ExcalidrawEditor },
  { id: 'aws', icon: Cloud, Component: PythonDiagramsEditor },
  { id: 'tikz', icon: Sigma, Component: TikzEditor },
  { id: 'ditaa', icon: Terminal, Component: DitaaEditor },
  { id: 'dbml', icon: Database, Component: DbmlEditor },
  { id: 'blockdiag', icon: Boxes, Component: BlockdiagEditor },
  { id: 'sankey', icon: Waves, Component: SankeyEditor },
  { id: 'nomnoml', icon: ComponentIcon, Component: NomnomlEditor },
  { id: 'smc', icon: ArrowRightLeft, Component: SmcEditor },
] as const;

type ToolId = (typeof TOOLS)[number]['id'];

// Only MermaidEditor (onEditInExcalidraw) and ExcalidrawEditor
// (pendingScene/onSceneConsumed) read these; the rest ignore them.
type HandoffProps = {
  onEditInExcalidraw?: (scene: PendingScene) => void;
  pendingScene?: PendingScene | null;
  onSceneConsumed?: () => void;
};

function HomeGrid({ onSelect }: { onSelect: (id: ToolId) => void }) {
  const { t } = useI18n();

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="max-w-5xl mx-auto">
        <p className="text-zinc-500 text-xs font-mono-code mb-6">{t.homeSubtitle}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TOOLS.map(({ id, icon: Icon }) => {
            const toolTrans = t.tools[id];
            const label = toolTrans?.label ?? id;
            const description = toolTrans?.description ?? '';
            return (
              <button
                key={id}
                onClick={() => onSelect(id)}
                className="cyber-card cyber-corners text-left p-5 flex flex-col gap-3 cursor-pointer"
              >
                <Icon className="w-6 h-6 text-teal-400" />
                <div className="font-mono-code text-sm font-bold text-zinc-100">{label}</div>
                <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
              </button>
            );
          })}
        </div>
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
