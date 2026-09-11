# Diagram Studio

Visor y editor local de diagramas, 20 formatos agrupados por herramienta o por tipo de diagrama (secuencia, procesos, redes, etc.) desde la home: BPMN, Mermaid, PlantUML (con preset C4), Graphviz, D2, Nomnoml (software/UML); draw.io (editor visual completo, arrastrar y soltar) y Excalidraw (pizarra a mano alzada); Blockdiag y su familia (Seqdiag, Actdiag, Nwdiag, Packetdiag, Rackdiag); TikZ, DBML y SMC (modelos técnicos); Sankey y Ditaa (ASCII art); más generación de diagramas de arquitectura (AWS/GCP/Azure) desde Python (`diagrams`).

## Setup

### Linux

```bash
./install.sh
```

Deja instaladas las dependencias de Node, un entorno virtual de Python con `diagrams`, y un lanzador de escritorio (`~/Desktop/diagram-studio.desktop`).

Requiere `python3` (crea el venv con `diagrams`, `blockdiag` y toda su familia — `seqdiag`/`actdiag`/`nwdiag`/`packetdiag`/`rackdiag`), el binario `graphviz` (`dot`), una distribución LaTeX con `pgf/tikz` y `dvisvgm` (p.ej. TinyTeX), `ditaa`, `java` (SMC usa `tools/Smc.jar`, ya incluido en el repo) y `d2` instalados en el sistema.

### Windows

```powershell
.\install.ps1
```

Hace lo mismo que `install.sh`: `npm install`, crea `.venv-diagrams` con `diagrams`/`blockdiag` (y su familia), comprueba las dependencias del sistema, y deja un acceso directo **Diagram Studio.lnk** en el escritorio.

Dependencias del sistema (instala lo que falte antes de correr el script, o vuelve a correrlo después):

| Herramienta | Para qué | Cómo instalarla |
|---|---|---|
| Python 3 | Blockdiag y su familia, arquitectura AWS/GCP/Azure | `winget install Python.Python.3.12` |
| Graphviz (`dot`) | diagramas de arquitectura y SMC | `winget install Graphviz.Graphviz` |
| MiKTeX (`latex`, `dvisvgm`) | TikZ | `winget install MiKTeX.MiKTeX` (instala `pgf`/tikz.sty solo en el primer uso) |
| Ditaa | ASCII art | no está en winget: baja el jar de [releases](https://github.com/stathissideris/ditaa/releases) y crea un `ditaa.bat` en el PATH con `@java -jar C:\ruta\a\ditaa.jar %*` |
| Java (JRE) | SMC (`tools/Smc.jar`, incluido) | `winget install EclipseAdoptium.Temurin.21.JRE` |
| D2 | diagramas D2 | `winget install Terrastruct.D2` (abrí una terminal nueva después para que tome el PATH) |

Los editores puramente client-side (BPMN, Mermaid, PlantUML, Graphviz, draw.io, Excalidraw, Sankey, Nomnoml, DBML) funcionan con solo `npm install`, sin nada de la tabla de arriba — draw.io además viene vendorizado en el repo (`public/drawio/`, ~150 MB), no depende de ningún servicio online.

## Uso

```bash
npm run dev
```

Abre `http://localhost:5173`. O doble clic en **Diagram Studio** en el escritorio (arranca el server si no está corriendo; en Windows usa `launch-diagrams.ps1`, en Linux `launch-diagrams.sh`).

Cada editor de código permite pegar/editar el código fuente, descargarlo en su formato nativo (.bpmn/.mmd/.puml/.dot/.d2/.excalidraw/.py/.tex/.ditaa/.dbml/.diag/.nomnoml/.sm) y exportar el diagrama renderizado en SVG/PNG/JPG a alta resolución. draw.io y Excalidraw son canvas de arrastrar-y-soltar en vez de editores de texto, con la misma exportación SVG/PNG/JPG.

`tools/Smc.jar` es [SMC (The State Machine Compiler)](https://smc.sourceforge.net/), incluido tal cual (dual-licencia MPL 1.1 / GPL 2.0, ver `tools/SMC-LICENSE.txt`) ya que no está disponible como paquete de sistema.

`public/drawio/` es el webapp estático de [draw.io](https://github.com/jgraph/drawio) (Apache 2.0, ver `public/drawio/LICENSE.txt`), vendorizado para que el editor funcione 100% local/offline en vez de depender de embed.diagrams.net.

`npm run check` corre un chequeo rápido de que cada formato tenga sus labels de i18n (ES/EN) y, si usa el adapter CLI-backed, su renderer registrado — conviene correrlo después de agregar un formato nuevo.
