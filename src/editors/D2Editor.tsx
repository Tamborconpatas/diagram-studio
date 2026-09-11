import CliBackedEditor from './CliBackedEditor';
import { useI18n } from '../i18n';

// D2 syntax isn't localized, same static-content approach as DbmlEditor.
const CODE_EXAMPLES_STATIC = {
  simple: `client -> server: request
server -> client: response
`,
  containers: `frontend: {
  app
  ui
}
backend: {
  api
  db
}
frontend.app -> backend.api
backend.api -> backend.db
`,
  shapes: `start: {shape: circle}
process: {shape: rectangle}
decision: {shape: diamond}
end: {shape: circle}

start -> process -> decision
decision -> end: yes
decision -> process: no
`,
};

const CODE_EXAMPLES = { es: CODE_EXAMPLES_STATIC, en: CODE_EXAMPLES_STATIC };

export default function D2Editor() {
  const { t } = useI18n();
  return (
    <CliBackedEditor
      apiPath="d2"
      examples={CODE_EXAMPLES}
      exampleLabels={t.d2.examples}
      fileExt=".d2"
      downloadFilename="diagrama.d2"
      exportFilename="diagrama-d2"
    />
  );
}
