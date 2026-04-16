# Script de Build Automatisé pour TODJOM GAZ
Write-Host "Debut de la preparation du build Android..." -ForegroundColor Cyan

# 1. Nettoyage
Write-Host "Nettoyage du projet..."
flutter clean

# 2. Dépendances
Write-Host "Recuperation des packages..."
flutter pub get

# 3. Build APK
Write-Host "Compilation de l APK (Mode Release)..."
flutter build apk --release

if ($LASTEXITCODE -eq 0) {
    Write-Host "Termine ! L APK se trouve dans : build/app/outputs/flutter-apk/app-release.apk" -ForegroundColor Green
} else {
    Write-Host "Erreur lors du build." -ForegroundColor Red
}
