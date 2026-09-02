import { useEffect, useRef, useState } from 'react';
import { Excalidraw, exportToSvg, serializeAsJSON, convertToExcalidrawElements } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import '@excalidraw/excalidraw/index.css';
import { toolbarBtn } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { downloadText } from '../export';
import type { PendingScene } from '../sceneHandoff';

export default function ExcalidrawEditor({
  pendingScene,
  onSceneConsumed,
}: {
  pendingScene?: PendingScene | null;
  onSceneConsumed?: () => void;
}) {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const [apiReady, setApiReady] = useState(false);

  useEffect(() => {
    if (!apiReady || !pendingScene) return;
    const api = apiRef.current!;
    api.updateScene({ elements: convertToExcalidrawElements(pendingScene.elements) });
    if (pendingScene.files) api.addFiles(Object.values(pendingScene.files));
    api.scrollToContent(undefined, { fitToContent: true });
    onSceneConsumed?.();
  }, [apiReady, pendingScene, onSceneConsumed]);

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
        <Excalidraw
          excalidrawAPI={(api) => {
            apiRef.current = api;
            setApiReady(true);
          }}
          theme="dark"
        />
      </div>
    </div>
  );
}
