# Diagram Studio

Visor y editor local de diagramas: BPMN, Mermaid, PlantUML (con preset C4), Graphviz, Excalidraw, TikZ, Ditaa (ASCII art), DBML (esquemas de base de datos), Blockdiag (bloques/redes), Sankey (flujos proporcionales), Nomnoml (UML simple) y SMC (máquinas de estado), más generación de diagramas de arquitectura (AWS/GCP/Azure) desde Python (`diagrams`).

## Setup

```bash
./install.sh
```

Deja instaladas las dependencias de Node, un entorno virtual de Python con `diagrams`, y un lanzador de escritorio (`~/Desktop/diagram-studio.desktop`).

Requiere `python3`, el binario `graphviz` (`dot`), una distribución LaTeX con `pgf/tikz` y `dvisvgm` (p.ej. TinyTeX), `ditaa` y `java` (SMC usa `tools/Smc.jar`, ya incluido en el repo) instalados en el sistema.

## Uso

```bash
npm run dev
```

Abre `http://localhost:5173`. O doble clic en **Diagram Studio** en el escritorio (arranca el server si no está corriendo).

Cada editor permite pegar/editar el código fuente, descargarlo en su formato nativo (.bpmn/.mmd/.puml/.dot/.excalidraw/.py/.tex/.ditaa/.dbml/.diag/.nomnoml/.sm) y exportar el diagrama renderizado en SVG/PNG/JPG a alta resolución.

`tools/Smc.jar` es [SMC (The State Machine Compiler)](https://smc.sourceforge.net/), incluido tal cual (dual-licencia MPL 1.1 / GPL 2.0, ver `tools/SMC-LICENSE.txt`) ya que no está disponible como paquete de sistema.
