import { useEffect, useState } from 'react';
import { EditorLayout, toolbarBtn } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { ExamplesMenu } from '../ExamplesMenu';
import { downloadText } from '../export';

const DEFAULT_CODE = `Table users {
  id int [pk]
  name varchar
  email varchar
}

Table posts {
  id int [pk]
  user_id int
  title varchar
}

Ref: posts.user_id > users.id
`;

const EXAMPLES = [
  { label: '2 tablas', code: DEFAULT_CODE },
  {
    label: 'Muchos a muchos',
    code: `Table students {
  id int [pk]
  name varchar
}

Table courses {
  id int [pk]
  title varchar
}

Table enrollments {
  student_id int
  course_id int
  enrolled_at date
}

Ref: enrollments.student_id > students.id
Ref: enrollments.course_id > courses.id
`,
  },
  {
    label: 'Con enum e índices',
    code: `Enum estado_pedido {
  pendiente
  pagado
  enviado
  cancelado
}

Table pedidos {
  id int [pk]
  cliente_id int [not null]
  estado estado_pedido [default: 'pendiente']
  creado_en timestamp

  indexes {
    (cliente_id, creado_en) [name: "idx_cliente_fecha"]
  }
}

Table clientes {
  id int [pk]
  email varchar [unique]
}

Ref: pedidos.cliente_id > clientes.id
`,
  },
] as const;

export default function DbmlEditor() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [svgMarkup, setSvgMarkup] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const render = async (src: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/render-dbml', {
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
            accept=".dbml,.txt"
            label="Abrir .dbml"
            onOpen={(text) => {
              setCode(text);
              render(text);
            }}
          />
          <button className={toolbarBtn} onClick={() => render(code)} disabled={loading}>
            {loading ? 'Renderizando…' : 'Renderizar'}
          </button>
          <button className={toolbarBtn} onClick={() => downloadText(code, 'esquema.dbml')}>
            Descargar .dbml
          </button>
          <ExportButtons filename="diagrama-dbml" getSvg={async () => svgMarkup} />
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
