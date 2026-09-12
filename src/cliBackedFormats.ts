import { Boxes, MessagesSquare, Route, Network, Package, Server, Shapes, Database, Terminal, ArrowRightLeft, Sigma, CircuitBoard, Atom, FlaskConical, Crown, Compass, Cable, Grid3x3, LineChart, Music4, type LucideIcon } from 'lucide-react';
import type { Language, Translations } from './i18n/types';

// Single source of truth for every CLI-backed diagram format (one that
// renders via a POST to /api/render-<id>, see vite-plugin-diagrams-api.ts).
// Adding a new single/multi-step CLI format is: one RENDERERS entry there,
// plus one entry here — no new editor file, no DiagramApp.tsx wiring, no
// i18n interface change (labels live under Translations.cliFormats[id]).
export interface CliBackedFormat {
  id: string;
  icon: LucideIcon;
  category: string;
  useCases: string[];
  fileExt: string;
  downloadFilename: string;
  examples: Record<Language, Record<string, string>>;
  loadingLabel?: (t: Translations) => string;
}

const BLOCKDIAG_ES = {
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
};
const BLOCKDIAG_EN = {
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
};

const SEQDIAG = {
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

const ACTDIAG = {
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

const NWDIAG = {
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

const PACKETDIAG = {
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

const RACKDIAG = {
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

const D2 = {
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

const DBML = {
  twoTables: `Table users {
  id int [pk]
  name varchar
  email varchar
}

Table posts {
  id int [pk]
  user_id int
  title varchar
}

Ref: posts.user_id > users.id
`,
  manyToMany: `Table students {
  id int [pk]
  name varchar
}

Table courses {
  id int [pk]
  title varchar
}

Table enrollments {
  student_id int
  course_id int
  enrolled_at date
}

Ref: enrollments.student_id > students.id
Ref: enrollments.course_id > courses.id
`,
  enumIndexes: `Enum estado_pedido {
  pendiente
  pagado
  enviado
  cancelado
}

Table pedidos {
  id int [pk]
  cliente_id int [not null]
  estado estado_pedido [default: 'pendiente']
  creado_en timestamp

  indexes {
    (cliente_id, creado_en) [name: "idx_cliente_fecha"]
  }
}

Table clientes {
  id int [pk]
  email varchar [unique]
}

Ref: pedidos.cliente_id > clientes.id
`,
};

const DITAA_ES = {
  simple: `+--------+   +----------+   +-------+
| Cliente|-->| Servidor |-->|  DB   |
+--------+   +----------+   +-------+
`,
  decision: `+---------+
| Entrada |
+---------+
     |
     v
 /--------\\
< ¿Válido? >
 \\--------/
   |     |
  Sí     No
   |     |
   v     v
+-----+ +-------+
| OK  | | Error |
+-----+ +-------+
`,
  colors: `+------------+
| cREDCache  |
+------------+
     |
     v
+------------+
| cGREOrigen |
+------------+
     |
     v
+------------+
|  cBLULog   |
+------------+
`,
  rounded: `/---------\\
| Sistema |
\\---------/
     |
     v
/-----------\\
| Respuesta |
\\-----------/
`,
};
const DITAA_EN = {
  simple: `+--------+   +----------+   +-------+
| Client |-->|  Server  |-->|  DB   |
+--------+   +----------+   +-------+
`,
  decision: `+---------+
|  Input  |
+---------+
     |
     v
 /--------\\
<  Valid?  >
 \\--------/
   |     |
  Yes    No
   |     |
   v     v
+-----+ +-------+
| OK  | | Error |
+-----+ +-------+
`,
  colors: `+------------+
| cREDCache  |
+------------+
     |
     v
+------------+
| cGREOrigen |
+------------+
     |
     v
+------------+
|  cBLULog   |
+------------+
`,
  rounded: `/---------\\
| System  |
\\---------/
     |
     v
/-----------\\
| Response  |
\\-----------/
`,
};

const SMC_TURNSTILE = `%class Turnstile
%start MainMap::Locked
%map MainMap
%%
Locked
{
  coin Unlocked { unlock(); }
  pass nil { alarm(); }
}
Unlocked
{
  pass Locked { lock(); }
  coin nil { thankyou(); }
}
%%
`;
const SMC_ES = {
  turnstile: SMC_TURNSTILE,
  trafficLight: `%class Semaforo
%start MainMap::Rojo
%map MainMap
%%
Rojo
{
  siguiente Verde { encenderVerde(); }
}
Verde
{
  siguiente Amarillo { encenderAmarillo(); }
}
Amarillo
{
  siguiente Rojo { encenderRojo(); }
}
%%
`,
  guards: `%class Cajero
%start MainMap::Esperando
%map MainMap
%%
Esperando
{
  ingresarPin [saldoDisponible()] Validado { mostrarMenu(); }
  ingresarPin [!saldoDisponible()] Bloqueado { alertar(); }
}
Validado
{
  retirar Esperando { entregarEfectivo(); }
}
Bloqueado
{
}
%%
`,
};
const SMC_EN = {
  turnstile: SMC_TURNSTILE,
  trafficLight: `%class TrafficLight
%start MainMap::Red
%map MainMap
%%
Red
{
  next Green { turnGreen(); }
}
Green
{
  next Yellow { turnYellow(); }
}
Yellow
{
  next Red { turnRed(); }
}
%%
`,
  guards: `%class ATM
%start MainMap::Waiting
%map MainMap
%%
Waiting
{
  enterPin [hasBalance()] Validated { showMenu(); }
  enterPin [!hasBalance()] Blocked { alert(); }
}
Validated
{
  withdraw Waiting { dispenseCash(); }
}
Blocked
{
}
%%
`,
};

const TIKZ_NODES_ARROW = `\\begin{tikzpicture}
  \\node[draw, circle] (a) {A};
  \\node[draw, circle, right=2cm of a] (b) {B};
  \\draw[-{Latex}] (a) -- (b);
\\end{tikzpicture}
`;
const TIKZ_ES = {
  nodesArrow: TIKZ_NODES_ARROW,
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
  \\node at (0.75,0) {$A \cap B$};
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
};
const TIKZ_EN = {
  nodesArrow: TIKZ_NODES_ARROW,
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
  \\node at (0.75,0) {$A \cap B$};
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
};

const CIRCUITIKZ = {
  rc: `\\begin{circuitikz}
\\draw (0,0) to[R, l=$R_1$] (2,0) to[C, l=$C_1$] (2,-2) to[short] (0,-2) to[short] (0,0);
\\end{circuitikz}
`,
  voltageDivider: `\\begin{circuitikz}
\\draw (0,4) to[battery1, l=$V_{in}$] (0,0)
      (0,4) to[R, l=$R_1$] (3,4)
      (3,4) to[R, l=$R_2$] (3,0) -- (0,0)
      (3,4) to[short, -o] (5,4) node[right] {$V_{out}$};
\\end{circuitikz}
`,
};

const FEYNMAN = {
  annihilation: `\\begin{tikzpicture}
\\begin{feynman}
\\vertex (a);
\\vertex [right=of a] (b);
\\diagram* {(a) -- [fermion] (b)};
\\end{feynman}
\\end{tikzpicture}
`,
  compton: `\\begin{tikzpicture}
\\begin{feynman}
\\vertex (i1) {\\(e^-\\)};
\\vertex [right=1.5cm of i1] (v1);
\\vertex [right=1.5cm of v1] (v2);
\\vertex [right=1.5cm of v2] (o1) {\\(e^-\\)};
\\vertex [above=1.5cm of i1] (i2) {\\(\\gamma\\)};
\\vertex [above=1.5cm of o1] (o2) {\\(\\gamma\\)};
\\diagram* {
  (i1) -- [fermion] (v1) -- [fermion] (v2) -- [fermion] (o1),
  (i2) -- [photon] (v1),
  (v2) -- [photon] (o2),
};
\\end{feynman}
\\end{tikzpicture}
`,
};

const CHEMFIG = {
  ethanol: `\\chemfig{H_3C-CH_2-OH}
`,
  benzene: `\\chemfig{*6(-=-=-=)}
`,
};

const SKAK = {
  empty: `\\showboard
`,
  opening: `\\newgame
\\mainline{1. e4 e5 2. Nf3 Nc6 3. Bb5}
\\showboard
`,
};

const METAPOST = {
  square: `beginfig(1);
draw (0,0)--(100,0)--(100,100)--(0,100)--cycle;
draw (0,0)--(100,100) withcolor red;
label("A", (0,0));
label("B", (100,100));
endfig;
end
`,
  curve: `beginfig(1);
draw (0,0)..(50,80)..(100,20)..(150,90) withcolor blue;
drawarrow (0,50)--(150,50) withcolor red;
label.top("curva suave", (75,90));
endfig;
end
`,
};

const WIREVIZ = {
  simple: `connectors:
  X1:
    type: Molex KK 254
    subtype: male
    pinlabels: [GND, VCC, DATA]
  X2:
    type: Molex KK 254
    subtype: female
    pinlabels: [GND, VCC, DATA]

cables:
  W1:
    gauge: 0.5 mm2
    length: 0.3
    wirecount: 3
    colors: [BK, RD, YE]

connections:
  -
    - X1: [1-3]
    - W1: [1-3]
    - X2: [1-3]
`,
  shielded: `connectors:
  X1:
    type: D-Sub
    subtype: female
    pinlabels: [DCD, RX, TX, DTR, GND, DSR, RTS, CTS, RI]
  X2:
    type: Molex KK 254
    subtype: female
    pinlabels: [GND, RX, TX]

cables:
  W1:
    gauge: 0.25 mm2
    length: 0.2
    color_code: DIN
    wirecount: 3
    shield: true

connections:
  -
    - X1: [5,2,3]
    - W1: [1,2,3]
    - X2: [1,3,2]
  -
    - X1: 5
    - W1: s
`,
};

// svgbob draws shapes purely from line geometry (box corners, / \ diagonals),
// it has no notion of a "diamond" or "circle" primitive the way ditaa/pikchr
// do — `<`/`>` only render as arrowheads, never as a decision-shape outline.
// Stick to boxes + straight/diagonal lines in examples.
const SVGBOB_NETWORK = `        +--------+
        | Router |
        +---+----+
            |
    +-------+-------+
    |               |
+---+---+       +---+---+
| Host A|       | Host B|
+-------+       +-------+
`;
const SVGBOB_BRANCH = `   +---------+
   |  Input  |
   +----+----+
        |
    .---+---.
    |       |
    v       v
+-------+ +-------+
| Left  | | Right |
+---+---+ +---+---+
    |         |
    '----+----'
         v
    +--------+
    | Output |
    +--------+
`;
const SVGBOB_ES = {
  flujo: `+-------+     +--------+     +-------------+
|Cliente|---->|Servidor|---->|Base de datos|
+-------+     +--------+     +-------------+
`,
  ramificacion: SVGBOB_BRANCH,
  red: SVGBOB_NETWORK,
};
const SVGBOB_EN = {
  flujo: `+------+     +------+     +--------+
|Client|---->|Server|---->|Database|
+------+     +------+     +--------+
`,
  ramificacion: SVGBOB_BRANCH,
  red: SVGBOB_NETWORK,
};

// The app auto-prepends `set terminal svg` / `set output` (see renderGnuplot
// in vite-plugin-diagrams-api.ts) — examples are just plot commands.
const GNUPLOT_ES = {
  funciones: `set title "Funciones trigonométricas"
set xlabel "x"
set ylabel "y"
set grid
plot sin(x) title "sin(x)", cos(x) title "cos(x)"
`,
  barras: `set title "Ventas por trimestre"
set style data histograms
set style fill solid
set boxwidth 0.6
set yrange [0:*]
set xtics ("Q1" 0, "Q2" 1, "Q3" 2, "Q4" 3)
plot '-' using 1 notitle
120
150
90
200
e
`,
  dispersion: `set title "Dispersión"
set xlabel "x"
set ylabel "y"
plot '-' using 1:2 with points pointtype 7 title "datos"
1 2
2 4
3 5
4 4
5 6
6 7
e
`,
};
const GNUPLOT_EN = {
  funciones: `set title "Trigonometric functions"
set xlabel "x"
set ylabel "y"
set grid
plot sin(x) title "sin(x)", cos(x) title "cos(x)"
`,
  barras: `set title "Sales by quarter"
set style data histograms
set style fill solid
set boxwidth 0.6
set yrange [0:*]
set xtics ("Q1" 0, "Q2" 1, "Q3" 2, "Q4" 3)
plot '-' using 1 notitle
120
150
90
200
e
`,
  dispersion: `set title "Scatter"
set xlabel "x"
set ylabel "y"
plot '-' using 1:2 with points pointtype 7 title "data"
1 2
2 4
3 5
4 4
5 6
6 7
e
`,
};

// The app auto-prepends `\version` (see renderLilypond) — examples are pure
// music syntax, no boilerplate. Same content for es/en, no text labels.
const LILYPOND = {
  escala: `{
  c' d' e' f' g' a' b' c''
}
`,
  acordes: `{
  <c' e' g'>4 <f' a' c''>4 <g' b' d''>4 <c' e' g'>2
}
`,
  dinamica: `{
  c'4\\p d'4\\< e'4 f'4\\f g'2\\> a'4 g'4\\!
}
`,
};

export const CLI_BACKED_FORMATS: CliBackedFormat[] = [
  {
    id: 'blockdiag',
    icon: Boxes,
    category: 'infra',
    useCases: ['architecture', 'network'],
    fileExt: '.diag',
    downloadFilename: 'diagrama.diag',
    examples: { es: BLOCKDIAG_ES, en: BLOCKDIAG_EN },
  },
  {
    id: 'seqdiag',
    icon: MessagesSquare,
    category: 'process',
    useCases: ['sequence'],
    fileExt: '.diag',
    downloadFilename: 'diagrama.diag',
    examples: { es: SEQDIAG, en: SEQDIAG },
  },
  {
    id: 'actdiag',
    icon: Route,
    category: 'process',
    useCases: ['process'],
    fileExt: '.diag',
    downloadFilename: 'diagrama.diag',
    examples: { es: ACTDIAG, en: ACTDIAG },
  },
  {
    id: 'nwdiag',
    icon: Network,
    category: 'infra',
    useCases: ['network'],
    fileExt: '.diag',
    downloadFilename: 'diagrama.diag',
    examples: { es: NWDIAG, en: NWDIAG },
  },
  {
    id: 'packetdiag',
    icon: Package,
    category: 'infra',
    useCases: ['network'],
    fileExt: '.diag',
    downloadFilename: 'diagrama.diag',
    examples: { es: PACKETDIAG, en: PACKETDIAG },
  },
  {
    id: 'rackdiag',
    icon: Server,
    category: 'infra',
    useCases: ['network'],
    fileExt: '.diag',
    downloadFilename: 'diagrama.diag',
    examples: { es: RACKDIAG, en: RACKDIAG },
  },
  {
    id: 'd2',
    icon: Shapes,
    category: 'software',
    useCases: ['architecture', 'flow'],
    fileExt: '.d2',
    downloadFilename: 'diagrama.d2',
    examples: { es: D2, en: D2 },
  },
  {
    id: 'dbml',
    icon: Database,
    category: 'technical',
    useCases: ['database'],
    fileExt: '.dbml',
    downloadFilename: 'esquema.dbml',
    examples: { es: DBML, en: DBML },
  },
  {
    id: 'ditaa',
    icon: Terminal,
    category: 'drawing',
    useCases: ['freeform'],
    fileExt: '.ditaa',
    downloadFilename: 'diagrama.ditaa',
    examples: { es: DITAA_ES, en: DITAA_EN },
  },
  {
    id: 'smc',
    icon: ArrowRightLeft,
    category: 'technical',
    useCases: ['state'],
    fileExt: '.sm',
    downloadFilename: 'maquina.sm',
    examples: { es: SMC_ES, en: SMC_EN },
  },
  {
    id: 'tikz',
    icon: Sigma,
    category: 'technical',
    useCases: ['scientific'],
    fileExt: '.tex',
    downloadFilename: 'diagrama.tex',
    examples: { es: TIKZ_ES, en: TIKZ_EN },
    loadingLabel: (t) => t.compilingBtn,
  },
  {
    id: 'circuitikz',
    icon: CircuitBoard,
    category: 'technical',
    useCases: ['scientific'],
    fileExt: '.tex',
    downloadFilename: 'circuito.tex',
    examples: { es: CIRCUITIKZ, en: CIRCUITIKZ },
    loadingLabel: (t) => t.compilingBtn,
  },
  {
    id: 'feynman',
    icon: Atom,
    category: 'technical',
    useCases: ['scientific'],
    fileExt: '.tex',
    downloadFilename: 'diagrama.tex',
    examples: { es: FEYNMAN, en: FEYNMAN },
    loadingLabel: (t) => t.compilingBtn,
  },
  {
    id: 'chemfig',
    icon: FlaskConical,
    category: 'technical',
    useCases: ['scientific'],
    fileExt: '.tex',
    downloadFilename: 'molecula.tex',
    examples: { es: CHEMFIG, en: CHEMFIG },
    loadingLabel: (t) => t.compilingBtn,
  },
  {
    id: 'skak',
    icon: Crown,
    category: 'technical',
    useCases: ['scientific'],
    fileExt: '.tex',
    downloadFilename: 'ajedrez.tex',
    examples: { es: SKAK, en: SKAK },
    loadingLabel: (t) => t.compilingBtn,
  },
  {
    id: 'metapost',
    icon: Compass,
    category: 'technical',
    useCases: ['scientific'],
    fileExt: '.mp',
    downloadFilename: 'diagrama.mp',
    examples: { es: METAPOST, en: METAPOST },
  },
  {
    id: 'wireviz',
    icon: Cable,
    category: 'infra',
    useCases: ['network'],
    fileExt: '.yml',
    downloadFilename: 'arnes.yml',
    examples: { es: WIREVIZ, en: WIREVIZ },
  },
  {
    id: 'svgbob',
    icon: Grid3x3,
    category: 'drawing',
    useCases: ['freeform'],
    fileExt: '.bob',
    downloadFilename: 'diagrama.bob',
    examples: { es: SVGBOB_ES, en: SVGBOB_EN },
  },
  {
    id: 'gnuplot',
    icon: LineChart,
    category: 'technical',
    useCases: ['scientific'],
    fileExt: '.gp',
    downloadFilename: 'grafico.gp',
    examples: { es: GNUPLOT_ES, en: GNUPLOT_EN },
  },
  {
    id: 'lilypond',
    icon: Music4,
    category: 'technical',
    useCases: ['scientific'],
    fileExt: '.ly',
    downloadFilename: 'partitura.ly',
    examples: { es: LILYPOND, en: LILYPOND },
  },
];
