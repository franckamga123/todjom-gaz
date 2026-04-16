@echo off
echo ==========================================
echo   DEMARRAGE DE TODJOM GAZ PLATFORM
echo ==========================================
echo.

echo [0/3] Nettoyage des anciens processus...
taskkill /F /IM node.exe /T >nul 2>&1
echo OK.

echo [1/3] Demarrage du BACKEND (Port 3000)...
start "BACKEND" cmd /k "cd /d c:\xampp\TODJOM GAZ\backend && npm run dev"

timeout /t 3 /nobreak > nul

echo [2/3] Demarrage de l'ADMIN (Port 5173)...
start "ADMIN" cmd /k "cd /d c:\xampp\TODJOM GAZ\admin && npm run dev"

echo [3/3] Demarrage du FOURNISSEUR (Port 5300)...
start "FOURNISSEUR" cmd /k "cd /d c:\xampp\TODJOM GAZ\supplier && npm run dev"

echo.
echo ==========================================
echo   TOUT EST EN COURS DE LANCEMENT !
echo.
echo   - Admin      : http://localhost:5173
echo   - Fournisseur: http://localhost:5300
echo   - API Backend: http://localhost:3000
echo ==========================================
echo.
echo Gardez les fenetres noires ouvertes pour que les sites fonctionnent.
pause
