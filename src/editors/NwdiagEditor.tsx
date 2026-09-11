import CliBackedEditor from './CliBackedEditor';
import { useI18n } from '../i18n';

const CODE_EXAMPLES_STATIC = {
  twoNetworks: `nwdiag {
  network dmz {
    address = "210.1.1.0/24";
    web01;
    web02;
  }
  network internal {
    address = "172.16.0.0/24";
    web01;
    web02;
    db01;
  }
}
`,
  simple: `nwdiag {
  network lan {
    address = "192.168.0.0/24";
    router;
    server;
    laptop;
  }
}
`,
};

const CODE_EXAMPLES = { es: CODE_EXAMPLES_STATIC, en: CODE_EXAMPLES_STATIC };

export default function NwdiagEditor() {
  const { t } = useI18n();
  return (
    <CliBackedEditor
      apiPath="nwdiag"
      examples={CODE_EXAMPLES}
      exampleLabels={t.nwdiag.examples}
      fileExt=".diag"
      downloadFilename="diagrama.diag"
      exportFilename="diagrama-nwdiag"
    />
  );
}
