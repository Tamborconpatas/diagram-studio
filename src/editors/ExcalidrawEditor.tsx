import { useRef } from 'react';
import { Excalidraw, exportToSvg, serializeAsJSON } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import '@excalidraw/excalidraw/index.css';
import { toolbarBtn } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { downloadText } from '../export';

export default function ExcalidrawEditor() {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);

  const getSvg = async () => {
    const api = apiRef.current;
    if (!api) return '';
    const svgEl = await exportToSvg({
      elements: api.getSceneElements(),
      appState: api.getAppState(),
      files: api.getFiles(),
    });
    return new XMLSerializer().serializeToString(svgEl);
  };

  const downloadScene = () => {
    const api = apiRef.current;
    if (!api) return;
    const json = serializeAsJSON(api.getSceneElements(), api.getAppState(), api.getFiles(), 'local');
    downloadText(json, 'diagrama.excalidraw');
  };

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-2 p-3 border-b border-zinc-800/80 bg-zinc-950/40">
        <button className={toolbarBtn} onClick={downloadScene}>Descargar .excalidraw</button>
        <ExportButtons filename="diagrama-excalidraw" getSvg={getSvg} />
      </div>
      <div className="flex-1 relative">
        <Excalidraw excalidrawAPI={(api) => (apiRef.current = api)} theme="dark" />
      </div>
    </div>
  );
}
