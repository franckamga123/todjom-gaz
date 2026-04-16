@echo off
echo ============================================
echo    TODJOM GAZ - Installation Backend
echo ============================================
echo.

REM Installer les dépendances Node.js
echo [1/3] Installation des dependances npm...
cd /d "%~dp0"
call npm install
echo.

REM Creer la base de donnees MySQL
echo [2/3] Creation de la base de donnees MySQL...
"C:\xampp\mysql\bin\mysql.exe" -u root < database\schema.sql
echo    Base 'todjom_gaz' creee avec succes !
echo.

REM Seeder la base avec les donnees de test
echo [3/3] Insertion des donnees de test...
call node src\database\seed.js
echo.

echo ============================================
echo    Installation terminee !
echo.
echo    Pour demarrer le serveur :
echo    npm run dev
echo.
echo    API disponible sur http://localhost:3000
echo ============================================
pause
