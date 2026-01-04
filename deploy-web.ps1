#!/usr/bin/env pwsh
# Quick deploy script for Firebase Hosting

Write-Host "`n🏗️  Building Expo web app..." -ForegroundColor Cyan
npx expo export --platform web

if ($LASTEXITCODE -ne 0) {
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
