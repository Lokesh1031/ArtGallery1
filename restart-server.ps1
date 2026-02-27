# Restart Server Script
Write-Host "Stopping server processes..." -ForegroundColor Yellow

# Stop server process (node server/server.js)
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
    $id = $_.Id
    $cmdLine = (Get-WmiObject Win32_Process -Filter "ProcessId = $id").CommandLine
    $cmdLine -like "*server/server.js*" -or $cmdLine -like "*server\\server.js*"
} | ForEach-Object {
    Write-Host "Stopping server process (PID: $($_.Id))..." -ForegroundColor Yellow
    Stop-Process -Id $_.Id -Force
}

Start-Sleep -Seconds 2

Write-Host "`nStarting server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; node server/server.js"

Write-Host "`nServer restarted successfully!" -ForegroundColor Green
Write-Host "The server is now running in a new window." -ForegroundColor Cyan
