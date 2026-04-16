@echo off
echo ============================================
echo    TODJOM GAZ - Espace Fournisseur
echo ============================================
echo.

cd /d "%~dp0"
echo [1/2] Installation des dependances npm...
call npm install
echo.

echo [2/2] Demarrage du serveur de developpement...
echo    Interface fournisseur sur http://localhost:5174
echo.
echo    Compte test:
echo    Email: contact@nigergaz.ne
echo    MDP:   fournisseur123
echo.
call npm run dev
