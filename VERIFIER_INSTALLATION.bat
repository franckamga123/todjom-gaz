@echo off
setlocal
echo ===========================================
echo   TODJOM GAZ - DIAGNOSTIC SYSTEME
echo ===========================================
echo.

echo [1] Verification de Node.js...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installe !
) else (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
    echo OK : Node.js %NODE_VER% detecte.
)

echo.
echo [2] Verification de Git...
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Git n'est pas installe (Optionnel).
) else (
    echo OK : Git detecte.
)

echo.
echo [3] Verification de MySQL (XAMPP)...
if exist "C:\xampp\mysql\bin\mysql.exe" (
    echo OK : Chemin MySQL trouve.
    echo Tentative de connexion...
    "C:\xampp\mysql\bin\mysql.exe" -u root -e "select 1;" >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] MySQL est eteint ! Allumez MySQL dans XAMPP Control Panel.
    ) else (
        echo OK : Connexion MySQL reussie.
    )
) else (
    echo [ERREUR] XAMPP n'est pas installe dans C:\xampp.
)

echo.
echo [4] Verifications des ports locaux...
echo Verification du port 3000 (Backend)...
netstat -ano | findstr :3000 >nul 2>&1
if %ERRORLEVEL% EQU 0 ( echo [ATTENTION] Le port 3000 est deja utilise ! ) else ( echo OK : Port 3000 libre. )

echo Verification du port 5173 (Admin)...
netstat -ano | findstr :5173 >nul 2>&1
if %ERRORLEVEL% EQU 0 ( echo [ATTENTION] Le port 5173 est deja utilise ! ) else ( echo OK : Port 5173 libre. )

echo Verification du port 5300 (Fournisseur)...
netstat -ano | findstr :5300 >nul 2>&1
if %ERRORLEVEL% EQU 0 ( echo [ATTENTION] Le port 5300 est deja utilise ! ) else ( echo OK : Port 5300 libre. )

echo.
echo ===========================================
echo   CONSEIL : Lancez 'REPARE_MOI.bat' si 
echo   des ports sont marques en 'ATTENTION'.
echo ===========================================
pause
