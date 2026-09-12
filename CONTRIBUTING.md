# Contribuir a Diagram Studio

Gracias por el interés. Esto es lo que necesitás saber para sumar algo.

## Setup

Seguí el `## Setup` del [README](README.md) para tu sistema (`install.sh` / `install.ps1`), después:

```bash
npm run dev
```

## Antes de mandar un PR

```bash
npm run check           # wiring estático: labels i18n + renderers registrados (rápido, sin dependencias)
npx tsc --noEmit         # typecheck
npm run check-examples   # con `npm run dev` corriendo en otra terminal: renderiza TODOS los ejemplos contra el server real
```

El primero corre solo en CI en cada PR. El segundo y el tercero no (`check-examples` necesita las dependencias de sistema del formato que estés tocando, no tiene sentido correrlo en un runner genérico) — pero si agregás o tocás un formato, corré los tres localmente antes de abrir el PR.

## Agregar un formato de diagrama nuevo

Hay dos caminos según si el formato se renderiza en el navegador o necesita un binario del sistema.

### Formato CLI-backed (corre un binario del sistema: Python, Java, LaTeX, Rust, etc.)

Tres archivos, sin componente nuevo:

1. **`vite-plugin-diagrams-api.ts`** — un entry en `RENDERERS`. Si es "escribir input → correr uno o más comandos → leer output.svg", usá el helper `runner(inputFile, outputFile, steps)`; si el formato tiene su propio caso raro (como Ditaa, que solo da PNG), escribí una función `Handler` a mano.
2. **`src/cliBackedFormats.ts`** — un entry en `CLI_BACKED_FORMATS` (`id`, ícono de `lucide-react`, `category`, `useCases`, `fileExt`, 2-3 ejemplos en ES/EN). Esto ya le da editor de código, examples menu, export SVG/PNG/JPG y zoom/pan gratis vía el componente compartido `CliFormatEditor`.
3. **`src/i18n/translations.ts`** — label + description del formato en `tools.<id>` (ES y EN), y las etiquetas de los ejemplos en `cliFormats.<id>.examples` (ES y EN).

### Formato client-side (una librería de npm, sin backend)

Mirá `src/editors/PikchrEditor.tsx` o `AbcEditor.tsx` como plantilla: un componente que usa `<EditorLayout>` con su propio `renderArea`, agregado a `CUSTOM_TOOLS` en `src/DiagramApp.tsx`, más sus labels en `translations.ts`.

## Cosas que ya te vas a topar (y por qué son así)

- **Los SVG necesitan `width`/`height` explícitos**, no solo `viewBox` — si el backend que agregás no los pone, el zoom/pan (`ZoomPane`) no puede calcular el tamaño real del diagrama. Mirá `ensureSvgDimensions` en `CliBackedEditor.tsx`, que ya lo corrige automáticamente para cualquier SVG que le llegue sin esos atributos.
- **Fondo blanco con texto SVG que usa `fill="currentColor"`** se vuelve invisible si el contenedor no fija `text-black` explícito (el tema es oscuro por defecto). Ver el comentario en `CliBackedEditor.tsx`.
- **No envuelvas en `ZoomPane` un editor que ya tiene su propio pan/zoom** (BPMN vía bpmn-js, Markmap vía d3-zoom) — pasale `disableZoomPane` a `<EditorLayout>`, si no compiten por los mismos eventos de mouse.

## Licencias

El código del proyecto es MIT ([LICENSE](LICENSE)). Si agregás una dependencia (npm o herramienta de sistema), sumala a la tabla de `## Licencias` del README con su licencia real — no asumas, varias terminan siendo distintas de lo esperado (ver el historial de commits de esa sección).
