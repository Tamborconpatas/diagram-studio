import CliBackedEditor from './CliBackedEditor';
import { useI18n } from '../i18n';

const TWO_TABLES = `Table users {
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

// DBML content isn't localized (schema code, not prose), so the same set
// serves both languages.
const CODE_EXAMPLES_STATIC = {
  twoTables: TWO_TABLES,
  manyToMany: `Table students {
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
  enumIndexes: `Enum estado_pedido {
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
};

const CODE_EXAMPLES = { es: CODE_EXAMPLES_STATIC, en: CODE_EXAMPLES_STATIC };

export default function DbmlEditor() {
  const { t } = useI18n();
  return (
    <CliBackedEditor
      apiPath="dbml"
      examples={CODE_EXAMPLES}
      exampleLabels={t.dbml.examples}
      fileExt=".dbml"
      downloadFilename="esquema.dbml"
      exportFilename="diagrama-dbml"
    />
  );
}
