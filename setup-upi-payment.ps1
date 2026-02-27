# Setup UPI Payment System for Art Gallery
Write-Host "🎨 Initializing UPI QR Code Payment System..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Initialize Database
Write-Host "📊 Step 1: Setting up database..." -ForegroundColor Yellow
node server/database/init-upi-payment-db.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database initialized successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Database initialization failed" -ForegroundColor Red
    Write-Host "Please check your database credentials in .env file" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🎉 UPI Payment System Setup Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 System Overview:" -ForegroundColor Yellow
Write-Host ""
Write-Host "✨ Features Enabled:" -ForegroundColor White
Write-Host "   ✅ Artist UPI Setup & Verification" -ForegroundColor Gray
Write-Host "   ✅ QR Code Payment Display" -ForegroundColor Gray
Write-Host "   ✅ Payment Screenshot Upload" -ForegroundColor Gray
Write-Host "   ✅ Admin Verification Dashboard" -ForegroundColor Gray
Write-Host "   ✅ Full Audit Trail" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 New Routes Added:" -ForegroundColor White
Write-Host "   Artist:   /artist/upi-setup" -ForegroundColor Gray
Write-Host "   Customer: /qr-payment" -ForegroundColor Gray
Write-Host "   Admin:    /admin/payments" -ForegroundColor Gray
Write-Host ""
Write-Host "📊 Database Tables Created:" -ForegroundColor White
Write-Host "   • payment_screenshots" -ForegroundColor Gray
Write-Host "   • artist_upi_requests" -ForegroundColor Gray
Write-Host "   • upi_verification_history" -ForegroundColor Gray
Write-Host "   • users (UPI fields added)" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Start Backend Server:" -ForegroundColor White
Write-Host "   cd server" -ForegroundColor Gray
Write-Host "   node server.js" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start Frontend:" -ForegroundColor White
Write-Host "   cd client" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Artist Setup (First Time):" -ForegroundColor White
Write-Host "   • Login as artist" -ForegroundColor Gray
Write-Host "   • Navigate to /artist/upi-setup" -ForegroundColor Gray
Write-Host "   • Enter UPI ID and upload QR code" -ForegroundColor Gray
Write-Host "   • Wait for admin approval" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Admin Verification:" -ForegroundColor White
Write-Host "   • Login as admin" -ForegroundColor Gray
Write-Host "   • Navigate to /admin/payments" -ForegroundColor Gray
Write-Host "   • Review and approve UPI requests" -ForegroundColor Gray
Write-Host "   • Verify customer payments" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor White
Write-Host "   Read: UPI_PAYMENT_SYSTEM_GUIDE.md" -ForegroundColor Gray
Write-Host ""
Write-Host "💳 Supported UPI Apps:" -ForegroundColor White
Write-Host "   • PhonePe" -ForegroundColor Gray
Write-Host "   • Google Pay" -ForegroundColor Gray
Write-Host "   • Paytm" -ForegroundColor Gray
Write-Host "   • BHIM & All UPI Apps" -ForegroundColor Gray
Write-Host ""
Write-Host "🔐 Security Features:" -ForegroundColor White
Write-Host "   • Admin verification required" -ForegroundColor Gray
Write-Host "   • Transaction ID validation" -ForegroundColor Gray
Write-Host "   • Payment screenshot review" -ForegroundColor Gray
Write-Host "   • Full audit trail" -ForegroundColor Gray
Write-Host ""
Write-Host "✨ Happy Selling! 🎨💰" -ForegroundColor Cyan
Write-Host ""
