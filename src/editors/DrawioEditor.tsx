import { useEffect, useRef, useState } from 'react';
import { toolbarBtn } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { downloadText } from '../export';
import { useI18n } from '../i18n';

const DEFAULT_XML = `<mxfile><diagram name="Page-1"><mxGraphModel dx="800" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel></diagram></mxfile>`;

function decodeBase64Svg(dataUrl: string): string {
  const base64 = dataUrl.split(',')[1] ?? '';
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}

// Bridges to the vendored draw.io editor (public/drawio, served at /drawio/)
// over its documented embed-mode postMessage protocol: it posts {event:'init'}
// once loaded, we reply with {action:'load', xml}, then it posts
// {event:'autosave'|'save', xml} as the user edits and {event:'export', data}
// in response to an {action:'export'} request. See
// https://www.drawio.com/doc/faq/embed-mode
export default function DrawioEditor() {
  const { t } = useI18n();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const latestXmlRef = useRef(DEFAULT_XML);
  const pendingExportRef = useRef<((svg: string) => void) | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.source !== iframeRef.current?.contentWindow) return;
      let msg: { event?: string; xml?: string; data?: string };
      try {
        msg = JSON.parse(e.data);
      } catch {
        return;
      }
      if (msg.event === 'init') {
        iframeRef.current!.contentWindow!.postMessage(
          JSON.stringify({ action: 'load', xml: latestXmlRef.current, autosave: 1 }),
          '*',
        );
        setReady(true);
      } else if ((msg.event === 'autosave' || msg.event === 'save') && msg.xml) {
        latestXmlRef.current = msg.xml;
      } else if (msg.event === 'export' && msg.data) {
        pendingExportRef.current?.(decodeBase64Svg(msg.data));
        pendingExportRef.current = null;
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const getSvg = () =>
    new Promise<string>((resolve) => {
      pendingExportRef.current = resolve;
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ action: 'export', format: 'xmlsvg' }), '*');
    });

  const loadXml = (xml: string) => {
    latestXmlRef.current = xml;
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ action: 'load', xml, autosave: 1 }), '*');
  };

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-2 p-3 border-b border-zinc-800/80 bg-zinc-950/40">
        <OpenFileButton accept=".drawio,.xml" label={t.openFileBtn('.drawio')} onOpen={loadXml} />
        <button className={toolbarBtn} disabled={!ready} onClick={() => downloadText(latestXmlRef.current, 'diagrama.drawio')}>
          {t.downloadFileBtn('.drawio')}
        </button>
        <ExportButtons filename="diagrama-drawio" getSvg={getSvg} />
      </div>
      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          src="/drawio/index.html?embed=1&proto=json&spin=1&noSaveBtn=1&saveAndExit=0"
          className="absolute inset-0 w-full h-full border-0"
          title="draw.io"
        />
      </div>
    </div>
  );
}
