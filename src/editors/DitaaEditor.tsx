import CliBackedEditor from './CliBackedEditor';
import { useI18n } from '../i18n';

const CODE_EXAMPLES = {
  es: {
    simple: `+--------+   +----------+   +-------+
| Cliente|-->| Servidor |-->|  DB   |
+--------+   +----------+   +-------+
`,
    decision: `+---------+
| Entrada |
+---------+
     |
     v
 /--------\\
< ¿Válido? >
 \\--------/
   |     |
  Sí     No
   |     |
   v     v
+-----+ +-------+
| OK  | | Error |
+-----+ +-------+
`,
    colors: `+------------+
| cREDCache  |
+------------+
     |
     v
+------------+
| cGREOrigen |
+------------+
     |
     v
+------------+
|  cBLULog   |
+------------+
`,
    rounded: `/---------\\
| Sistema |
\\---------/
     |
     v
/-----------\\
| Respuesta |
\\-----------/
`,
  },
  en: {
    simple: `+--------+   +----------+   +-------+
| Client |-->|  Server  |-->|  DB   |
+--------+   +----------+   +-------+
`,
    decision: `+---------+
|  Input  |
+---------+
     |
     v
 /--------\\
<  Valid?  >
 \\--------/
   |     |
  Yes    No
   |     |
   v     v
+-----+ +-------+
| OK  | | Error |
+-----+ +-------+
`,
    colors: `+------------+
| cREDCache  |
+------------+
     |
     v
+------------+
| cGREOrigen |
+------------+
     |
     v
+------------+
|  cBLULog   |
+------------+
`,
    rounded: `/---------\\
| System  |
\\---------/
     |
     v
/-----------\\
| Response  |
\\-----------/
`,
  },
};

export default function DitaaEditor() {
  const { t } = useI18n();
  return (
    <CliBackedEditor
      apiPath="ditaa"
      examples={CODE_EXAMPLES}
      exampleLabels={t.ditaa.examples}
      fileExt=".ditaa"
      downloadFilename="diagrama.ditaa"
      exportFilename="diagrama-ditaa"
    />
  );
}
