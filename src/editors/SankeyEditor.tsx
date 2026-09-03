import { useEffect, useRef, useState } from 'react';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { EditorLayout, toolbarBtn } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { ExamplesMenu } from '../ExamplesMenu';
import { downloadText } from '../export';
import { useI18n } from '../i18n';
import type { Translations } from '../i18n';

const CODE_EXAMPLES = {
  es: {
    budget: `Salario [1500] Presupuesto
Presupuesto [600] Vivienda
Presupuesto [400] Comida
Presupuesto [300] Ahorro
Presupuesto [200] Ocio
`,
    energy: `Planta [100] Red
Red [45] Residencial
Red [35] Industrial
Red [20] Comercial
Residencial [10] Pérdidas
`,
    funnel: `Visitas [10000] Registros
Registros [2500] Prueba gratis
Prueba gratis [800] Clientes pagos
Visitas [7500] Rebote
Registros [2200] Abandono
`,
  },
  en: {
    budget: `Salary [1500] Budget
Budget [600] Housing
Budget [400] Food
Budget [300] Savings
Budget [200] Leisure
`,
    energy: `Plant [100] Grid
Grid [45] Residential
Grid [35] Industrial
Grid [20] Commercial
Residential [10] Losses
`,
    funnel: `Visits [10000] Signups
Signups [2500] Free Trial
Free Trial [800] Paid Customers
Visits [7500] Bounce
Signups [2200] Drop-off
`,
  },
};

const PALETTE = ['#14b8a6', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#22c55e', '#ec4899', '#64748b'];

// SankeyMATIC-style plain text: "Source [amount] Target" per line.
const LINE_RE = /^\s*(.+?)\s*\[\s*([\d.]+)\s*\]\s*(.+?)\s*$/;

function parse(code: string, t: Translations) {
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
    if (!match) throw new Error(t.sankey.invalidLine(line));
    const [, source, amount, target] = match;
    links.push({ source: index(source), target: index(target), value: parseFloat(amount) });
  }
  if (!links.length) throw new Error(t.sankey.noFlows);

  return { nodes: names.map((name) => ({ name })), links };
}

function buildSvg(code: string, t: Translations): string {
  const width = 900;
  const height = 500;
  const graph = sankey<{ name: string }, object>()
    .nodeWidth(18)
    .nodePadding(14)
    .extent([
      [20, 20],
      [width - 20, height - 20],
    ]);

  const { nodes, links } = parse(code, t);
  const data = graph({
    nodes: nodes.map((d) => ({ ...d })),
    links: links.map((d) => ({ ...d })),
  });

  const linkGenerator = sankeyLinkHorizontal();
  const linkEls = data.links
    .map(
      (link, i) =>
        `<path d="${linkGenerator(link as never)}" fill="none" stroke="${PALETTE[i % PALETTE.length]}" stroke-opacity="0.45" stroke-width="${Math.max(1, link.width ?? 0)}" />`,
    )
    .join('');

  const nodeEls = data.nodes
    .map((node, i) => {
      const x0 = node.x0 ?? 0;
      const y0 = node.y0 ?? 0;
      const x1 = node.x1 ?? 0;
      const y1 = node.y1 ?? 0;
      const color = PALETTE[i % PALETTE.length];
      const isRight = x0 > width / 2;
      const textX = isRight ? x0 - 6 : x1 + 6;
      const textAnchor = isRight ? 'end' : 'start';
      return `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${Math.max(1, y1 - y0)}" fill="${color}" rx="3" />
        <text x="${textX}" y="${(y0 + y1) / 2}" dy="0.35em" font-size="12" fill="#334155" text-anchor="${textAnchor}" font-family="system-ui, sans-serif">${node.name}</text>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${linkEls}${nodeEls}</svg>`;
}

export default function SankeyEditor() {
  const { t, language } = useI18n();
  const [code, setCode] = useState(() => CODE_EXAMPLES[language].budget);
  const [svgMarkup, setSvgMarkup] = useState('');
  const [error, setError] = useState<string | null>(null);

  const examples = [
    { label: t.sankey.examples.budget, code: CODE_EXAMPLES[language].budget },
    { label: t.sankey.examples.energy, code: CODE_EXAMPLES[language].energy },
    { label: t.sankey.examples.funnel, code: CODE_EXAMPLES[language].funnel },
  ];

  const render = (src: string) => {
    try {
      setSvgMarkup(buildSvg(src, t));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const prevLangRef = useRef(language);
  useEffect(() => {
    if (prevLangRef.current !== language) {
      const prevLang = prevLangRef.current;
      prevLangRef.current = language;
      const prevCodes = Object.values(CODE_EXAMPLES[prevLang]);
      const nextCodes = Object.values(CODE_EXAMPLES[language]);
      const idx = prevCodes.indexOf(code);
      if (idx !== -1) {
        const nextCode = nextCodes[idx];
        setCode(nextCode);
        render(nextCode);
      }
    }
  }, [language, code]);

  useEffect(() => {
    render(CODE_EXAMPLES[language].budget);
  }, []);

  return (
    <EditorLayout
      examples={
        <ExamplesMenu
          examples={examples}
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
            label={t.openFileBtn('.txt')}
            onOpen={(text) => {
              setCode(text);
              render(text);
            }}
          />
          <button className={toolbarBtn} onClick={() => render(code)}>{t.renderBtn}</button>
          <button className={toolbarBtn} onClick={() => downloadText(code, 'diagrama-sankey.txt')}>
            {t.downloadFileBtn('.txt')}
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
