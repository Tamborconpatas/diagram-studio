import CliBackedEditor from './CliBackedEditor';
import { useI18n } from '../i18n';

const NODES_ARROW = `\\begin{tikzpicture}
  \\node[draw, circle] (a) {A};
  \\node[draw, circle, right=2cm of a] (b) {B};
  \\draw[-{Latex}] (a) -- (b);
\\end{tikzpicture}
`;

const CODE_EXAMPLES = {
  es: {
    nodesArrow: NODES_ARROW,
    math: `\\begin{tikzpicture}
  \\draw[->] (-0.2,0) -- (3.2,0) node[right] {$x$};
  \\draw[->] (0,-0.2) -- (0,3.2) node[above] {$y$};
  \\draw[domain=0:3, smooth, variable=\\x, blue] plot ({\\x}, {\\x*\\x/3});
\\end{tikzpicture}
`,
    tree: `\\begin{tikzpicture}[level distance=1.5cm, sibling distance=2.2cm]
  \\node {Raíz}
    child { node {Hijo A}
      child { node {A1} }
      child { node {A2} } }
    child { node {Hijo B} };
\\end{tikzpicture}
`,
    venn: `\\begin{tikzpicture}
  \\draw[fill=blue, opacity=0.4] (0,0) circle (1.5cm);
  \\draw[fill=red, opacity=0.4] (1.5,0) circle (1.5cm);
  \\node at (-0.6,0) {A};
  \\node at (2.1,0) {B};
  \\node at (0.75,0) {A∩B};
\\end{tikzpicture}
`,
    bars: `\\begin{tikzpicture}
  \\draw[->] (0,0) -- (5,0);
  \\draw[->] (0,0) -- (0,4);
  \\draw[fill=blue!60] (0.5,0) rectangle (1.2,1.5);
  \\draw[fill=blue!60] (1.7,0) rectangle (2.4,3);
  \\draw[fill=blue!60] (2.9,0) rectangle (3.6,2.2);
  \\node at (0.85,-0.3) {Ene};
  \\node at (2.05,-0.3) {Feb};
  \\node at (3.25,-0.3) {Mar};
\\end{tikzpicture}
`,
    pattern: `\\begin{tikzpicture}
  \\draw[pattern=north east lines] (0,0) rectangle (2,2);
  \\draw[pattern=dots] (2.5,0) rectangle (4.5,2);
\\end{tikzpicture}
`,
  },
  en: {
    nodesArrow: NODES_ARROW,
    math: `\\begin{tikzpicture}
  \\draw[->] (-0.2,0) -- (3.2,0) node[right] {$x$};
  \\draw[->] (0,-0.2) -- (0,3.2) node[above] {$y$};
  \\draw[domain=0:3, smooth, variable=\\x, blue] plot ({\\x}, {\\x*\\x/3});
\\end{tikzpicture}
`,
    tree: `\\begin{tikzpicture}[level distance=1.5cm, sibling distance=2.2cm]
  \\node {Root}
    child { node {Child A}
      child { node {A1} }
      child { node {A2} } }
    child { node {Child B} };
\\end{tikzpicture}
`,
    venn: `\\begin{tikzpicture}
  \\draw[fill=blue, opacity=0.4] (0,0) circle (1.5cm);
  \\draw[fill=red, opacity=0.4] (1.5,0) circle (1.5cm);
  \\node at (-0.6,0) {A};
  \\node at (2.1,0) {B};
  \\node at (0.75,0) {A∩B};
\\end{tikzpicture}
`,
    bars: `\\begin{tikzpicture}
  \\draw[->] (0,0) -- (5,0);
  \\draw[->] (0,0) -- (0,4);
  \\draw[fill=blue!60] (0.5,0) rectangle (1.2,1.5);
  \\draw[fill=blue!60] (1.7,0) rectangle (2.4,3);
  \\draw[fill=blue!60] (2.9,0) rectangle (3.6,2.2);
  \\node at (0.85,-0.3) {Jan};
  \\node at (2.05,-0.3) {Feb};
  \\node at (3.25,-0.3) {Mar};
\\end{tikzpicture}
`,
    pattern: `\\begin{tikzpicture}
  \\draw[pattern=north east lines] (0,0) rectangle (2,2);
  \\draw[pattern=dots] (2.5,0) rectangle (4.5,2);
\\end{tikzpicture}
`,
  },
};

export default function TikzEditor() {
  const { t } = useI18n();
  return (
    <CliBackedEditor
      apiPath="tikz"
      examples={CODE_EXAMPLES}
      exampleLabels={t.tikz.examples}
      fileExt=".tex"
      downloadFilename="diagrama.tex"
      exportFilename="diagrama-tikz"
      loadingLabel={(t) => t.compilingBtn}
    />
  );
}
