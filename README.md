# Diagram Studio

Visor y editor local de diagramas, 33 formatos agrupados por herramienta o por tipo de diagrama (secuencia, procesos, redes, etc.) desde la home: BPMN, Mermaid, PlantUML (con preset C4), Graphviz, D2, Nomnoml, Pikchr, Markmap (software/UML); draw.io (editor visual completo, arrastrar y soltar) y Excalidraw (pizarra a mano alzada); Blockdiag y su familia (Seqdiag, Actdiag, Nwdiag, Packetdiag, Rackdiag) y WireViz (arneses de cable); TikZ y su familia (CircuiTikz, Feynman, Chemfig, Skak), MetaPost, WaveDrom, SMILES, ABC, Vega-Lite, DBML y SMC (modelos técnicos); Sankey, Ditaa y Svgbob (ASCII art); más generación de diagramas de arquitectura (AWS/GCP/Azure) desde Python (`diagrams`).

## Setup

### Linux

```bash
./install.sh
```

Deja instaladas las dependencias de Node, un entorno virtual de Python con `diagrams`, y un lanzador de escritorio (`~/Desktop/diagram-studio.desktop`).

Requiere `node`/`npm`, `python3` (crea el venv con `diagrams`, `blockdiag` y toda su familia — `seqdiag`/`actdiag`/`nwdiag`/`packetdiag`/`rackdiag` — y `wireviz`), el binario `graphviz` (`dot`, usado también por SMC y WireViz), una distribución LaTeX con `pgf/tikz` y `dvisvgm` (p.ej. TinyTeX; MetaPost y CircuiTikz/Feynman/Chemfig/Skak vienen incluidos en la misma distribución, sin nada extra), `java` (SMC y Ditaa usan `tools/Smc.jar`/`tools/ditaa.jar`, ya incluidos en el repo), `d2` y `cargo`/`svgbob_cli` (Rust, para Svgbob — `cargo install svgbob_cli`) instalados en el sistema.

### Windows

```powershell
.\install.ps1
```

Hace lo mismo que `install.sh`: `npm install`, crea `.venv-diagrams` con `diagrams`/`blockdiag` (y su familia), comprueba las dependencias del sistema, y deja un acceso directo **Diagram Studio.lnk** en el escritorio. Para cada dependencia que falte y tenga paquete de winget, el script **ofrece instalarla en el momento** (con confirmación) y sigue sin necesidad de reabrir la terminal — si preferís instalar antes a mano, o si no tenés winget, la tabla de abajo trae el comando de cada una.

Dependencias del sistema:

| Herramienta | Para qué | Cómo instalarla |
|---|---|---|
| Node.js | todo — es la app | `winget install OpenJS.NodeJS.LTS` |
| Python 3 | Blockdiag y su familia, WireViz, arquitectura AWS/GCP/Azure | `winget install Python.Python.3.12` |
| Graphviz (`dot`) | diagramas de arquitectura, SMC y WireViz | `winget install Graphviz.Graphviz` |
| MiKTeX (`latex`, `dvisvgm`) | TikZ y su familia (CircuiTikz, Feynman, Chemfig, Skak), MetaPost | `winget install MiKTeX.MiKTeX` (instala cada paquete `.sty` solo en el primer uso) |
| Java (JRE) | SMC y Ditaa (`tools/Smc.jar`, `tools/ditaa.jar`, incluidos) | `winget install EclipseAdoptium.Temurin.21.JRE` |
| D2 | diagramas D2 | `winget install Terrastruct.D2` (abrí una terminal nueva después para que tome el PATH) |
| Rust (`cargo`) | Svgbob (ASCII art) | `winget install Rustlang.Rustup` y luego `cargo install svgbob_cli` (abrí una terminal nueva después para que tome el PATH) |

Los editores puramente client-side (BPMN, Mermaid, PlantUML, Graphviz, draw.io, Excalidraw, Sankey, Nomnoml, Pikchr, Markmap, WaveDrom, SMILES, ABC, Vega-Lite, DBML) funcionan con solo `npm install`, sin nada de la tabla de arriba — draw.io además viene vendorizado en el repo (`public/drawio/`, ~150 MB), no depende de ningún servicio online.

## Uso

```bash
npm run dev
```

Abre `http://localhost:5173`. O doble clic en **Diagram Studio** en el escritorio (arranca el server si no está corriendo; en Windows usa `launch-diagrams.ps1`, en Linux `launch-diagrams.sh`).

Cada editor de código permite pegar/editar el código fuente, descargarlo en su formato nativo (.bpmn/.mmd/.puml/.dot/.d2/.excalidraw/.py/.tex/.ditaa/.dbml/.diag/.nomnoml/.sm) y exportar el diagrama renderizado en SVG/PNG/JPG a alta resolución. draw.io y Excalidraw son canvas de arrastrar-y-soltar en vez de editores de texto, con la misma exportación SVG/PNG/JPG.

`tools/Smc.jar` es [SMC (The State Machine Compiler)](https://smc.sourceforge.net/), incluido tal cual (dual-licencia MPL 1.1 / GPL 2.0, ver `tools/SMC-LICENSE.txt`) ya que no está disponible como paquete de sistema.

`tools/ditaa.jar` es [ditaa](https://github.com/stathissideris/ditaa) v0.11.0 (LGPL-3.0, ver `tools/DITAA-LICENSE.txt`), incluido tal cual porque no existe paquete de winget — el editor lo invoca directo con `java -jar`, sin depender de un comando `ditaa` en el PATH.

`public/drawio/` es el webapp estático de [draw.io](https://github.com/jgraph/drawio) (Apache 2.0, ver `public/drawio/LICENSE.txt`), vendorizado para que el editor funcione 100% local/offline en vez de depender de embed.diagrams.net.

`npm run check` corre un chequeo rápido (estático, sin servidor) de que cada formato tenga sus labels de i18n (ES/EN) y, si usa el adapter CLI-backed, su renderer registrado. `npm run check-examples` va más a fondo: con `npm run dev` corriendo en otra terminal, renderiza *todos* los ejemplos de *todos* los formatos CLI-backed contra el server real — así se detectan bugs de contenido (sintaxis LaTeX rota, API mal usada, etc.) que el chequeo estático no puede ver. Conviene correr ambos después de agregar o tocar un formato.
