# Art Gallery Startup Script
# Run this script to start both backend and frontend servers

Write-Host "🎨 Starting Art Gallery Application..." -ForegroundColor Cyan
Write-Host ""

# Start Backend Server
Write-Host "📡 Starting Backend Server (Port 5000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; node server.js"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start Frontend Client
Write-Host "🌐 Starting Frontend Client (Port 3001)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PORT=3001; cd '$PSScriptRoot\client'; npm start"

Write-Host ""
Write-Host "✅ Application is starting up..." -ForegroundColor Green
Write-Host ""
Write-Host "📝 Access URLs:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:3001" -ForegroundColor White
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "   UPI Payment Guide: .\UPI_PAYMENT_COMPLETE_GUIDE.md" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
