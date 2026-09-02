import { useEffect, useState } from 'react';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { EditorLayout, toolbarBtn } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { ExamplesMenu } from '../ExamplesMenu';
import { downloadText } from '../export';

const DEFAULT_CODE = `Salario [1500] Presupuesto
Presupuesto [600] Vivienda
Presupuesto [400] Comida
Presupuesto [300] Ahorro
Presupuesto [200] Ocio
`;

const EXAMPLES = [
  { label: 'Presupuesto', code: DEFAULT_CODE },
  {
    label: 'Energía',
    code: `Planta [100] Red
Red [45] Residencial
Red [35] Industrial
Red [20] Comercial
Residencial [10] Pérdidas
`,
  },
  {
    label: 'Embudo de ventas',
    code: `Visitas [10000] Registros
Registros [2500] Prueba gratis
Prueba gratis [800] Clientes pagos
Visitas [7500] Rebote
Registros [2200] Abandono
`,
  },
] as const;

const PALETTE = ['#14b8a6', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#22c55e', '#ec4899', '#64748b'];

// SankeyMATIC-style plain text: "Source [amount] Target" per line.
const LINE_RE = /^\s*(.+?)\s*\[\s*([\d.]+)\s*\]\s*(.+?)\s*$/;

function parse(code: string) {
  const names: string[] = [];
  const nameIndex = new Map<string, number>();
  const index = (name: string) => {
    if (!nameIndex.has(name)) {
      nameIndex.set(name, names.length);
      names.push(name);
    }
    return nameIndex.get(name)!;
  };

  const links: { source: number; target: number; value: number }[] = [];
  for (const rawLine of code.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || line.startsWith('//')) continue;
    const match = LINE_RE.exec(line);
    if (!match) throw new Error(`Línea inválida (formato: "Origen [monto] Destino"): "${line}"`);
    const [, source, amount, target] = match;
    links.push({ source: index(source), target: index(target), value: parseFloat(amount) });
  }
  if (!links.length) throw new Error('No hay flujos que dibujar');

  return { nodes: names.map((name) => ({ name })), links };
}

function buildSvg(code: string): string {
  const width = 900;
  const height = 500;
  const graph = sankey<{ name: string }, object>()
    .nodeWidth(18)
    .nodePadding(14)
    .extent([
      [1, 1],
      [width - 1, height - 1],
    ])(parse(code));

  const linkPath = sankeyLinkHorizontal();

  const nodeEls = graph.nodes
    .map((n, i) => {
      const color = PALETTE[i % PALETTE.length];
      const midY = ((n.y0 ?? 0) + (n.y1 ?? 0)) / 2;
      const labelRight = (n.x0 ?? 0) < width / 2;
      const labelX = labelRight ? (n.x1 ?? 0) + 6 : (n.x0 ?? 0) - 6;
      return (
        `<rect x="${n.x0}" y="${n.y0}" width="${(n.x1 ?? 0) - (n.x0 ?? 0)}" height="${(n.y1 ?? 0) - (n.y0 ?? 0)}" fill="${color}" />` +
        `<text x="${labelX}" y="${midY}" dominant-baseline="middle" text-anchor="${labelRight ? 'start' : 'end'}" font-family="sans-serif" font-size="13" fill="#1a1a1a">${n.name}</text>`
      );
    })
    .join('');

  const linkEls = graph.links
    .map((l, i) => {
      const d = linkPath(l as never);
      const color = PALETTE[i % PALETTE.length];
      return `<path d="${d}" fill="none" stroke="${color}" stroke-opacity="0.35" stroke-width="${Math.max(1, l.width ?? 1)}" />`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${linkEls}${nodeEls}</svg>`;
}

export default function SankeyEditor() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [svgMarkup, setSvgMarkup] = useState('');
  const [error, setError] = useState<string | null>(null);

  const render = (src: string) => {
    try {
      setSvgMarkup(buildSvg(src));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  useEffect(() => {
    render(DEFAULT_CODE);
  }, []);

  return (
    <EditorLayout
      examples={
        <ExamplesMenu
          examples={EXAMPLES}
          onSelect={(exampleCode) => {
            setCode(exampleCode);
            render(exampleCode);
          }}
        />
      }
      actions={
        <>
          <OpenFileButton
            accept=".txt"
            label="Abrir .txt"
            onOpen={(text) => {
              setCode(text);
              render(text);
            }}
          />
          <button className={toolbarBtn} onClick={() => render(code)}>Renderizar</button>
          <button className={toolbarBtn} onClick={() => downloadText(code, 'diagrama-sankey.txt')}>
            Descargar .txt
          </button>
          <ExportButtons filename="diagrama-sankey" getSvg={async () => svgMarkup} />
        </>
      }
      error={error}
      code={code}
      onCodeChange={setCode}
      renderArea={
        <div
          className="w-full h-full flex items-center justify-center overflow-auto p-6 bg-white [&_svg]:max-w-none"
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
      }
    />
  );
}
