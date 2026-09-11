import CliBackedEditor from './CliBackedEditor';
import { useI18n } from '../i18n';

const CODE_EXAMPLES_STATIC = {
  tcpHeader: `packetdiag {
  colwidth = 32;
  0-15: Source Port;
  16-31: Destination Port;
  32-63: Sequence Number;
  64-95: Acknowledgment Number;
  96-99: Data Offset;
  100-105: Reserved;
  106: URG;
  107: ACK;
  108: PSH;
  109: RST;
  110: SYN;
  111: FIN;
  112-127: Window;
}
`,
  simple: `packetdiag {
  colwidth = 16;
  0-3: Version;
  4-7: Type;
  8-15: Length;
}
`,
};

const CODE_EXAMPLES = { es: CODE_EXAMPLES_STATIC, en: CODE_EXAMPLES_STATIC };

export default function PacketdiagEditor() {
  const { t } = useI18n();
  return (
    <CliBackedEditor
      apiPath="packetdiag"
      examples={CODE_EXAMPLES}
      exampleLabels={t.packetdiag.examples}
      fileExt=".diag"
      downloadFilename="diagrama.diag"
      exportFilename="diagrama-packetdiag"
    />
  );
}
