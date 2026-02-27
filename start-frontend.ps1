# Start Frontend React Server
Set-Location "C:\Users\bitra\OneDrive\APPS\ArtGallery1\client"
$env:BROWSER = 'none'
Write-Host "`nStarting React Development Server..." -ForegroundColor Cyan
Write-Host "Location: $(Get-Location)" -ForegroundColor Yellow
npm start
