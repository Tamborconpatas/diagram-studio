import { useEffect, useRef, useState } from 'react';
import Modeler from 'bpmn-js/lib/Modeler';
import type Modeling from 'bpmn-js/lib/features/modeling/Modeling';
import { layoutProcess } from 'bpmn-auto-layout';
import { EditorLayout, toolbarBtn, toolbarSelect } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { ExamplesMenu } from '../ExamplesMenu';
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

const GATEWAY_EXAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="Start" name="Inicio"><bpmn:outgoing>F1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:task id="Revisar" name="Revisar solicitud"><bpmn:incoming>F1</bpmn:incoming><bpmn:outgoing>F2</bpmn:outgoing></bpmn:task>
    <bpmn:exclusiveGateway id="Gw" name="¿Aprobada?"><bpmn:incoming>F2</bpmn:incoming><bpmn:outgoing>F3</bpmn:outgoing><bpmn:outgoing>F4</bpmn:outgoing></bpmn:exclusiveGateway>
    <bpmn:task id="Aprobar" name="Aprobar"><bpmn:incoming>F3</bpmn:incoming><bpmn:outgoing>F5</bpmn:outgoing></bpmn:task>
    <bpmn:task id="Rechazar" name="Rechazar"><bpmn:incoming>F4</bpmn:incoming><bpmn:outgoing>F6</bpmn:outgoing></bpmn:task>
    <bpmn:endEvent id="End" name="Fin"><bpmn:incoming>F5</bpmn:incoming><bpmn:incoming>F6</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="F1" sourceRef="Start" targetRef="Revisar" />
    <bpmn:sequenceFlow id="F2" sourceRef="Revisar" targetRef="Gw" />
    <bpmn:sequenceFlow id="F3" name="Sí" sourceRef="Gw" targetRef="Aprobar" />
    <bpmn:sequenceFlow id="F4" name="No" sourceRef="Gw" targetRef="Rechazar" />
    <bpmn:sequenceFlow id="F5" sourceRef="Aprobar" targetRef="End" />
    <bpmn:sequenceFlow id="F6" sourceRef="Rechazar" targetRef="End" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="D1"><bpmndi:BPMNPlane id="P1" bpmnElement="Process_1">
    <bpmndi:BPMNShape id="s1" bpmnElement="Start"><dc:Bounds x="140" y="151" width="36" height="36" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="s2" bpmnElement="Revisar"><dc:Bounds x="220" y="129" width="100" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="s3" bpmnElement="Gw"><dc:Bounds x="365" y="144" width="50" height="50" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="s4" bpmnElement="Aprobar"><dc:Bounds x="460" y="40" width="100" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="s5" bpmnElement="Rechazar"><dc:Bounds x="460" y="220" width="100" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="s6" bpmnElement="End"><dc:Bounds x="622" y="151" width="36" height="36" /></bpmndi:BPMNShape>
    <bpmndi:BPMNEdge id="e1" bpmnElement="F1"><di:waypoint x="176" y="169" /><di:waypoint x="220" y="169" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="e2" bpmnElement="F2"><di:waypoint x="320" y="169" /><di:waypoint x="365" y="169" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="e3" bpmnElement="F3"><di:waypoint x="390" y="144" /><di:waypoint x="390" y="80" /><di:waypoint x="460" y="80" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="e4" bpmnElement="F4"><di:waypoint x="390" y="194" /><di:waypoint x="390" y="260" /><di:waypoint x="460" y="260" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="e5" bpmnElement="F5"><di:waypoint x="560" y="80" /><di:waypoint x="640" y="80" /><di:waypoint x="640" y="151" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="e6" bpmnElement="F6"><di:waypoint x="560" y="260" /><di:waypoint x="640" y="260" /><di:waypoint x="640" y="187" /></bpmndi:BPMNEdge>
  </bpmndi:BPMNPlane></bpmndi:BPMNDiagram>
</bpmn:definitions>`;

const POOL_EXAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collab">
    <bpmn:participant id="Part" name="Equipo" processRef="Process_1" />
  </bpmn:collaboration>
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:laneSet id="Lanes">
      <bpmn:lane id="L1" name="Cliente"><bpmn:flowNodeRef>Start</bpmn:flowNodeRef><bpmn:flowNodeRef>Pedir</bpmn:flowNodeRef></bpmn:lane>
      <bpmn:lane id="L2" name="Soporte"><bpmn:flowNodeRef>Atender</bpmn:flowNodeRef><bpmn:flowNodeRef>End</bpmn:flowNodeRef></bpmn:lane>
    </bpmn:laneSet>
    <bpmn:startEvent id="Start" name="Inicio"><bpmn:outgoing>F1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:task id="Pedir" name="Hacer pedido"><bpmn:incoming>F1</bpmn:incoming><bpmn:outgoing>F2</bpmn:outgoing></bpmn:task>
    <bpmn:task id="Atender" name="Atender pedido"><bpmn:incoming>F2</bpmn:incoming><bpmn:outgoing>F3</bpmn:outgoing></bpmn:task>
    <bpmn:endEvent id="End" name="Fin"><bpmn:incoming>F3</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="F1" sourceRef="Start" targetRef="Pedir" />
    <bpmn:sequenceFlow id="F2" sourceRef="Pedir" targetRef="Atender" />
    <bpmn:sequenceFlow id="F3" sourceRef="Atender" targetRef="End" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="D1"><bpmndi:BPMNPlane id="P1" bpmnElement="Collab">
    <bpmndi:BPMNShape id="pd" bpmnElement="Part" isHorizontal="true"><dc:Bounds x="140" y="60" width="500" height="240" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="l1d" bpmnElement="L1" isHorizontal="true"><dc:Bounds x="170" y="60" width="470" height="120" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="l2d" bpmnElement="L2" isHorizontal="true"><dc:Bounds x="170" y="180" width="470" height="120" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="s1" bpmnElement="Start"><dc:Bounds x="220" y="102" width="36" height="36" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="s2" bpmnElement="Pedir"><dc:Bounds x="310" y="80" width="100" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="s3" bpmnElement="Atender"><dc:Bounds x="310" y="220" width="100" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="s4" bpmnElement="End"><dc:Bounds x="470" y="242" width="36" height="36" /></bpmndi:BPMNShape>
    <bpmndi:BPMNEdge id="e1" bpmnElement="F1"><di:waypoint x="256" y="120" /><di:waypoint x="310" y="120" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="e2" bpmnElement="F2"><di:waypoint x="360" y="160" /><di:waypoint x="360" y="220" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="e3" bpmnElement="F3"><di:waypoint x="410" y="260" /><di:waypoint x="470" y="260" /></bpmndi:BPMNEdge>
  </bpmndi:BPMNPlane></bpmndi:BPMNDiagram>
</bpmn:definitions>`;

const EXAMPLES = [
  { label: 'Simple', code: EMPTY_DIAGRAM },
  { label: 'Gateway (aprobación)', code: GATEWAY_EXAMPLE },
  { label: 'Pool con lanes', code: POOL_EXAMPLE },
] as const;

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
      examples={
        <ExamplesMenu
          examples={EXAMPLES}
          onSelect={(exampleCode) => {
            setXml(exampleCode);
            loadXml(exampleCode);
          }}
        />
      }
      actions={
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
