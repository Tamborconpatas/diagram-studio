# Diagram Studio

Visor y editor local de diagramas: BPMN, Mermaid, PlantUML (con preset C4), Graphviz, Excalidraw, TikZ y Ditaa (ASCII art), más generación de diagramas de arquitectura (AWS/GCP/Azure) desde Python (`diagrams`).

## Setup

```bash
./install.sh
```

Deja instaladas las dependencias de Node, un entorno virtual de Python con `diagrams`, y un lanzador de escritorio (`~/Desktop/diagram-studio.desktop`).

Requiere `python3`, el binario `graphviz` (`dot`), una distribución LaTeX con `pgf/tikz` y `dvisvgm` (p.ej. TinyTeX), y `ditaa` (necesita Java) instalados en el sistema.

## Uso

```bash
npm run dev
```

Abre `http://localhost:5173`. O doble clic en **Diagram Studio** en el escritorio (arranca el server si no está corriendo).

Cada editor permite pegar/editar el código fuente, descargarlo en su formato nativo (.bpmn/.mmd/.puml/.dot/.excalidraw/.py/.tex/.ditaa) y exportar el diagrama renderizado en SVG/PNG/JPG a alta resolución.
