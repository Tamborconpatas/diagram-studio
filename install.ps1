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
# blockdiag (last released 2021) needs pkg_resources, removed from
# setuptools>=81; pin an older setuptools that still ships it. Its text-size
# call also uses a removed Pillow API, patched at runtime in
# scripts/blockdiag-runner.py instead of pinning an old Pillow (no wheels
# exist for current Python versions).
& $venvPython -m pip install --quiet "setuptools<81" blockdiag
if ($LASTEXITCODE -ne 0) { Fail "pip install blockdiag fallo" }

Write-Host "==> Comprobando LaTeX/TikZ"
if (-not (Test-Cmd 'latex') -or -not (Test-Cmd 'dvisvgm')) {
    Fail "falta 'latex' o 'dvisvgm'. Instala una distribucion TeX, p.ej.: winget install MiKTeX.MiKTeX (incluye dvisvgm)"
}
kpsewhich tikz.sty *> $null
if ($LASTEXITCODE -ne 0 -and (Test-Cmd 'mpm')) {
    mpm --install=pgf *> $null
}
kpsewhich tikz.sty *> $null
if ($LASTEXITCODE -ne 0) {
    Fail "falta el paquete LaTeX 'pgf/tikz' (tikz.sty). MiKTeX lo instala solo al primer uso; si falla, instalalo desde la consola de paquetes de MiKTeX."
}

Write-Host "==> Comprobando Ditaa"
if (-not (Test-Cmd 'ditaa')) {
    Write-Host "AVISO: falta 'ditaa' (el editor Ditaa/ASCII art no funcionara). No esta en winget: descarga el jar (https://github.com/stathissideris/ditaa/releases) y crea un 'ditaa.bat' en el PATH con: @java -jar C:\ruta\a\ditaa.jar %*" -ForegroundColor Yellow
}

Write-Host "==> Comprobando Java (SMC)"
if (-not (Test-Cmd 'java')) {
    Fail "falta 'java'. Instalalo, p.ej.: winget install EclipseAdoptium.Temurin.21.JRE"
}

Write-Host "==> Creando acceso directo en el escritorio"
$desktop = [Environment]::GetFolderPath('Desktop')
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut((Join-Path $desktop 'Diagram Studio.lnk'))
$shortcut.TargetPath = 'powershell.exe'
$shortcut.Arguments = "-NoLogo -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$PSScriptRoot\launch-diagrams.ps1`""
$shortcut.WorkingDirectory = $PSScriptRoot
$shortcut.IconLocation = 'shell32.dll,44'
$shortcut.Description = 'Visor y editor local de diagramas (BPMN, Mermaid, PlantUML, Graphviz, Excalidraw, TikZ, Ditaa, DBML, Blockdiag, Sankey, Nomnoml, SMC)'
$shortcut.Save()

Write-Host "==> Listo. Doble clic en 'Diagram Studio' en el escritorio, o: .\launch-diagrams.ps1"
