@echo off
echo ===========================================
echo   TODJOM GAZ - REPARATION COMPLETE
echo ===========================================
echo.

echo [1/4] Nettoyage des processus existants...
taskkill /F /IM node.exe /T >nul 2>&1
echo OK.

echo.
echo [2/4] Verification et Installation des dependances...
echo.
echo --> Backend...
cd /d "c:\xampp\TODJOM GAZ\backend"
call npm install
echo.
echo --> Admin...
cd /d "c:\xampp\TODJOM GAZ\admin"
call npm install
echo.
echo --> Fournisseur...
cd /d "c:\xampp\TODJOM GAZ\supplier"
call npm install

echo.
echo [3/4] Test de la base de donnees (XAMPP doit etre lance !)...
"C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS todjom_gaz;" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ATTENTION] Impossible de se connecter a MySQL. Verifiez XAMPP !
) else (
    echo Connexion MySQL OK.
)

echo.
echo [4/4] Demarrage des serveurs...
cd /d "c:\xampp\TODJOM GAZ"
call LANCE_TOUT.bat

pause
