import { useEffect, useRef, useState } from 'react';
import { EditorLayout, toolbarBtn } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { ExamplesMenu } from '../ExamplesMenu';
import { downloadText } from '../export';
import { useI18n } from '../i18n';

const CODE_EXAMPLES = {
  es: {
    aws: `from diagrams import Diagram
from diagrams.aws.compute import EC2
from diagrams.aws.database import RDS
from diagrams.aws.network import ELB

with Diagram("arquitectura"):
    lb = ELB("balanceador")
    web = EC2("web")
    db = RDS("db")
    lb >> web >> db
`,
    gcp: `from diagrams import Diagram
from diagrams.gcp.compute import GCE
from diagrams.gcp.database import SQL
from diagrams.gcp.network import LoadBalancing

with Diagram("arquitectura-gcp"):
    lb = LoadBalancing("balanceador")
    web = GCE("web")
    db = SQL("db")
    lb >> web >> db
`,
    azure: `from diagrams import Diagram
from diagrams.azure.compute import VM
from diagrams.azure.database import SQLDatabases
from diagrams.azure.network import LoadBalancers

with Diagram("arquitectura-azure"):
    lb = LoadBalancers("balanceador")
    web = VM("web")
    db = SQLDatabases("db")
    lb >> web >> db
`,
    k8s: `from diagrams import Diagram
from diagrams.k8s.compute import Deployment, Pod
from diagrams.k8s.network import Service, Ingress

with Diagram("arquitectura-k8s"):
    ing = Ingress("ingress")
    svc = Service("service")
    dep = Deployment("deployment")
    pod = Pod("pod")
    ing >> svc >> dep >> pod
`,
    onprem: `from diagrams import Diagram
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
  en: {
    aws: `from diagrams import Diagram
from diagrams.aws.compute import EC2
from diagrams.aws.database import RDS
from diagrams.aws.network import ELB

with Diagram("architecture"):
    lb = ELB("balancer")
    web = EC2("web")
    db = RDS("db")
    lb >> web >> db
`,
    gcp: `from diagrams import Diagram
from diagrams.gcp.compute import GCE
from diagrams.gcp.database import SQL
from diagrams.gcp.network import LoadBalancing

with Diagram("gcp-architecture"):
    lb = LoadBalancing("balancer")
    web = GCE("web")
    db = SQL("db")
    lb >> web >> db
`,
    azure: `from diagrams import Diagram
from diagrams.azure.compute import VM
from diagrams.azure.database import SQLDatabases
from diagrams.azure.network import LoadBalancers

with Diagram("azure-architecture"):
    lb = LoadBalancers("balancer")
    web = VM("web")
    db = SQLDatabases("db")
    lb >> web >> db
`,
    k8s: `from diagrams import Diagram
from diagrams.k8s.compute import Deployment, Pod
from diagrams.k8s.network import Service, Ingress

with Diagram("k8s-architecture"):
    ing = Ingress("ingress")
    svc = Service("service")
    dep = Deployment("deployment")
    pod = Pod("pod")
    ing >> svc >> dep >> pod
`,
    onprem: `from diagrams import Diagram
from diagrams.onprem.network import Nginx
from diagrams.onprem.compute import Server
from diagrams.onprem.database import PostgreSQL
from diagrams.onprem.queue import Kafka

with Diagram("onprem-architecture"):
    lb = Nginx("nginx")
    web = Server("app")
    queue = Kafka("queue")
    db = PostgreSQL("db")
    lb >> web >> queue >> db
`,
  },
};

export default function PythonDiagramsEditor() {
  const { t, language } = useI18n();
  const [code, setCode] = useState(() => CODE_EXAMPLES[language].aws);
  const [svgMarkup, setSvgMarkup] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const examples = [
    { label: t.pythonDiagrams.examples.aws, code: CODE_EXAMPLES[language].aws },
    { label: t.pythonDiagrams.examples.gcp, code: CODE_EXAMPLES[language].gcp },
    { label: t.pythonDiagrams.examples.azure, code: CODE_EXAMPLES[language].azure },
    { label: t.pythonDiagrams.examples.k8s, code: CODE_EXAMPLES[language].k8s },
    { label: t.pythonDiagrams.examples.onprem, code: CODE_EXAMPLES[language].onprem },
  ];

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
    render(CODE_EXAMPLES[language].aws);
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
            accept=".py,.txt"
            label={t.openFileBtn('.py')}
            onOpen={(text) => {
              setCode(text);
              render(text);
            }}
          />
          <button className={toolbarBtn} onClick={() => render(code)} disabled={loading}>
            {loading ? t.renderingBtn : t.renderBtn}
          </button>
          <button className={toolbarBtn} onClick={() => downloadText(code, 'diagrama.py')}>
            {t.downloadFileBtn('.py')}
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
