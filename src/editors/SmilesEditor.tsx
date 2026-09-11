import { useEffect, useRef, useState } from 'react';
import SmilesDrawer from 'smiles-drawer';
import { EditorLayout, toolbarBtn } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { ExamplesMenu } from '../ExamplesMenu';
import { downloadText } from '../export';
import { useI18n } from '../i18n';

const CODE_EXAMPLES = {
  aspirin: 'CC(=O)Oc1ccccc1C(=O)O\n',
  caffeine: 'Cn1cnc2c1c(=O)n(C)c(=O)n2C\n',
  glucose: 'OC[C@H]1OC(O)[C@H](O)[C@@H](O)[C@@H]1O\n',
};

export default function SmilesEditor() {
  const { t } = useI18n();
  const svgRef = useRef<SVGSVGElement>(null);
  const [code, setCode] = useState(() => CODE_EXAMPLES.aspirin);
  const [error, setError] = useState<string | null>(null);

  const examples = [
    { label: t.smiles.examples.aspirin, code: CODE_EXAMPLES.aspirin },
    { label: t.smiles.examples.caffeine, code: CODE_EXAMPLES.caffeine },
    { label: t.smiles.examples.glucose, code: CODE_EXAMPLES.glucose },
  ];

  const render = (src: string) => {
    const smiles = src.trim();
    SmilesDrawer.parse(
      smiles,
      (tree: unknown) => {
        if (!svgRef.current) return;
        const drawer = new SmilesDrawer.SvgDrawer({ width: svgRef.current.clientWidth || 600, height: svgRef.current.clientHeight || 400 });
        drawer.draw(tree, svgRef.current, 'light');
        setError(null);
      },
      (err: Error) => setError(err.message || String(err)),
    );
  };

  const getSvg = async () => svgRef.current?.outerHTML ?? '';

  useEffect(() => {
    render(CODE_EXAMPLES.aspirin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            accept=".smi,.txt"
            label={t.openFileBtn('.smi')}
            onOpen={(text) => {
              setCode(text);
              render(text);
            }}
          />
          <button className={toolbarBtn} onClick={() => render(code)}>{t.renderBtn}</button>
          <button className={toolbarBtn} onClick={() => downloadText(code, 'molecula.smi')}>
            {t.downloadFileBtn('.smi')}
          </button>
          <ExportButtons filename="diagrama-smiles" getSvg={getSvg} />
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
