# Diagram Studio

Visor y editor local de diagramas: BPMN, Mermaid, PlantUML (con preset C4), Graphviz, Excalidraw, TikZ, Ditaa (ASCII art), DBML (esquemas de base de datos), Blockdiag (bloques/redes), Sankey (flujos proporcionales), Nomnoml (UML simple) y SMC (máquinas de estado), más generación de diagramas de arquitectura (AWS/GCP/Azure) desde Python (`diagrams`).

## Setup

### Linux

```bash
./install.sh
```

Deja instaladas las dependencias de Node, un entorno virtual de Python con `diagrams`, y un lanzador de escritorio (`~/Desktop/diagram-studio.desktop`).

Requiere `python3`, el binario `graphviz` (`dot`), una distribución LaTeX con `pgf/tikz` y `dvisvgm` (p.ej. TinyTeX), `ditaa` y `java` (SMC usa `tools/Smc.jar`, ya incluido en el repo) instalados en el sistema.

### Windows

```powershell
.\install.ps1
```

Hace lo mismo que `install.sh`: `npm install`, crea `.venv-diagrams` con `diagrams`/`blockdiag`, comprueba las dependencias del sistema, y deja un acceso directo **Diagram Studio.lnk** en el escritorio.

Dependencias del sistema (instala lo que falte antes de correr el script, o vuelve a correrlo después):

| Herramienta | Para qué | Cómo instalarla |
|---|---|---|
| Python 3 | diagramas de arquitectura AWS/GCP/Azure | `winget install Python.Python.3.12` |
| Graphviz (`dot`) | diagramas de arquitectura y SMC | `winget install Graphviz.Graphviz` |
| MiKTeX (`latex`, `dvisvgm`) | TikZ | `winget install MiKTeX.MiKTeX` (instala `pgf`/tikz.sty solo en el primer uso) |
| Ditaa | ASCII art | no está en winget: baja el jar de [releases](https://github.com/stathissideris/ditaa/releases) y crea un `ditaa.bat` en el PATH con `@java -jar C:\ruta\a\ditaa.jar %*` |
| Java (JRE) | SMC (`tools/Smc.jar`, incluido) | `winget install EclipseAdoptium.Temurin.21.JRE` |

Los editores puramente client-side (BPMN, Mermaid, PlantUML, Excalidraw, Sankey, Nomnoml, DBML) funcionan con solo `npm install`, sin nada de la tabla de arriba.

## Uso

```bash
npm run dev
```

Abre `http://localhost:5173`. O doble clic en **Diagram Studio** en el escritorio (arranca el server si no está corriendo; en Windows usa `launch-diagrams.ps1`, en Linux `launch-diagrams.sh`).

Cada editor permite pegar/editar el código fuente, descargarlo en su formato nativo (.bpmn/.mmd/.puml/.dot/.excalidraw/.py/.tex/.ditaa/.dbml/.diag/.nomnoml/.sm) y exportar el diagrama renderizado en SVG/PNG/JPG a alta resolución.

`tools/Smc.jar` es [SMC (The State Machine Compiler)](https://smc.sourceforge.net/), incluido tal cual (dual-licencia MPL 1.1 / GPL 2.0, ver `tools/SMC-LICENSE.txt`) ya que no está disponible como paquete de sistema.
