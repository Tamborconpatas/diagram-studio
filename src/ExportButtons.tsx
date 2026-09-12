import { useState } from 'react';
import { downloadSvgMarkup, type ExportFormat } from './export';
import { toolbarBtn } from './EditorLayout';

export function ExportButtons({ getSvg, filename }: { getSvg: () => Promise<string>; filename: string }) {
  const [error, setError] = useState<string | null>(null);

  const handleExport = async (format: ExportFormat) => {
    try {
      const svg = await getSvg();
      await downloadSvgMarkup(svg, format, filename);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <>
      <button className={toolbarBtn} onClick={() => handleExport('svg')}>SVG</button>
      <button className={toolbarBtn} onClick={() => handleExport('png')}>PNG</button>
      <button className={toolbarBtn} onClick={() => handleExport('jpg')}>JPG</button>
      {error && <span className="text-red-400 text-xs font-mono-code self-center">{error}</span>}
    </>
  );
}
