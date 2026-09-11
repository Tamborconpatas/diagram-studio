#!/usr/bin/env bash
# Deja Diagram Studio listo desde cero: deps de Node, venv de Python con
# `diagrams`, y el lanzador de escritorio. Pensado para Linux (freedesktop).
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v node >/dev/null || ! command -v npm >/dev/null; then
  echo "ERROR: falta Node.js. Instálalo, p.ej.:" >&2
  echo "  Debian/Ubuntu: sudo apt install nodejs npm" >&2
  echo "  Fedora:        sudo dnf install nodejs npm" >&2
  echo "  Arch:          sudo pacman -S nodejs npm" >&2
  echo "  o nvm: https://github.com/nvm-sh/nvm" >&2
  exit 1
fi

echo "==> Instalando dependencias de Node"
npm install

echo "==> Creando entorno Python para diagramas de arquitectura (aws/gcp/azure)"
if ! command -v python3 >/dev/null; then
  echo "ERROR: python3 no está instalado. Instálalo con tu gestor de paquetes." >&2
  exit 1
fi
if ! command -v dot >/dev/null; then
  echo "ERROR: falta el binario 'graphviz' (comando 'dot'). Instálalo, p.ej.:" >&2
  echo "  Debian/Ubuntu: sudo apt install graphviz" >&2
  echo "  Fedora:        sudo dnf install graphviz" >&2
  echo "  Arch:          sudo pacman -S graphviz" >&2
  exit 1
fi
rm -rf .venv-diagrams
python3 -m venv .venv-diagrams
.venv-diagrams/bin/pip install --quiet --upgrade pip diagrams
# blockdiag and its family (seqdiag/actdiag/nwdiag also provide
# packetdiag/rackdiag) were last released in 2021 and need pkg_resources,
# removed from setuptools>=81; pin an older setuptools that still ships it.
# Their text-size call also uses a removed Pillow API, patched at runtime in
# scripts/blockdiag-runner.py instead of pinning an old Pillow (no wheels
# exist for current Python versions).
.venv-diagrams/bin/pip install --quiet "setuptools<81" blockdiag seqdiag actdiag nwdiag

echo "==> Comprobando LaTeX/TikZ"
if ! command -v latex >/dev/null || ! command -v dvisvgm >/dev/null; then
  echo "ERROR: falta 'latex' o 'dvisvgm'. Instala una distribución TeX, p.ej.:" >&2
  echo "  Debian/Ubuntu: sudo apt install texlive-latex-base texlive-pictures dvisvgm" >&2
  echo "  Fedora:        sudo dnf install texlive-scheme-basic texlive-pgf texlive-dvisvgm" >&2
  echo "  Arch:          sudo pacman -S texlive-basic texlive-pictures" >&2
  echo "  o TinyTeX: https://yihui.org/tinytex/" >&2
  exit 1
fi
if ! kpsewhich tikz.sty >/dev/null 2>&1 && command -v tlmgr >/dev/null; then
  tlmgr install pgf dvisvgm >/dev/null
fi
if ! kpsewhich tikz.sty >/dev/null 2>&1; then
  echo "ERROR: falta el paquete LaTeX 'pgf/tikz' (tikz.sty). Instálalo con tu gestor de paquetes TeX." >&2
  exit 1
fi

echo "==> Comprobando Java (SMC, Ditaa)"
if ! command -v java >/dev/null; then
  echo "ERROR: falta 'java'. Instálalo, p.ej.:" >&2
  echo "  Debian/Ubuntu: sudo apt install default-jre" >&2
  echo "  Fedora/Arch:   busca un paquete 'jre'/'jdk' de tu distro" >&2
  exit 1
fi

echo "==> Comprobando D2"
if ! command -v d2 >/dev/null; then
  echo "ERROR: falta 'd2'. Instálalo: curl -fsSL https://d2lang.com/install.sh | sh -s --" >&2
  exit 1
fi

echo "==> Instalando lanzador de escritorio"
mkdir -p "$HOME/Desktop"
sed "s#__APP_DIR__#$(pwd)#g" desktop/diagram-studio.desktop.template > "$HOME/Desktop/diagram-studio.desktop"
chmod +x "$HOME/Desktop/diagram-studio.desktop" launch-diagrams.sh
command -v gio >/dev/null && gio set "$HOME/Desktop/diagram-studio.desktop" metadata::trusted true || true

echo "==> Listo. Doble clic en 'Diagram Studio' en el escritorio, o: ./launch-diagrams.sh"
