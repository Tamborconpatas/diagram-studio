import CliBackedEditor from './CliBackedEditor';
import { useI18n } from '../i18n';

const CODE_EXAMPLES = {
  es: {
    simple: `blockdiag {
  Cliente -> Servidor -> Base_de_datos;
  Servidor -> Cache;
}
`,
    colors: `blockdiag {
  A [color = "#e0f2fe"];
  B [color = "#dcfce7"];
  C [color = "#fef3c7"];
  A -> B -> C;
}
`,
    groups: `blockdiag {
  group {
    label = "Frontend";
    App; UI;
  }
  group {
    label = "Backend";
    API; DB;
  }
  App -> API -> DB;
  UI -> API;
}
`,
    shapes: `blockdiag {
  Inicio [shape = beginpoint];
  Decision [shape = diamond];
  Proceso [shape = box];
  Fin [shape = endpoint];
  Inicio -> Decision -> Proceso -> Fin;
  Decision -> Fin [style = dashed, label = "atajo"];
}
`,
  },
  en: {
    simple: `blockdiag {
  Client -> Server -> Database;
  Server -> Cache;
}
`,
    colors: `blockdiag {
  A [color = "#e0f2fe"];
  B [color = "#dcfce7"];
  C [color = "#fef3c7"];
  A -> B -> C;
}
`,
    groups: `blockdiag {
  group {
    label = "Frontend";
    App; UI;
  }
  group {
    label = "Backend";
    API; DB;
  }
  App -> API -> DB;
  UI -> API;
}
`,
    shapes: `blockdiag {
  Start [shape = beginpoint];
  Decision [shape = diamond];
  Process [shape = box];
  End [shape = endpoint];
  Start -> Decision -> Process -> End;
  Decision -> End [style = dashed, label = "shortcut"];
}
`,
  },
};

export default function BlockdiagEditor() {
  const { t } = useI18n();
  return (
    <CliBackedEditor
      apiPath="blockdiag"
      examples={CODE_EXAMPLES}
      exampleLabels={t.blockdiag.examples}
      fileExt=".diag"
      downloadFilename="diagrama.diag"
      exportFilename="diagrama-blockdiag"
    />
  );
}
