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
  compilingBtn: string;
  openFileBtn: (ext: string) => string;
  downloadFileBtn: (ext: string) => string;
  tools: Record<string, ToolTranslation>;
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
  blockdiag: {
    examples: Record<string, string>;
  };
  dbml: {
    examples: Record<string, string>;
  };
  ditaa: {
    examples: Record<string, string>;
  };
  nomnoml: {
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
  smc: {
    examples: Record<string, string>;
  };
  tikz: {
    examples: Record<string, string>;
  };
}

