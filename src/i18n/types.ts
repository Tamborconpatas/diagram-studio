export type Language = 'es' | 'en';

export interface ToolTranslation {
  label: string;
  description: string;
}

export interface Translations {
  homeSubtitle: string;
  examplesTitle: string;
  actionsTitle: string;
  codeTitle: string;
  renderBtn: string;
  renderingBtn: string;
  toolInstaller: {
    missingTitle: string;
    missingHint: (names: string) => string;
    installBtn: string;
    installingTitle: string;
    installingHint: string;
    failedTitle: string;
    retryBtn: string;
  };
  compilingBtn: string;
  openFileBtn: (ext: string) => string;
  downloadFileBtn: (ext: string) => string;
  tools: Record<string, ToolTranslation>;
  categories: Record<string, string>;
  useCases: Record<string, string>;
  homeViewToggle: { byTool: string; byUseCase: string };
  sidebar: {
    searchPlaceholder: string;
    noResults: string;
    collapse: string;
    expand: string;
    home: string;
  };
  commandPalette: {
    hint: string;
  };
  bpmn: {
    loadToDiagram: string;
    diagramToXml: string;
    presets: Record<string, string>;
    examples: Record<string, string>;
  };
  mermaid: {
    editVisually: string;
    converting: string;
    flatWarning: string;
  };
  graphviz: {
    presets: Record<string, string>;
    examples: Record<string, string>;
  };
  plantuml: {
    noTheme: string;
    renderError: string;
    fetchError: (status: number | string) => string;
    altText: string;
    examples: Record<string, string>;
  };
  // Labels for every CLI_BACKED_FORMATS entry (src/cliBackedFormats.ts),
  // keyed by format id — one blob instead of one Translations field per
  // format, so a new CLI-backed format needs no types.ts edit.
  cliFormats: Record<string, { examples: Record<string, string> }>;
  nomnoml: {
    examples: Record<string, string>;
  };
  wavedrom: {
    examples: Record<string, string>;
  };
  markmap: {
    examples: Record<string, string>;
  };
  smiles: {
    examples: Record<string, string>;
  };
  pikchr: {
    examples: Record<string, string>;
  };
  abc: {
    examples: Record<string, string>;
  };
  vegalite: {
    examples: Record<string, string>;
  };
  pythonDiagrams: {
    examples: Record<string, string>;
  };
  sankey: {
    invalidLine: (line: string) => string;
    noFlows: string;
    examples: Record<string, string>;
  };
}

