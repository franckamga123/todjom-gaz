@echo off
TITLE TODJOM GAZ - Lancement de la Plateforme Complete
COLOR 0B

echo ========================================================
echo        TODJOM GAZ - INITIALISATION DU SYSTEME
echo ========================================================
echo.

:: ---- Liberer les ports avant de lancer ----
echo [0/5] Liberation des ports en cours...

:: Tuer les processus sur port 3000 (Backend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 " 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)

:: Tuer les processus sur port 5173 (Admin)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173 " 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)

:: Tuer les processus sur port 5300 (Supplier)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5300 " 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)

:: Tuer les processus sur port 5000 (Portal)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000 " 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo   [OK] Ports liberes (3000, 5173, 5300, 5000)
timeout /t 2 >NUL

:: ---- Verifier MySQL ----
echo [1/5] Verification de MySQL...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I "mysqld.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo   [OK] MySQL est deja en cours d'execution.
) else (
    echo   [!] MySQL non detecte. Lancement via XAMPP...
    start /min "" "C:\xampp\mysql\bin\mysqld.exe"
    timeout /t 5 >NUL
)

:: ---- Lancer le Backend ----
echo [2/5] Lancement du SERVEUR BACKEND (Port 3000)...
cd backend
start "TODJOM-BACKEND" cmd /k "npm run dev"
cd ..
timeout /t 4 >NUL

:: ---- Lancer l'Admin Dashboard ----
echo [3/5] Lancement de l'ADMIN DASHBOARD (Port 5173)...
cd admin
start "TODJOM-ADMIN" cmd /k "npm run dev"
cd ..

:: ---- Lancer le Supplier Dashboard ----
echo [4/5] Lancement du PORTAIL FOURNISSEUR (Port 5300)...
cd supplier
start "TODJOM-SUPPLIER" cmd /k "npm run dev"
cd ..

:: ---- Lancer le Portail Unifie ----
echo [5/5] Lancement du PORTAIL UNIFIE (Port 5000)...
cd portal
start "TODJOM-PORTAL" cmd /k "node server.js"
cd ..

echo.
echo ========================================================
echo              TODJOM GAZ - SERVICES ACTIFS
echo ========================================================
echo.
echo   [LOGIN]    http://localhost:5000          <-- COMMENCER ICI
echo   [ADMIN]    http://localhost:5173
echo   [MARQUES]  http://localhost:5300
echo   [API]      http://localhost:3000
echo.
echo   Mot de passe par defaut : Todjom2024!
echo ========================================================

timeout /t 8 >NUL

:: Ouvrir uniquement le portail
start http://localhost:5000

echo.
echo [OK] Navigateur ouvert sur le portail de connexion.
echo [!] Ne fermez pas les fenetres en arriere-plan.
echo.
pause
