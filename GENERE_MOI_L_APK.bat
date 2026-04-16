@echo off
echo ==========================================
echo   GENERATION DE L'APK TODJOM GAZ
echo ==========================================
echo.
cd /d "c:\xampp\TODJOM GAZ\mobile_client"
echo Nettoyage...
call flutter clean
echo.
echo Recuperation des dependances...
call flutter pub get
echo.
echo Compilation de l'APK (Mode Release)...
call flutter build apk --split-per-abi --target-platform android-arm,android-arm64,android-x64
echo.
echo ==========================================
echo   TERMINE !
echo   L'APK se trouve dans : 
echo   build\app\outputs\flutter-apk\
echo ==========================================
pause
