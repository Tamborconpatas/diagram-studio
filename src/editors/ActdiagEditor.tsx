import CliBackedEditor from './CliBackedEditor';
import { useI18n } from '../i18n';

const CODE_EXAMPLES_STATIC = {
  lanes: `actdiag {
  lane user {
    label = "User";
    start -> click;
  }
  lane system {
    label = "System";
    process -> end;
  }
  click -> process;
}
`,
  simple: `actdiag {
  start -> validate -> save -> end;
  validate -> reject [label = "invalid"];
}
`,
};

const CODE_EXAMPLES = { es: CODE_EXAMPLES_STATIC, en: CODE_EXAMPLES_STATIC };

export default function ActdiagEditor() {
  const { t } = useI18n();
  return (
    <CliBackedEditor
      apiPath="actdiag"
      examples={CODE_EXAMPLES}
      exampleLabels={t.actdiag.examples}
      fileExt=".diag"
      downloadFilename="diagrama.diag"
      exportFilename="diagrama-actdiag"
    />
  );
}
