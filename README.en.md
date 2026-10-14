# Diagram Studio

[Apache-2.0](LICENSE) · [Contributing](CONTRIBUTING.md) · [Español](README.md)

Local diagram viewer/editor, 35 formats grouped by tool or by diagram type (sequence, processes, networks, etc.) from the home screen: BPMN, Mermaid, PlantUML (with a C4 preset), Graphviz, D2, Nomnoml, Pikchr, Markmap (software/UML); draw.io (full visual drag-and-drop editor) and Excalidraw (freehand whiteboard); Blockdiag and its family (Seqdiag, Actdiag, Nwdiag, Packetdiag, Rackdiag) and WireViz (wiring/cable harnesses); TikZ and its family (CircuiTikz, Feynman, Chemfig, Skak), MetaPost, WaveDrom, SMILES, ABC, Vega-Lite, Gnuplot, LilyPond, DBML and SMC (technical models); Sankey, Ditaa and Svgbob (ASCII art); plus architecture diagram generation (AWS/GCP/Azure) from Python (`diagrams`).

## Install (desktop app)

Download the installer from [Releases](https://github.com/Tamborconpatas/diagram-studio/releases):

- **Windows:** `diagram-studio-<version>-Setup.exe` (one click, creates shortcuts).
- **Linux:** `diagram-studio-<version>.AppImage` (run directly), `.deb` (Debian/Ubuntu) or `.rpm` (Fedora/openSUSE).

The app ships everything the in-browser editors need (BPMN, Mermaid, Graphviz, Excalidraw, draw.io, Vega-Lite, etc.), plus Ditaa, SMC and DBML. Formats that rely on external tools (TikZ, D2, Gnuplot, LilyPond, WireViz, Blockdiag, Svgbob, `diagrams`) show a panel with an **Install** button the first time you open them: on Windows it uses winget (asks for administrator permission) and on Linux the package manager (`apt`, `dnf` or `pacman`, asking for your password via `pkexec`). D2 is downloaded with its SHA-256 verified and Svgbob is compiled with `cargo` (takes several minutes).

To build the installers yourself: `npm run dist:linux` or `npm run dist:win` (output in `release/`). Pushing a `v*` tag builds and publishes them (`.github/workflows/release.yml`).

## Setup

### Linux

```bash
./install.sh
```

Installs the Node dependencies, a Python virtual environment with `diagrams`, and a desktop launcher (`~/Desktop/diagram-studio.desktop`).

Requires `node`/`npm`, `python3` (creates the venv with `diagrams`, `blockdiag` and its whole family — `seqdiag`/`actdiag`/`nwdiag`/`packetdiag`/`rackdiag` — and `wireviz`), the `graphviz` binary (`dot`, also used by SMC and WireViz), a LaTeX distribution with `pgf/tikz` and `dvisvgm` (e.g. TinyTeX; MetaPost and CircuiTikz/Feynman/Chemfig/Skak come bundled with the same distribution, nothing extra needed), `java` (SMC and Ditaa use `tools/Smc.jar`/`tools/ditaa.jar`, already included in the repo), `d2`, `cargo`/`svgbob_cli` (Rust, for Svgbob — `cargo install svgbob_cli`), `gnuplot` and `lilypond` installed on the system.

### Windows

```powershell
.\install.ps1
```

Does the same as `install.sh`: `npm install`, creates `.venv-diagrams` with `diagrams`/`blockdiag` (and its family), checks the system dependencies, and leaves a **Diagram Studio.lnk** shortcut on the desktop. For every missing dependency that has a winget package, the script **offers to install it on the spot** (with confirmation) and continues without needing to reopen the terminal — if you'd rather install things by hand beforehand, or don't have winget, the table below has the command for each one.

System dependencies:

| Tool | For | How to install it |
|---|---|---|
| Node.js | everything — it's the app | `winget install OpenJS.NodeJS.LTS` |
| Python 3 | Blockdiag and its family, WireViz, AWS/GCP/Azure architecture | `winget install Python.Python.3.12` |
| Graphviz (`dot`) | architecture diagrams, SMC and WireViz | `winget install Graphviz.Graphviz` |
| MiKTeX (`latex`, `dvisvgm`) | TikZ and its family (CircuiTikz, Feynman, Chemfig, Skak), MetaPost | `winget install MiKTeX.MiKTeX` (installs each `.sty` package only on first use) |
| Java (JRE) | SMC and Ditaa (`tools/Smc.jar`, `tools/ditaa.jar`, included) | `winget install EclipseAdoptium.Temurin.21.JRE` |
| D2 | D2 diagrams | `winget install Terrastruct.D2` (open a new terminal afterward so it picks up the PATH) |
| Rust (`cargo`) | Svgbob (ASCII art) | `winget install Rustlang.Rustup` then `cargo install svgbob_cli` (open a new terminal afterward so it picks up the PATH) |
| Gnuplot | scientific plots | `winget install gnuplot.gnuplot` |
| LilyPond | music notation | `winget install LilyPond.LilyPond` (open a new terminal afterward so it picks up the PATH) |

The purely client-side editors (BPMN, Mermaid, PlantUML, Graphviz, draw.io, Excalidraw, Sankey, Nomnoml, Pikchr, Markmap, WaveDrom, SMILES, ABC, Vega-Lite, DBML) work with just `npm install`, nothing from the table above needed — draw.io additionally ships vendored in the repo (`public/drawio/`, ~150 MB), so it doesn't depend on any online service either.

## Usage

```bash
npm run dev
```

Opens `http://localhost:5173`. Or double-click **Diagram Studio** on the desktop (starts the server if it isn't running already; uses `launch-diagrams.ps1` on Windows, `launch-diagrams.sh` on Linux).

Every code editor lets you paste/edit the source, download it in its native format (.bpmn/.mmd/.puml/.dot/.d2/.excalidraw/.py/.tex/.ditaa/.dbml/.diag/.nomnoml/.sm) and export the rendered diagram as high-resolution SVG/PNG/JPG. draw.io and Excalidraw are drag-and-drop canvases instead of text editors, with the same SVG/PNG/JPG export.

`tools/Smc.jar` is [SMC (The State Machine Compiler)](https://smc.sourceforge.net/), included as-is (dual-licensed MPL 1.1 / GPL 2.0, see `tools/SMC-LICENSE.txt`) since it isn't available as a system package.

`tools/ditaa.jar` is [ditaa](https://github.com/stathissideris/ditaa) v0.11.0 (LGPL-3.0, see `tools/DITAA-LICENSE.txt`), included as-is because no winget package exists — the editor invokes it directly with `java -jar`, without depending on a `ditaa` command on the PATH.

`public/drawio/` is the static [draw.io](https://github.com/jgraph/drawio) webapp (Apache 2.0, see `public/drawio/LICENSE.txt`), vendored so the editor works 100% locally/offline instead of depending on embed.diagrams.net.

`npm run check` runs a quick check (static, no server needed) that every format has its i18n labels (ES/EN) and, if it's a CLI-backed adapter, a registered renderer. `npm run check-examples` goes further: with `npm run dev` running in another terminal, it renders *every* example of *every* CLI-backed format against the real server — catching content bugs (broken LaTeX syntax, a misused API, etc.) that the static check can't see. Worth running both after adding or touching a format.

## Licenses

Diagram Studio's own code is [Apache-2.0](LICENSE). The third-party tools it uses fall into two groups: The copyright notices of the npm dependencies are in [THIRD-PARTY-NOTICES.txt](THIRD-PARTY-NOTICES.txt) (regenerate with `npm run licenses`).

**Frontend libraries** (`npm install`, bundled into the app):

| Library | License |
|---|---|
| React, React DOM, @vitejs/plugin-react, Vite | MIT |
| Tailwind CSS, @tailwindcss/vite | MIT |
| TypeScript | Apache-2.0 |
| Mermaid, @mermaid-js/mermaid-zenuml | MIT |
| Excalidraw, @excalidraw/mermaid-to-excalidraw | MIT |
| bpmn-js, bpmn-auto-layout | MIT |
| @hpcc-js/wasm-graphviz | Apache-2.0 |
| @softwaretechnik/dbml-renderer | ISC |
| abcjs, markmap-lib, markmap-view, nomnoml, pikchr-wasm, plantuml-encoder, smiles-drawer, wavedrom, json5 | MIT |
| d3-sankey | BSD-3-Clause |
| lucide-react | ISC |
| vega, vega-embed, vega-lite | BSD-3-Clause |

**System tools** (installed separately by `install.ps1`/`install.sh`, invoked as an external process via `child_process` — not compiled or linked into the app's code, so their licenses don't propagate to Diagram Studio):

| Tool | License |
|---|---|
| Python `diagrams` | MIT |
| Blockdiag and its family (Seqdiag, Actdiag, Nwdiag, Packetdiag, Rackdiag) | Apache-2.0 |
| WireViz | GPL-3.0 |
| Graphviz (`dot`) | EPL-1.0 |
| MiKTeX | MIT (every LaTeX/CTAN package it installs carries its own license, mostly LPPL) |
| Java (Eclipse Temurin) | GPL-2.0 with Classpath Exception |
| D2 | MPL-2.0 |
| Rust / Cargo, svgbob_cli | MIT/Apache-2.0 dual, Apache-2.0 |
| Gnuplot | gnuplot license (permissive) |
| LilyPond | GPL-3.0 |

**Vendored directly in the repo** (binary/webapp included as-is, with its own license file next to it):

| File | Source | License |
|---|---|---|
| `tools/Smc.jar` | [SMC](https://smc.sourceforge.net/) | MPL-1.1 / GPL-2.0 (dual), see `tools/SMC-LICENSE.txt` |
| `tools/ditaa.jar` | [ditaa](https://github.com/stathissideris/ditaa) v0.11.0 | LGPL-3.0, see `tools/DITAA-LICENSE.txt` |
| `public/drawio/` | [draw.io](https://github.com/jgraph/drawio) | Apache-2.0, see `public/drawio/LICENSE.txt` |
