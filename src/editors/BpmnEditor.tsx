import { useEffect, useRef, useState } from 'react';
import Modeler from 'bpmn-js/lib/Modeler';
import type Modeling from 'bpmn-js/lib/features/modeling/Modeling';
import { layoutProcess } from 'bpmn-auto-layout';
import { EditorLayout, toolbarBtn, toolbarSelect } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { downloadText } from '../export';

const EMPTY_DIAGRAM = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="173" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

// fill/stroke '' clears any previously-applied color (bpmn-js treats a falsy
// value as "remove the override"), used for the 'ninguno' preset.
const STYLE_PRESETS = {
  ninguno: { fill: '', stroke: '' },
  azul: { fill: '#e0f2fe', stroke: '#0284c7' },
  verde: { fill: '#dcfce7', stroke: '#16a34a' },
  ambar: { fill: '#fef3c7', stroke: '#d97706' },
  pastel: { fill: '#fde2e4', stroke: '#c9184a' },
} as const;

type StylePreset = keyof typeof STYLE_PRESETS;

// Only recolor concrete shapes/flows; pools, lanes, subprocess containers,
// groups and annotations would flood their whole area with the fill color.
const CONTAINER_TYPES = new Set([
  'bpmn:Participant',
  'bpmn:Lane',
  'bpmn:SubProcess',
  'bpmn:Group',
  'bpmn:TextAnnotation',
]);

type ElementRegistry = { getAll: () => Array<{ type: string; parent: unknown }> };

export default function BpmnEditor() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<Modeler | null>(null);
  const [xml, setXml] = useState(EMPTY_DIAGRAM);
  const [style, setStyle] = useState<StylePreset>('ninguno');
  const [error, setError] = useState<string | null>(null);

  const applyStyle = (preset: StylePreset) => {
    const colors = STYLE_PRESETS[preset];
    const modeler = modelerRef.current!;
    const modeling = modeler.get<Modeling>('modeling');
    const elementRegistry = modeler.get<ElementRegistry>('elementRegistry');
    const elements = elementRegistry
      .getAll()
      .filter((el) => el.parent && el.type !== 'label' && !CONTAINER_TYPES.has(el.type));
    modeling.setColor(elements as Parameters<Modeling['setColor']>[0], colors);
  };

  useEffect(() => {
    const modeler = new Modeler({ container: canvasRef.current! });
    modelerRef.current = modeler;
    // React StrictMode mounts, cleans up, and mounts again; if destroy() ran
    // while this import was still in flight, bpmn-js would try to draw into
    // a canvas layer that no longer exists ("Cannot read properties of
    // undefined (reading 'root-0')"). Wait for the import to settle first.
    const importDone = modeler.importXML(EMPTY_DIAGRAM).catch((err: Error) => setError(err.message));
    return () => {
      importDone.finally(() => modeler.destroy());
    };
  }, []);

  const loadXml = async (source?: string) => {
    try {
      const original = source ?? xml;
      let toImport = original;
      try {
        await modelerRef.current!.importXML(toImport);
      } catch (err) {
        if (err instanceof Error && err.message === 'no diagram to display') {
          toImport = await layoutProcess(original);
          await modelerRef.current!.importXML(toImport);
        } else {
          throw err;
        }
      }
      modelerRef.current!.get<{ zoom: (v: string) => void }>('canvas').zoom('fit-viewport');
      applyStyle(style);
      setXml(toImport);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const exportXml = async () => {
    const { xml: exported } = await modelerRef.current!.saveXML({ format: true });
    setXml(exported ?? '');
  };

  return (
    <EditorLayout
      toolbar={
        <>
          <OpenFileButton
            accept=".bpmn,.xml"
            label="Abrir .bpmn"
            onOpen={(text) => {
              setXml(text);
              loadXml(text);
            }}
          />
          <button className={toolbarBtn} onClick={() => loadXml()}>Cargar → diagrama</button>
          <select
            className={toolbarSelect}
            value={style}
            onChange={(e) => {
              const s = e.target.value as StylePreset;
              setStyle(s);
              applyStyle(s);
            }}
          >
            {Object.keys(STYLE_PRESETS).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button className={toolbarBtn} onClick={exportXml}>Diagrama → XML</button>
          <button className={toolbarBtn} onClick={() => downloadText(xml, 'diagrama.bpmn')}>
            Descargar .bpmn
          </button>
          <ExportButtons
            filename="diagrama-bpmn"
            getSvg={async () => (await modelerRef.current!.saveSVG()).svg}
          />
        </>
      }
      error={error}
      code={xml}
      onCodeChange={setXml}
      renderArea={<div ref={canvasRef} className="absolute inset-0" />}
    />
  );
}
