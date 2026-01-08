# ================================
# دوائي - Quick Start Script (PowerShell)
# ================================

Write-Host "🚀 Starting Duaiii Setup..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18 or higher." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm -v
    Write-Host "✅ npm $npmVersion detected" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Check if .env.local exists
if (-Not (Test-Path .env.local)) {
    Write-Host "⚠️  .env.local not found. Copying from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env.local
    Write-Host "⚠️  Please edit .env.local with your actual values before running the app." -ForegroundColor Yellow
}

# Database setup reminder
Write-Host ""
Write-Host "📊 Database setup (optional)..." -ForegroundColor Yellow
Write-Host "Remember to run SQL scripts in Supabase SQL Editor:" -ForegroundColor Cyan
Write-Host "  1. scripts/001_initial_schema.sql" -ForegroundColor Cyan
Write-Host "  2. scripts/021_add_pwa_analytics.sql" -ForegroundColor Cyan
Write-Host ""

# Build the app
Write-Host "🏗️  Building application..." -ForegroundColor Yellow
npm run build

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 To start the development server:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🐳 To start with Docker:" -ForegroundColor Cyan
Write-Host "   docker-compose up" -ForegroundColor White
Write-Host ""
Write-Host "📖 Read README.md for more information" -ForegroundColor Cyan
