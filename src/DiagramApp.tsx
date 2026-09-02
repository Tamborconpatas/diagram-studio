import { useCallback, useState, type ComponentType } from 'react';
import { Workflow, GitBranch, Waypoints, Share2, PenTool, Cloud, Sigma } from 'lucide-react';
import BpmnEditor from './editors/BpmnEditor';
import MermaidEditor from './editors/MermaidEditor';
import PlantUmlEditor from './editors/PlantUmlEditor';
import GraphvizEditor from './editors/GraphvizEditor';
import ExcalidrawEditor from './editors/ExcalidrawEditor';
import PythonDiagramsEditor from './editors/PythonDiagramsEditor';
import TikzEditor from './editors/TikzEditor';
import type { PendingScene } from './sceneHandoff';

const TOOLS = [
  { id: 'bpmn', label: 'BPMN', icon: Workflow, Component: BpmnEditor },
  { id: 'mermaid', label: 'Mermaid', icon: GitBranch, Component: MermaidEditor },
  { id: 'plantuml', label: 'PlantUML', icon: Waypoints, Component: PlantUmlEditor },
  { id: 'graphviz', label: 'Graphviz', icon: Share2, Component: GraphvizEditor },
  { id: 'excalidraw', label: 'Excalidraw', icon: PenTool, Component: ExcalidrawEditor },
  { id: 'aws', label: 'Arquitectura (Python)', icon: Cloud, Component: PythonDiagramsEditor },
  { id: 'tikz', label: 'TikZ', icon: Sigma, Component: TikzEditor },
] as const;

type ToolId = (typeof TOOLS)[number]['id'];

// Only MermaidEditor (onEditInExcalidraw) and ExcalidrawEditor
// (pendingScene/onSceneConsumed) read these; the rest ignore them.
type HandoffProps = {
  onEditInExcalidraw?: (scene: PendingScene) => void;
  pendingScene?: PendingScene | null;
  onSceneConsumed?: () => void;
};

export default function DiagramApp() {
  const [active, setActive] = useState<ToolId>('bpmn');
  const [pendingScene, setPendingScene] = useState<PendingScene | null>(null);
  const tool = TOOLS.find((t) => t.id === active)!;
  const Active = tool.Component as ComponentType<HandoffProps>;

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
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-teal-400 shrink-0">
          <Waypoints className="w-4 h-4" />
          <span>DIAGRAM STUDIO</span>
        </div>
        <nav className="flex items-center gap-1.5 overflow-x-auto">
          {TOOLS.map(({ id, label, icon: Icon }) => (
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
          ))}
        </nav>
      </header>
      <Active
        key={active}
        onEditInExcalidraw={handleEditInExcalidraw}
        pendingScene={pendingScene}
        onSceneConsumed={handleSceneConsumed}
      />
    </div>
  );
}
