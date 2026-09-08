Set-Location $PSScriptRoot

$url = 'http://localhost:5173/'

try {
    Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 1 | Out-Null
}
catch {
    Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', 'npm run dev -- --port 5173 --strictPort' -WindowStyle Hidden
    for ($i = 0; $i -lt 60; $i++) {
        try {
            Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 1 | Out-Null
            break
        }
        catch { Start-Sleep -Milliseconds 500 }
    }
}

Start-Process $url
