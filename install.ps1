# Art Gallery Shop - Installation Script
# Run this script in PowerShell to set up the project

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Art Gallery Shop - Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit
}

# Check npm
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm $npmVersion found" -ForegroundColor Green
} catch {
    Write-Host "✗ npm not found. Please install npm first." -ForegroundColor Red
    exit
}

# Install backend dependencies
Write-Host ""
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Backend installation failed" -ForegroundColor Red
    exit
}

# Install frontend dependencies
Write-Host ""
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location client
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
    Set-Location ..
} else {
    Write-Host "✗ Frontend installation failed" -ForegroundColor Red
    Set-Location ..
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Configure database credentials in .env file" -ForegroundColor White
Write-Host "2. Create MySQL database: CREATE DATABASE art_gallery_db;" -ForegroundColor White
Write-Host "3. Initialize database: node server/database/init-db.js" -ForegroundColor White
Write-Host "4. Start backend: npm run dev" -ForegroundColor White
Write-Host "5. Start frontend (new terminal): cd client && npm start" -ForegroundColor White
Write-Host ""
Write-Host "Default Admin Login:" -ForegroundColor Yellow
Write-Host "  Email: admin@artgallery.com" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
