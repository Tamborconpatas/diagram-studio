import type { Translations } from './types';

export const translations: Record<'es' | 'en', Translations> = {
  es: {
    homeSubtitle: 'Elige una herramienta para empezar.',
    examplesTitle: 'Ejemplos',
    actionsTitle: 'Acciones',
    codeTitle: 'Código',
    renderBtn: 'Renderizar',
    renderingBtn: 'Renderizando…',
    toolInstaller: {
      missingTitle: 'Falta software para este formato',
      missingHint: (names, platform) =>
        `Este formato necesita: ${names}. La app puede instalarlo por ti` +
        (platform === 'win32' ? '; Windows te pedirá permiso de administrador.' : platform === 'linux' ? '; te pedirá tu contraseña.' : '.'),
      installBtn: 'Instalar',
      installingTitle: 'Instalando…',
      installingHint: 'Puede tardar varios minutos. No cierres la app.',
      failedTitle: 'No se pudo instalar',
      retryBtn: 'Reintentar',
    },
    compilingBtn: 'Compilando…',
    openFileBtn: (ext: string) => `Abrir ${ext}`,
    downloadFileBtn: (ext: string) => `Descargar ${ext}`,
    tools: {
      bpmn: {
        label: 'BPMN',
        description: 'Procesos de negocio, editable arrastrando tareas y flechas.',
      },
      mermaid: {
        label: 'Mermaid',
        description: '~15 tipos en un motor: flowcharts, secuencia, clases, ER, estado...',
      },
      plantuml: {
        label: 'PlantUML',
        description: 'UML clásico y C4, con temas y actores en notación tradicional.',
      },
      graphviz: {
        label: 'Graphviz',
        description: 'Grafos DOT con layout automático y presets de estilo.',
      },
      excalidraw: {
        label: 'Excalidraw',
        description: 'Pizarra a mano alzada, 100% arrastrable.',
      },
      drawio: {
        label: 'draw.io',
        description: 'Editor visual completo (arrastrar y soltar), 100% local.',
      },
      aws: {
        label: 'Arquitectura (Python)',
        description: 'Diagramas AWS/GCP/Azure desde código Python (`diagrams`).',
      },
      tikz: {
        label: 'TikZ',
        description: 'Gráficos vectoriales de precisión vía LaTeX.',
      },
      circuitikz: {
        label: 'CircuiTikz',
        description: 'Circuitos electrónicos vía LaTeX (arriba de TikZ).',
      },
      feynman: {
        label: 'Feynman',
        description: 'Diagramas de Feynman (física de partículas) vía LaTeX.',
      },
      chemfig: {
        label: 'Chemfig',
        description: 'Estructuras químicas y moléculas vía LaTeX.',
      },
      skak: {
        label: 'Skak (Ajedrez)',
        description: 'Tableros y partidas de ajedrez vía LaTeX.',
      },
      metapost: {
        label: 'MetaPost',
        description: 'Figuras vectoriales precisas con curvas suaves (incluido con MiKTeX).',
      },
      wireviz: {
        label: 'WireViz',
        description: 'Diagramas de arneses y cables eléctricos desde YAML.',
      },
      ditaa: {
        label: 'Ditaa (ASCII art)',
        description: 'Convierte arte ASCII en diagramas prolijos.',
      },
      svgbob: {
        label: 'Svgbob (ASCII art)',
        description: 'Convierte dibujos ASCII de líneas y cajas en SVG.',
      },
      gnuplot: {
        label: 'Gnuplot',
        description: 'Gráficos científicos y funciones matemáticas desde un script.',
      },
      lilypond: {
        label: 'LilyPond',
        description: 'Notación musical completa (partituras profesionales).',
      },
      dbml: {
        label: 'DBML',
        description: 'Esquemas de base de datos: tablas, tipos y relaciones ER.',
      },
      blockdiag: {
        label: 'Blockdiag',
        description: 'Diagramas de bloques y redes desde texto simple.',
      },
      seqdiag: {
        label: 'Seqdiag',
        description: 'Diagramas de secuencia simples, misma familia que Blockdiag.',
      },
      actdiag: {
        label: 'Actdiag',
        description: 'Diagramas de actividad con carriles (lanes).',
      },
      nwdiag: {
        label: 'Nwdiag',
        description: 'Diagramas de red: hosts agrupados por subred.',
      },
      packetdiag: {
        label: 'Packetdiag',
        description: 'Diagramas de estructura de paquetes/bytes.',
      },
      rackdiag: {
        label: 'Rackdiag',
        description: 'Diagramas de racks de servidores.',
      },
      d2: {
        label: 'D2',
        description: 'Diagramas modernos con layout automático y contenedores.',
      },
      sankey: {
        label: 'Sankey',
        description: 'Diagramas de flujo proporcional, 100% en el navegador.',
      },
      nomnoml: {
        label: 'Nomnoml',
        description: 'UML simple (clases, herencia), 100% en el navegador.',
      },
      pikchr: {
        label: 'Pikchr',
        description: 'Diagramas de cajas y flechas, livianos, 100% en el navegador.',
      },
      wavedrom: {
        label: 'WaveDrom',
        description: 'Diagramas de temporización digital, 100% en el navegador.',
      },
      markmap: {
        label: 'Markmap',
        description: 'Mapa mental interactivo desde Markdown, 100% en el navegador.',
      },
      smiles: {
        label: 'SMILES',
        description: 'Notación molecular química, 100% en el navegador.',
      },
      abc: {
        label: 'ABC',
        description: 'Notación musical (partituras), 100% en el navegador.',
      },
      vegalite: {
        label: 'Vega-Lite',
        description: 'Gráficos y visualización de datos desde una especificación declarativa (JSON).',
      },
      smc: {
        label: 'SMC',
        description: 'Máquinas de estado desde tabla de transiciones (State Machine Compiler).',
      },
    },
    categories: {
      software: 'Software y arquitectura',
      infra: 'Infraestructura y redes',
      process: 'Procesos y flujos',
      technical: 'Modelos técnicos',
      drawing: 'Dibujo libre',
    },
    useCases: {
      sequence: 'Secuencia',
      usecase: 'Casos de uso',
      process: 'Procesos (BPMN/actividad)',
      classUml: 'Clases / UML',
      state: 'Estados',
      database: 'Bases de datos / ER',
      architecture: 'Arquitectura de sistemas',
      network: 'Redes',
      flow: 'Flujos y grafos',
      scientific: 'Gráficos científicos',
      freeform: 'Dibujo libre / ASCII',
    },
    homeViewToggle: {
      byTool: 'Por herramienta',
      byUseCase: 'Por tipo de diagrama',
    },
    sidebar: {
      searchPlaceholder: 'Buscar herramienta…',
      noResults: 'Sin resultados',
      collapse: 'Colapsar barra lateral',
      expand: 'Expandir barra lateral',
      home: 'Inicio',
    },
    commandPalette: {
      hint: 'Ctrl+K para buscar cualquier herramienta',
    },
    bpmn: {
      loadToDiagram: 'Cargar → diagrama',
      diagramToXml: 'Diagrama → XML',
      presets: {
        ninguno: 'ninguno',
        azul: 'azul',
        verde: 'verde',
        ambar: 'ámbar',
        pastel: 'pastel',
      },
      examples: {
        simple: 'Simple',
        gateway: 'Gateway (aprobación)',
        parallel: 'Gateway paralelo',
        timer: 'Timer intermedio',
        pool: 'Pool con lanes',
      },
    },
    mermaid: {
      editVisually: 'Editar visualmente',
      converting: 'Convirtiendo…',
      flatWarning:
        'Este tipo de diagrama Mermaid no se puede editar nodo por nodo (solo flowchart, sequence, class, ER y state) — se pegó como una sola imagen.',
    },
    graphviz: {
      presets: {
        none: 'ninguno',
        claro: 'claro',
        oscuro: 'oscuro',
        pastel: 'pastel',
      },
      examples: {
        simple: 'Grafo simple',
        subgraphs: 'Subgrafos/clusters',
        undirected: 'No dirigido',
        tree: 'Árbol jerárquico',
        record: 'Nodos tipo registro',
        circo: 'Layout circular',
        twopi: 'Layout radial',
      },
    },
    plantuml: {
      noTheme: 'sin tema',
      renderError: 'No se pudo renderizar el diagrama (servidor PlantUML público, requiere internet)',
      fetchError: (status: number | string) => `No se pudo obtener el SVG (${status})`,
      altText: 'Diagrama PlantUML',
      examples: {
        sequence: 'Sequence',
        class: 'Class',
        usecase: 'Use Case',
        c4: 'C4 Container',
        activity: 'Activity',
        component: 'Component',
        state: 'State',
        deployment: 'Deployment',
        object: 'Object',
        timing: 'Timing',
        wireframe: 'Wireframe',
        gantt: 'Gantt',
        mindmap: 'MindMap',
        wbs: 'WBS',
        json: 'JSON',
        yaml: 'YAML',
        archimate: 'Archimate',
        network: 'Network',
        regex: 'Regex',
        ebnf: 'EBNF',
      },
    },
    cliFormats: {
      blockdiag: {
        examples: {
          simple: 'Simple',
          colors: 'Con colores',
          groups: 'Con grupos',
          shapes: 'Formas y estilos',
        },
      },
      seqdiag: {
        examples: {
          simple: 'Simple',
          async: 'Asíncrono',
          selfCall: 'Llamada a sí mismo',
        },
      },
      actdiag: {
        examples: {
          lanes: 'Con carriles',
          simple: 'Lineal',
        },
      },
      nwdiag: {
        examples: {
          twoNetworks: 'Dos subredes',
          simple: 'Una subred',
        },
      },
      packetdiag: {
        examples: {
          tcpHeader: 'Cabecera TCP',
          simple: 'Simple',
        },
      },
      rackdiag: {
        examples: {
          simple: 'Rack simple',
          withUnits: 'Con tamaños en U',
        },
      },
      d2: {
        examples: {
          simple: 'Simple',
          containers: 'Con contenedores',
          shapes: 'Formas y flujo',
        },
      },
      dbml: {
        examples: {
          twoTables: '2 tablas',
          manyToMany: 'Muchos a muchos',
          enumIndexes: 'Con enum e índices',
        },
      },
      ditaa: {
        examples: {
          simple: 'Flujo simple',
          decision: 'Con decisión',
          colors: 'Con colores',
          rounded: 'Esquinas redondeadas',
        },
      },
      smc: {
        examples: {
          turnstile: 'Torniquete',
          trafficLight: 'Semáforo',
          guards: 'Con guardas',
        },
      },
      tikz: {
        examples: {
          nodesArrow: 'Nodos y flecha',
          math: 'Función matemática',
          tree: 'Árbol',
          venn: 'Diagrama de Venn',
          bars: 'Gráfico de barras',
          pattern: 'Patrón/relleno',
        },
      },
      circuitikz: {
        examples: {
          rc: 'Circuito RC',
          voltageDivider: 'Divisor de voltaje',
        },
      },
      feynman: {
        examples: {
          annihilation: 'Aniquilación simple',
          compton: 'Dispersión Compton',
        },
      },
      chemfig: {
        examples: {
          ethanol: 'Etanol',
          benzene: 'Benceno',
        },
      },
      skak: {
        examples: {
          empty: 'Tablero vacío',
          opening: 'Apertura (Ruy López)',
        },
      },
      metapost: {
        examples: {
          square: 'Cuadrado con diagonal',
          curve: 'Curva suave',
        },
      },
      wireviz: {
        examples: {
          simple: 'Conector simple',
          shielded: 'Con blindaje (DIN)',
        },
      },
      svgbob: {
        examples: {
          flujo: 'Flujo cliente-servidor',
          ramificacion: 'Ramificación y fusión',
          red: 'Topología de red',
        },
      },
      gnuplot: {
        examples: {
          funciones: 'Funciones trigonométricas',
          barras: 'Barras',
          dispersion: 'Dispersión',
        },
      },
      lilypond: {
        examples: {
          escala: 'Escala simple',
          acordes: 'Acordes',
          dinamica: 'Dinámica y articulación',
        },
      },
    },
    nomnoml: {
      examples: {
        inheritance: 'Herencia',
        association: 'Asociación simple',
        notePackage: 'Con nota y paquete',
        state: 'Diagrama de estado',
      },
    },
    wavedrom: {
      examples: {
        clock: 'Reloj y bus',
        request: 'Request/Ack',
        edges: 'Con flechas entre señales',
      },
    },
    markmap: {
      examples: {
        simple: 'Simple',
        project: 'Plan de proyecto',
      },
    },
    smiles: {
      examples: {
        aspirin: 'Aspirina',
        caffeine: 'Cafeína',
        glucose: 'Glucosa',
      },
    },
    pikchr: {
      examples: {
        flow: 'Flujo simple',
        colors: 'Círculos con color',
      },
    },
    abc: {
      examples: {
        scale: 'Escala simple',
        tune: 'Melodía',
      },
    },
    vegalite: {
      examples: {
        bar: 'Gráfico de barras',
        line: 'Gráfico de líneas',
        scatter: 'Dispersión (scatter)',
      },
    },
    pythonDiagrams: {
      examples: {
        aws: 'AWS 3-capas',
        gcp: 'GCP',
        azure: 'Azure',
        k8s: 'Kubernetes',
        onprem: 'On-Prem',
      },
    },
    sankey: {
      invalidLine: (line: string) => `Línea inválida (formato: "Origen [monto] Destino"): "${line}"`,
      noFlows: 'No hay flujos que dibujar',
      examples: {
        budget: 'Presupuesto',
        energy: 'Energía',
        funnel: 'Embudo de ventas',
      },
    },
  },
  en: {
    homeSubtitle: 'Choose a tool to get started.',
    examplesTitle: 'Examples',
    actionsTitle: 'Actions',
    codeTitle: 'Code',
    renderBtn: 'Render',
    renderingBtn: 'Rendering…',
    toolInstaller: {
      missingTitle: 'Software missing for this format',
      missingHint: (names, platform) =>
        `This format needs: ${names}. The app can install it for you` +
        (platform === 'win32' ? '; Windows will ask for administrator permission.' : platform === 'linux' ? '; it will ask for your password.' : '.'),
      installBtn: 'Install',
      installingTitle: 'Installing…',
      installingHint: 'This can take several minutes. Do not close the app.',
      failedTitle: 'Installation failed',
      retryBtn: 'Retry',
    },
    compilingBtn: 'Compiling…',
    openFileBtn: (ext: string) => `Open ${ext}`,
    downloadFileBtn: (ext: string) => `Download ${ext}`,
    tools: {
      bpmn: {
        label: 'BPMN',
        description: 'Business processes, editable by dragging tasks and arrows.',
      },
      mermaid: {
        label: 'Mermaid',
        description: '~15 types in one engine: flowcharts, sequence, class, ER, state...',
      },
      plantuml: {
        label: 'PlantUML',
        description: 'Classic UML and C4, with themes and actors in traditional notation.',
      },
      graphviz: {
        label: 'Graphviz',
        description: 'DOT graphs with automatic layout and style presets.',
      },
      excalidraw: {
        label: 'Excalidraw',
        description: 'Hand-drawn whiteboard, 100% draggable.',
      },
      drawio: {
        label: 'draw.io',
        description: 'Full visual drag-and-drop editor, 100% local.',
      },
      aws: {
        label: 'Architecture (Python)',
        description: 'AWS/GCP/Azure diagrams from Python code (`diagrams`).',
      },
      tikz: {
        label: 'TikZ',
        description: 'Precision vector graphics via LaTeX.',
      },
      circuitikz: {
        label: 'CircuiTikz',
        description: 'Electronic circuits via LaTeX (built on TikZ).',
      },
      feynman: {
        label: 'Feynman',
        description: 'Feynman diagrams (particle physics) via LaTeX.',
      },
      chemfig: {
        label: 'Chemfig',
        description: 'Chemical structures and molecules via LaTeX.',
      },
      skak: {
        label: 'Skak (Chess)',
        description: 'Chess boards and games via LaTeX.',
      },
      metapost: {
        label: 'MetaPost',
        description: 'Precise vector figures with smooth curves (bundled with MiKTeX).',
      },
      wireviz: {
        label: 'WireViz',
        description: 'Cable and wire harness diagrams from YAML.',
      },
      ditaa: {
        label: 'Ditaa (ASCII art)',
        description: 'Converts ASCII art into neat diagrams.',
      },
      svgbob: {
        label: 'Svgbob (ASCII art)',
        description: 'Converts ASCII box-and-line drawings into SVG.',
      },
      gnuplot: {
        label: 'Gnuplot',
        description: 'Scientific plots and math functions from a script.',
      },
      lilypond: {
        label: 'LilyPond',
        description: 'Full music notation engraving (professional sheet music).',
      },
      dbml: {
        label: 'DBML',
        description: 'Database schemas: tables, types, and ER relationships.',
      },
      blockdiag: {
        label: 'Blockdiag',
        description: 'Block and network diagrams from simple text.',
      },
      seqdiag: {
        label: 'Seqdiag',
        description: 'Simple sequence diagrams, same family as Blockdiag.',
      },
      actdiag: {
        label: 'Actdiag',
        description: 'Activity diagrams with swimlanes.',
      },
      nwdiag: {
        label: 'Nwdiag',
        description: 'Network diagrams: hosts grouped by subnet.',
      },
      packetdiag: {
        label: 'Packetdiag',
        description: 'Packet/byte layout diagrams.',
      },
      rackdiag: {
        label: 'Rackdiag',
        description: 'Server rack diagrams.',
      },
      d2: {
        label: 'D2',
        description: 'Modern diagrams with automatic layout and containers.',
      },
      sankey: {
        label: 'Sankey',
        description: 'Proportional flow diagrams, 100% in the browser.',
      },
      nomnoml: {
        label: 'Nomnoml',
        description: 'Simple UML (classes, inheritance), 100% in the browser.',
      },
      pikchr: {
        label: 'Pikchr',
        description: 'Lightweight box-and-arrow diagrams, 100% in the browser.',
      },
      wavedrom: {
        label: 'WaveDrom',
        description: 'Digital timing diagrams, 100% in the browser.',
      },
      markmap: {
        label: 'Markmap',
        description: 'Interactive mind map from Markdown, 100% in the browser.',
      },
      smiles: {
        label: 'SMILES',
        description: 'Chemical molecular notation, 100% in the browser.',
      },
      abc: {
        label: 'ABC',
        description: 'Music notation (sheet music), 100% in the browser.',
      },
      vegalite: {
        label: 'Vega-Lite',
        description: 'Charts and data visualization from a declarative (JSON) spec.',
      },
      smc: {
        label: 'SMC',
        description: 'State machines from transition tables (State Machine Compiler).',
      },
    },
    categories: {
      software: 'Software & architecture',
      infra: 'Infrastructure & networking',
      process: 'Processes & flows',
      technical: 'Technical models',
      drawing: 'Free-form drawing',
    },
    useCases: {
      sequence: 'Sequence',
      usecase: 'Use cases',
      process: 'Processes (BPMN/activity)',
      classUml: 'Classes / UML',
      state: 'States',
      database: 'Databases / ER',
      architecture: 'System architecture',
      network: 'Networking',
      flow: 'Flows & graphs',
      scientific: 'Scientific graphics',
      freeform: 'Free-form / ASCII',
    },
    homeViewToggle: {
      byTool: 'By tool',
      byUseCase: 'By diagram type',
    },
    sidebar: {
      searchPlaceholder: 'Search a tool…',
      noResults: 'No results',
      collapse: 'Collapse sidebar',
      expand: 'Expand sidebar',
      home: 'Home',
    },
    commandPalette: {
      hint: 'Ctrl+K to search any tool',
    },
    bpmn: {
      loadToDiagram: 'Load → diagram',
      diagramToXml: 'Diagram → XML',
      presets: {
        ninguno: 'none',
        azul: 'blue',
        verde: 'green',
        ambar: 'amber',
        pastel: 'pastel',
      },
      examples: {
        simple: 'Simple',
        gateway: 'Gateway (approval)',
        parallel: 'Parallel gateway',
        timer: 'Intermediate timer',
        pool: 'Pool with lanes',
      },
    },
    mermaid: {
      editVisually: 'Edit visually',
      converting: 'Converting…',
      flatWarning:
        'This type of Mermaid diagram cannot be edited node by node (only flowchart, sequence, class, ER and state) — pasted as a single image.',
    },
    graphviz: {
      presets: {
        none: 'none',
        claro: 'light',
        oscuro: 'dark',
        pastel: 'pastel',
      },
      examples: {
        simple: 'Simple graph',
        subgraphs: 'Subgraphs/clusters',
        undirected: 'Undirected',
        tree: 'Hierarchical tree',
        record: 'Record nodes',
        circo: 'Circular layout',
        twopi: 'Radial layout',
      },
    },
    plantuml: {
      noTheme: 'no theme',
      renderError: 'Could not render diagram (public PlantUML server, requires internet)',
      fetchError: (status: number | string) => `Could not fetch SVG (${status})`,
      altText: 'PlantUML Diagram',
      examples: {
        sequence: 'Sequence',
        class: 'Class',
        usecase: 'Use Case',
        c4: 'C4 Container',
        activity: 'Activity',
        component: 'Component',
        state: 'State',
        deployment: 'Deployment',
        object: 'Object',
        timing: 'Timing',
        wireframe: 'Wireframe',
        gantt: 'Gantt',
        mindmap: 'MindMap',
        wbs: 'WBS',
        json: 'JSON',
        yaml: 'YAML',
        archimate: 'Archimate',
        network: 'Network',
        regex: 'Regex',
        ebnf: 'EBNF',
      },
    },
    cliFormats: {
      blockdiag: {
        examples: {
          simple: 'Simple',
          colors: 'With colors',
          groups: 'With groups',
          shapes: 'Shapes and styles',
        },
      },
      seqdiag: {
        examples: {
          simple: 'Simple',
          async: 'Async',
          selfCall: 'Self call',
        },
      },
      actdiag: {
        examples: {
          lanes: 'With lanes',
          simple: 'Linear',
        },
      },
      nwdiag: {
        examples: {
          twoNetworks: 'Two subnets',
          simple: 'One subnet',
        },
      },
      packetdiag: {
        examples: {
          tcpHeader: 'TCP header',
          simple: 'Simple',
        },
      },
      rackdiag: {
        examples: {
          simple: 'Simple rack',
          withUnits: 'With unit sizes',
        },
      },
      d2: {
        examples: {
          simple: 'Simple',
          containers: 'With containers',
          shapes: 'Shapes and flow',
        },
      },
      dbml: {
        examples: {
          twoTables: '2 tables',
          manyToMany: 'Many to many',
          enumIndexes: 'With enum & indexes',
        },
      },
      ditaa: {
        examples: {
          simple: 'Simple flow',
          decision: 'With decision',
          colors: 'With colors',
          rounded: 'Rounded corners',
        },
      },
      smc: {
        examples: {
          turnstile: 'Turnstile',
          trafficLight: 'Traffic light',
          guards: 'With guards',
        },
      },
      tikz: {
        examples: {
          nodesArrow: 'Nodes and arrow',
          math: 'Math function',
          tree: 'Tree',
          venn: 'Venn diagram',
          bars: 'Bar chart',
          pattern: 'Pattern/fill',
        },
      },
      circuitikz: {
        examples: {
          rc: 'RC circuit',
          voltageDivider: 'Voltage divider',
        },
      },
      feynman: {
        examples: {
          annihilation: 'Simple annihilation',
          compton: 'Compton scattering',
        },
      },
      chemfig: {
        examples: {
          ethanol: 'Ethanol',
          benzene: 'Benzene',
        },
      },
      skak: {
        examples: {
          empty: 'Empty board',
          opening: 'Opening (Ruy Lopez)',
        },
      },
      metapost: {
        examples: {
          square: 'Square with diagonal',
          curve: 'Smooth curve',
        },
      },
      wireviz: {
        examples: {
          simple: 'Simple connector',
          shielded: 'Shielded (DIN)',
        },
      },
      svgbob: {
        examples: {
          flujo: 'Client-server flow',
          ramificacion: 'Branch and merge',
          red: 'Network topology',
        },
      },
      gnuplot: {
        examples: {
          funciones: 'Trigonometric functions',
          barras: 'Bars',
          dispersion: 'Scatter',
        },
      },
      lilypond: {
        examples: {
          escala: 'Simple scale',
          acordes: 'Chords',
          dinamica: 'Dynamics and articulation',
        },
      },
    },
    nomnoml: {
      examples: {
        inheritance: 'Inheritance',
        association: 'Simple association',
        notePackage: 'With note and package',
        state: 'State diagram',
      },
    },
    wavedrom: {
      examples: {
        clock: 'Clock and bus',
        request: 'Request/Ack',
        edges: 'With edges between signals',
      },
    },
    markmap: {
      examples: {
        simple: 'Simple',
        project: 'Project plan',
      },
    },
    smiles: {
      examples: {
        aspirin: 'Aspirin',
        caffeine: 'Caffeine',
        glucose: 'Glucose',
      },
    },
    pikchr: {
      examples: {
        flow: 'Simple flow',
        colors: 'Colored circles',
      },
    },
    abc: {
      examples: {
        scale: 'Simple scale',
        tune: 'Melody',
      },
    },
    vegalite: {
      examples: {
        bar: 'Bar chart',
        line: 'Line chart',
        scatter: 'Scatter plot',
      },
    },
    pythonDiagrams: {
      examples: {
        aws: 'AWS 3-tier',
        gcp: 'GCP',
        azure: 'Azure',
        k8s: 'Kubernetes',
        onprem: 'On-Prem',
      },
    },
    sankey: {
      invalidLine: (line: string) => `Invalid line (format: "Source [amount] Target"): "${line}"`,
      noFlows: 'No flows to draw',
      examples: {
        budget: 'Budget',
        energy: 'Energy',
        funnel: 'Sales funnel',
      },
    },
  },
};

