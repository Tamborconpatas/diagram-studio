import CliBackedEditor from './CliBackedEditor';
import { useI18n } from '../i18n';

// seqdiag syntax isn't localized, same static-content approach as DbmlEditor.
const CODE_EXAMPLES_STATIC = {
  simple: `seqdiag {
  client -> server [label = "login"];
  server -> db [label = "query"];
  db -> server [label = "result"];
  server -> client [label = "ok"];
}
`,
  async: `seqdiag {
  client ->> server [label = "async request"];
  server -->> client [label = "ack"];
}
`,
  selfCall: `seqdiag {
  client -> server [label = "request"];
  server -> server [label = "validate", leftnote = "checks auth"];
  server -> client [label = "response"];
}
`,
};

const CODE_EXAMPLES = { es: CODE_EXAMPLES_STATIC, en: CODE_EXAMPLES_STATIC };

export default function SeqdiagEditor() {
  const { t } = useI18n();
  return (
    <CliBackedEditor
      apiPath="seqdiag"
      examples={CODE_EXAMPLES}
      exampleLabels={t.seqdiag.examples}
      fileExt=".diag"
      downloadFilename="diagrama.diag"
      exportFilename="diagrama-seqdiag"
    />
  );
}
