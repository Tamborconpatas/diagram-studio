export type ExportFormat = 'svg' | 'png' | 'jpg';

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function getSvgDims(svgMarkup: string): { w: number; h: number } {
  const svg = new DOMParser().parseFromString(svgMarkup, 'image/svg+xml').documentElement;
  const w = parseFloat(svg.getAttribute('width') || '');
  const h = parseFloat(svg.getAttribute('height') || '');
  if (w > 0 && h > 0) return { w, h };
  const viewBox = svg.getAttribute('viewBox')?.split(/\s+/).map(Number);
  if (viewBox?.length === 4) return { w: viewBox[2], h: viewBox[3] };
  return { w: 1600, h: 1000 };
}

// scale=4 renders at 4x the diagram's native resolution so raster exports stay crisp.
async function svgToRaster(svgMarkup: string, format: 'png' | 'jpg', scale = 4): Promise<Blob> {
  const { w, h } = getSvgDims(svgMarkup);
  const svgUrl = URL.createObjectURL(new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('No se pudo rasterizar el SVG'));
      el.src = svgUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext('2d')!;
    if (format === 'jpg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('toBlob falló'))),
        format === 'jpg' ? 'image/jpeg' : 'image/png',
        1, // máxima calidad
      ),
    );
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

export async function downloadSvgMarkup(svgMarkup: string, format: ExportFormat, filename: string) {
  if (format === 'svg') {
    triggerDownload(new Blob([svgMarkup], { type: 'image/svg+xml' }), `${filename}.svg`);
    return;
  }
  const blob = await svgToRaster(svgMarkup, format);
  triggerDownload(blob, `${filename}.${format}`);
}

export function downloadText(text: string, filename: string) {
  triggerDownload(new Blob([text], { type: 'text/plain;charset=utf-8' }), filename);
}

export { triggerDownload };
