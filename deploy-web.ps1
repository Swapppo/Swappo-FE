#!/usr/bin/env pwsh
# Quick deploy script for Firebase Hosting

Write-Host "`n🏗️  Building Expo web app for production..." -ForegroundColor Cyan

# Temporarily rename .env.local to avoid conflicts with production build
$envLocalExists = Test-Path ".env.local"
if ($envLocalExists) {
    Write-Host "📦 Temporarily moving .env.local..." -ForegroundColor Yellow
    Rename-Item ".env.local" ".env.local.backup" -ErrorAction SilentlyContinue
}

npx expo export --platform web

# Capture the build exit code
$buildExitCode = $LASTEXITCODE

# Restore .env.local
if ($envLocalExists) {
    Write-Host "📦 Restoring .env.local..." -ForegroundColor Yellow
    Rename-Item ".env.local.backup" ".env.local" -ErrorAction SilentlyContinue
}

# Check if build failed
if ($buildExitCode -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n🚀 Deploying to Firebase..." -ForegroundColor Cyan
firebase deploy --only hosting

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
    Write-Host "Opening Firebase console..." -ForegroundColor Cyan
    firebase open hosting:site
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}
