# Deja Diagram Studio listo desde cero en Windows: deps de Node, venv de
# Python con `diagrams`, y un acceso directo en el escritorio.
Set-Location $PSScriptRoot

function Test-Cmd($name) { [bool](Get-Command $name -ErrorAction SilentlyContinue) }
function Fail($msg) { Write-Host "ERROR: $msg" -ForegroundColor Red; exit 1 }

Write-Host "==> Instalando dependencias de Node"
npm install
if ($LASTEXITCODE -ne 0) { Fail "npm install fallo" }

Write-Host "==> Creando entorno Python para diagramas de arquitectura (aws/gcp/azure)"
$python = if (Test-Cmd 'py') { 'py' } elseif (Test-Cmd 'python') { 'python' } else { $null }
if (-not $python) {
    Fail "python no esta instalado. Instalalo, p.ej.: winget install Python.Python.3.12"
}
if (-not (Test-Cmd 'dot')) {
    Fail "falta el binario 'graphviz' (comando 'dot'). Instalalo: winget install Graphviz.Graphviz"
}
if (Test-Path .venv-diagrams) { Remove-Item -Recurse -Force .venv-diagrams }
& $python -m venv .venv-diagrams
if ($LASTEXITCODE -ne 0) { Fail "no se pudo crear el venv" }
$venvPython = '.\.venv-diagrams\Scripts\python.exe'
& $venvPython -m pip install --quiet --upgrade pip diagrams
if ($LASTEXITCODE -ne 0) { Fail "pip install diagrams fallo" }
# blockdiag and its family (seqdiag/actdiag/nwdiag also provide
# packetdiag/rackdiag) were last released in 2021 and need pkg_resources,
# removed from setuptools>=81; pin an older setuptools that still ships it.
# Their text-size call also uses a removed Pillow API, patched at runtime in
# scripts/blockdiag-runner.py instead of pinning an old Pillow (no wheels
# exist for current Python versions).
& $venvPython -m pip install --quiet "setuptools<81" blockdiag seqdiag actdiag nwdiag
if ($LASTEXITCODE -ne 0) { Fail "pip install blockdiag fallo" }

Write-Host "==> Comprobando LaTeX/TikZ"
if (-not (Test-Cmd 'latex') -or -not (Test-Cmd 'dvisvgm')) {
    Fail "falta 'latex' o 'dvisvgm'. Instala una distribucion TeX, p.ej.: winget install MiKTeX.MiKTeX (incluye dvisvgm)"
}
if (Test-Cmd 'initexmf') {
    # Sin esto, MiKTeX se queda colgado indefinidamente esperando confirmacion
    # interactiva para instalar paquetes que falten (standalone, xkeyval...),
    # lo cual cuelga cualquier compilacion no interactiva (como la del editor).
    initexmf --set-config-value='[MPM]AutoInstall'=1 *> $null
}
kpsewhich tikz.sty *> $null
if ($LASTEXITCODE -ne 0 -and (Test-Cmd 'mpm')) {
    mpm --install=pgf *> $null
}
kpsewhich tikz.sty *> $null
if ($LASTEXITCODE -ne 0) {
    Fail "falta el paquete LaTeX 'pgf/tikz' (tikz.sty). MiKTeX lo instala solo al primer uso; si falla, instalalo desde la consola de paquetes de MiKTeX."
}

Write-Host "==> Precalentando paquetes LaTeX del editor TikZ (standalone, xkeyval, decorations...)"
$warmDir = Join-Path $env:TEMP "diagram-studio-tikz-warmup"
New-Item -ItemType Directory -Force -Path $warmDir | Out-Null
Set-Content -Path (Join-Path $warmDir 'doc.tex') -Encoding ascii -Value @'
\documentclass[tikz,dvisvgm,border=2pt]{standalone}
\usetikzlibrary{arrows.meta,positioning,shapes.geometric,calc,decorations.pathmorphing,patterns}
\begin{document}
\begin{tikzpicture}
\draw (0,0) -- (1,1);
\end{tikzpicture}
\end{document}
'@
Push-Location $warmDir
latex -interaction=nonstopmode -halt-on-error doc.tex *> $null
Pop-Location
Remove-Item -Recurse -Force $warmDir

Write-Host "==> Comprobando Ditaa"
if (-not (Test-Cmd 'ditaa')) {
    Write-Host "AVISO: falta 'ditaa' (el editor Ditaa/ASCII art no funcionara). No esta en winget: descarga el jar (https://github.com/stathissideris/ditaa/releases) y crea un 'ditaa.bat' en el PATH con: @java -jar C:\ruta\a\ditaa.jar %*" -ForegroundColor Yellow
}

Write-Host "==> Comprobando Java (SMC)"
if (-not (Test-Cmd 'java')) {
    Fail "falta 'java'. Instalalo, p.ej.: winget install EclipseAdoptium.Temurin.21.JRE"
}

Write-Host "==> Comprobando D2"
if (-not (Test-Cmd 'd2')) {
    Fail "falta 'd2'. Instalalo: winget install Terrastruct.D2 (abri una terminal nueva despues para que tome el PATH)"
}

Write-Host "==> Creando acceso directo en el escritorio"
$desktop = [Environment]::GetFolderPath('Desktop')
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut((Join-Path $desktop 'Diagram Studio.lnk'))
$shortcut.TargetPath = 'powershell.exe'
$shortcut.Arguments = "-NoLogo -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$PSScriptRoot\launch-diagrams.ps1`""
$shortcut.WorkingDirectory = $PSScriptRoot
$shortcut.IconLocation = 'shell32.dll,44'
$shortcut.Description = 'Visor y editor local de diagramas: 20 formatos (BPMN, Mermaid, PlantUML, Graphviz, D2, draw.io, Excalidraw, TikZ, Ditaa, DBML, Blockdiag y familia, Sankey, Nomnoml, SMC)'
$shortcut.Save()

Write-Host "==> Listo. Doble clic en 'Diagram Studio' en el escritorio, o: .\launch-diagrams.ps1"
