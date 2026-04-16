@echo off
echo ============================================
echo    TODJOM GAZ - Installation Admin Panel
echo ============================================
echo.

cd /d "%~dp0"
echo [1/2] Installation des dependances npm...
call npm install
echo.

echo [2/2] Demarrage du serveur de developpement...
echo    Admin panel disponible sur http://localhost:5173
echo.
call npm run dev
