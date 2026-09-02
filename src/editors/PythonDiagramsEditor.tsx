import { useEffect, useState } from 'react';
import { EditorLayout, toolbarBtn } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { ExamplesMenu } from '../ExamplesMenu';
import { downloadText } from '../export';

const DEFAULT_CODE = `from diagrams import Diagram
from diagrams.aws.compute import EC2
from diagrams.aws.database import RDS
from diagrams.aws.network import ELB

with Diagram("arquitectura"):
    lb = ELB("balanceador")
    web = EC2("web")
    db = RDS("db")
    lb >> web >> db
`;

const EXAMPLES = [
  { label: 'AWS 3-capas', code: DEFAULT_CODE },
  {
    label: 'GCP',
    code: `from diagrams import Diagram
from diagrams.gcp.compute import GCE
from diagrams.gcp.database import SQL
from diagrams.gcp.network import LoadBalancing

with Diagram("arquitectura-gcp"):
    lb = LoadBalancing("balanceador")
    web = GCE("web")
    db = SQL("db")
    lb >> web >> db
`,
  },
  {
    label: 'Azure',
    code: `from diagrams import Diagram
from diagrams.azure.compute import VM
from diagrams.azure.database import SQLDatabases
from diagrams.azure.network import LoadBalancers

with Diagram("arquitectura-azure"):
    lb = LoadBalancers("balanceador")
    web = VM("web")
    db = SQLDatabases("db")
    lb >> web >> db
`,
  },
  {
    label: 'Kubernetes',
    code: `from diagrams import Diagram
from diagrams.k8s.compute import Deployment, Pod
from diagrams.k8s.network import Service, Ingress

with Diagram("arquitectura-k8s"):
    ing = Ingress("ingress")
    svc = Service("service")
    dep = Deployment("deployment")
    pod = Pod("pod")
    ing >> svc >> dep >> pod
`,
  },
  {
    label: 'On-Prem',
    code: `from diagrams import Diagram
from diagrams.onprem.network import Nginx
from diagrams.onprem.compute import Server
from diagrams.onprem.database import PostgreSQL
from diagrams.onprem.queue import Kafka

with Diagram("arquitectura-onprem"):
    lb = Nginx("nginx")
    web = Server("app")
    queue = Kafka("cola")
    db = PostgreSQL("db")
    lb >> web >> queue >> db
`,
  },
] as const;

export default function PythonDiagramsEditor() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [svgMarkup, setSvgMarkup] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const render = async (src: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/render-diagrams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: src }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`);
      setSvgMarkup(data.svg);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
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
            accept=".py,.txt"
            label="Abrir .py"
            onOpen={(text) => {
              setCode(text);
              render(text);
            }}
          />
          <button className={toolbarBtn} onClick={() => render(code)} disabled={loading}>
            {loading ? 'Renderizando…' : 'Renderizar'}
          </button>
          <button className={toolbarBtn} onClick={() => downloadText(code, 'diagrama.py')}>
            Descargar .py
          </button>
          <ExportButtons filename="diagrama-arquitectura" getSvg={async () => svgMarkup} />
        </>
      }
      error={error}
      code={code}
      onCodeChange={setCode}
      renderArea={
        <div
          className="w-full h-full flex items-center justify-center overflow-auto p-6 [&_svg]:max-w-none"
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
      }
    />
  );
}
