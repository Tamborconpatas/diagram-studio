import { useEffect, useState } from 'react';
import { renderSvg } from 'nomnoml';
import { EditorLayout, toolbarBtn } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { ExamplesMenu } from '../ExamplesMenu';
import { downloadText } from '../export';

const DEFAULT_CODE = `[<abstract>Shape]
[Shape]<:--[Circle]
[Shape]<:--[Square]
[Circle]->[Point]
[Circle|radius: float|area()]
`;

const EXAMPLES = [
  { label: 'Herencia', code: DEFAULT_CODE },
  {
    label: 'Asociación simple',
    code: `[Usuario|+nombre: string|+login()]
[Pedido|+fecha: date|+total()]
[Usuario] 1 -- * [Pedido]
`,
  },
] as const;

export default function NomnomlEditor() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [svgMarkup, setSvgMarkup] = useState('');
  const [error, setError] = useState<string | null>(null);

  const render = (src: string) => {
    try {
      setSvgMarkup(renderSvg(src));
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
            accept=".nomnoml,.txt"
            label="Abrir .nomnoml"
            onOpen={(text) => {
              setCode(text);
              render(text);
            }}
          />
          <button className={toolbarBtn} onClick={() => render(code)}>Renderizar</button>
          <button className={toolbarBtn} onClick={() => downloadText(code, 'diagrama.nomnoml')}>
            Descargar .nomnoml
          </button>
          <ExportButtons filename="diagrama-nomnoml" getSvg={async () => svgMarkup} />
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
