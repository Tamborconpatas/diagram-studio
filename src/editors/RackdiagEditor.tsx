import CliBackedEditor from './CliBackedEditor';
import { useI18n } from '../i18n';

const CODE_EXAMPLES_STATIC = {
  simple: `rackdiag {
  16U;
  1: UPS;
  2: Switch;
  3: Router;
  4: Server-1;
  5: Server-2;
  6: Server-3;
}
`,
  withUnits: `rackdiag {
  16U;
  1: UPS [2U];
  3: Switch;
  4: Router;
  5: Firewall [2U];
  7: Storage [4U];
}
`,
};

const CODE_EXAMPLES = { es: CODE_EXAMPLES_STATIC, en: CODE_EXAMPLES_STATIC };

export default function RackdiagEditor() {
  const { t } = useI18n();
  return (
    <CliBackedEditor
      apiPath="rackdiag"
      examples={CODE_EXAMPLES}
      exampleLabels={t.rackdiag.examples}
      fileExt=".diag"
      downloadFilename="diagrama.diag"
      exportFilename="diagrama-rackdiag"
    />
  );
}
