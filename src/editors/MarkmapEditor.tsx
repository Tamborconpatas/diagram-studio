import { useEffect, useRef, useState } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';
import { EditorLayout, toolbarBtn } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { ExamplesMenu } from '../ExamplesMenu';
import { downloadText } from '../export';
import { useI18n } from '../i18n';

const CODE_EXAMPLES = {
  simple: `# Mapa mental
## Rama 1
- Idea A
- Idea B
## Rama 2
- Idea C
  - Sub-idea
`,
  project: `# Proyecto
## Diseño
- Wireframes
- Prototipo
## Desarrollo
- Backend
- Frontend
## Lanzamiento
- QA
- Deploy
`,
};

const transformer = new Transformer();

export default function MarkmapEditor() {
  const { t } = useI18n();
  const svgRef = useRef<SVGSVGElement>(null);
  const mmRef = useRef<Markmap | null>(null);
  const [code, setCode] = useState(() => CODE_EXAMPLES.simple);
  const [error, setError] = useState<string | null>(null);

  const examples = [
    { label: t.markmap.examples.simple, code: CODE_EXAMPLES.simple },
    { label: t.markmap.examples.project, code: CODE_EXAMPLES.project },
  ];

  const render = (src: string) => {
    try {
      const { root } = transformer.transform(src);
      if (!mmRef.current && svgRef.current) {
        mmRef.current = Markmap.create(svgRef.current);
      }
      mmRef.current?.setData(root).then(() => mmRef.current?.fit());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const getSvg = async () => (svgRef.current ? new XMLSerializer().serializeToString(svgRef.current) : '');

  useEffect(() => {
    render(CODE_EXAMPLES.simple);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <EditorLayout
      disableZoomPane
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
            accept=".md,.txt"
            label={t.openFileBtn('.md')}
            onOpen={(text) => {
              setCode(text);
              render(text);
            }}
          />
          <button className={toolbarBtn} onClick={() => render(code)}>{t.renderBtn}</button>
          <button className={toolbarBtn} onClick={() => downloadText(code, 'mapa.md')}>
            {t.downloadFileBtn('.md')}
          </button>
          <ExportButtons filename="diagrama-markmap" getSvg={getSvg} />
        </>
      }
      error={error}
      code={code}
      onCodeChange={setCode}
      onAutoRender={(src) => render(src)}
      renderArea={
        <div className="w-full h-full bg-white">
          <svg ref={svgRef} className="w-full h-full" />
        </div>
      }
    />
  );
}
