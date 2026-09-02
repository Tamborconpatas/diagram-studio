import { useCallback, useState, type ComponentType } from 'react';
import { Workflow, GitBranch, Waypoints, Share2, PenTool, Cloud, Sigma, Terminal, Database, Boxes, Waves, Component as ComponentIcon, ArrowRightLeft } from 'lucide-react';
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

const TOOLS = [
  { id: 'bpmn', label: 'BPMN', icon: Workflow, Component: BpmnEditor, description: 'Procesos de negocio, editable arrastrando tareas y flechas.' },
  { id: 'mermaid', label: 'Mermaid', icon: GitBranch, Component: MermaidEditor, description: '~15 tipos en un motor: flowcharts, secuencia, clases, ER, estado...' },
  { id: 'plantuml', label: 'PlantUML', icon: Waypoints, Component: PlantUmlEditor, description: 'UML clásico y C4, con temas y actores en notación tradicional.' },
  { id: 'graphviz', label: 'Graphviz', icon: Share2, Component: GraphvizEditor, description: 'Grafos DOT con layout automático y presets de estilo.' },
  { id: 'excalidraw', label: 'Excalidraw', icon: PenTool, Component: ExcalidrawEditor, description: 'Pizarra a mano alzada, 100% arrastrable.' },
  { id: 'aws', label: 'Arquitectura (Python)', icon: Cloud, Component: PythonDiagramsEditor, description: 'Diagramas AWS/GCP/Azure desde código Python (`diagrams`).' },
  { id: 'tikz', label: 'TikZ', icon: Sigma, Component: TikzEditor, description: 'Gráficos vectoriales de precisión vía LaTeX.' },
  { id: 'ditaa', label: 'Ditaa (ASCII art)', icon: Terminal, Component: DitaaEditor, description: 'Convierte arte ASCII en diagramas prolijos.' },
  { id: 'dbml', label: 'DBML', icon: Database, Component: DbmlEditor, description: 'Esquemas de base de datos: tablas, tipos y relaciones ER.' },
  { id: 'blockdiag', label: 'Blockdiag', icon: Boxes, Component: BlockdiagEditor, description: 'Diagramas de bloques y redes desde texto simple.' },
  { id: 'sankey', label: 'Sankey', icon: Waves, Component: SankeyEditor, description: 'Diagramas de flujo proporcional, 100% en el navegador.' },
  { id: 'nomnoml', label: 'Nomnoml', icon: ComponentIcon, Component: NomnomlEditor, description: 'UML simple (clases, herencia), 100% en el navegador.' },
  { id: 'smc', label: 'SMC', icon: ArrowRightLeft, Component: SmcEditor, description: 'Máquinas de estado desde tabla de transiciones (State Machine Compiler).' },
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
  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="max-w-5xl mx-auto">
        <p className="text-zinc-500 text-xs font-mono-code mb-6">Elige una herramienta para empezar.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TOOLS.map(({ id, label, icon: Icon, description }) => (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className="cyber-card cyber-corners text-left p-5 flex flex-col gap-3 cursor-pointer"
            >
              <Icon className="w-6 h-6 text-teal-400" />
              <div className="font-mono-code text-sm font-bold text-zinc-100">{label}</div>
              <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DiagramApp() {
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
