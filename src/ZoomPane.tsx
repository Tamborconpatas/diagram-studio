import { useEffect, useRef, useState, type ReactNode, type MouseEvent, type TouchEvent, type WheelEvent } from 'react';
import { Minus, Plus, Maximize } from 'lucide-react';

const MIN_ZOOM = 0.05;
const MAX_ZOOM = 8;
const WHEEL_FACTOR = 1.1;
// Fit-to-view leaves a little breathing room instead of touching the edges.
const FIT_MARGIN = 0.92;

// Most render areas (every CLI-backed format, plus Graphviz/Nomnoml/Pikchr/
// SMILES/ABC/WaveDrom/VegaLite/Sankey/PythonDiagrams/PlantUML/Mermaid) are a
// static SVG or image with zero built-in interactivity — wheel just scrolled
// the small overflow-auto box, and there was no way to pan at all. This
// wraps arbitrary renderArea content in CSS-transform pan/zoom.
//
// Not used for BPMN (bpmn-js) or Markmap (markmap-view/d3-zoom), which
// already ship their own wheel-zoom/drag-pan on their canvas — stacking this
// on top would fight the library for the same mouse events.
export function ZoomPane({ children }: { children: ReactNode }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  // display:contents so this ref doesn't add a box of its own to measure —
  // renderArea's own root element (children's single wrapping div/svg) is
  // what actually carries the diagram's natural (unscaled) size, reachable
  // as its scrollWidth/scrollHeight regardless of that root's own overflow
  // setting (scrollWidth always reports full extent, clipped or not).
  const contentRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

  // Scales the diagram down (never up) to fit the visible pane on load and
  // whenever the rendered diagram changes — without this, anything larger
  // than the pane starts clipped in a corner with no hint there's more to
  // see, which is what "el actdiag se ve horrible" was about.
  const fitToView = () => {
    const container = containerRef.current;
    const target = contentRef.current?.firstElementChild as HTMLElement | null;
    if (!container || !target) return;
    const cw = target.scrollWidth;
    const ch = target.scrollHeight;
    if (!cw || !ch) return;
    const rect = container.getBoundingClientRect();
    const scale = clampZoom(Math.min((rect.width / cw) * FIT_MARGIN, (rect.height / ch) * FIT_MARGIN, 1));
    setZoom(isFinite(scale) && scale > 0 ? scale : 1);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    fitToView();
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;
    // Content mutations (a new diagram replacing the old one, e.g. a
    // different example or re-render) and container resizes (sidebar
    // collapse/expand, window resize) both warrant re-fitting.
    const mo = new MutationObserver(fitToView);
    mo.observe(content, { childList: true, subtree: true, attributes: true });
    const ro = new ResizeObserver(fitToView);
    ro.observe(container);
    return () => {
      mo.disconnect();
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Zooms while keeping the point under (clientX, clientY) visually fixed —
  // without this, zooming toward a corner would fling the diagram off-screen.
  const zoomBy = (factor: number, clientX?: number, clientY?: number) => {
    const z = zoomRef.current;
    const next = clampZoom(z * factor);
    const ratio = next / z;
    if (clientX != null && clientY != null && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const cx = clientX - rect.left - rect.width / 2;
      const cy = clientY - rect.top - rect.height / 2;
      setPan((p) => ({ x: cx - (cx - p.x) * ratio, y: cy - (cy - p.y) * ratio }));
    }
    setZoom(next);
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    zoomBy(e.deltaY < 0 ? WHEEL_FACTOR : 1 / WHEEL_FACTOR, e.clientX, e.clientY);
  };

  const onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
  };
  const onMouseMove = (e: MouseEvent) => {
    const d = dragRef.current;
    if (!d) return;
    setPan({ x: d.panX + (e.clientX - d.startX), y: d.panY + (e.clientY - d.startY) });
  };
  const endDrag = () => {
    dragRef.current = null;
  };

  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    dragRef.current = { startX: t.clientX, startY: t.clientY, panX: pan.x, panY: pan.y };
  };
  const onTouchMove = (e: TouchEvent) => {
    const d = dragRef.current;
    if (!d || e.touches.length !== 1) return;
    const t = e.touches[0];
    setPan({ x: d.panX + (t.clientX - d.startX), y: d.panY + (t.clientY - d.startY) });
  };

  const zoomBtn =
    'flex items-center justify-center w-8 h-8 rounded-md text-zinc-400 hover:text-teal-400 hover:bg-zinc-800/80 cursor-pointer transition-colors';

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden relative cursor-grab active:cursor-grabbing touch-none select-none"
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={endDrag}
    >
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
      >
        <div ref={contentRef} style={{ display: 'contents' }}>
          {children}
        </div>
      </div>
      <div className="absolute bottom-4 right-4 flex flex-col gap-0.5 bg-zinc-950/90 border border-zinc-800 rounded-lg p-1 backdrop-blur-sm">
        <button onClick={() => zoomBy(1.25)} className={zoomBtn} title="Zoom in">
          <Plus className="w-4 h-4" />
        </button>
        <button onClick={() => zoomBy(1 / 1.25)} className={zoomBtn} title="Zoom out">
          <Minus className="w-4 h-4" />
        </button>
        <button onClick={fitToView} className={zoomBtn} title="Fit / reset">
          <Maximize className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
