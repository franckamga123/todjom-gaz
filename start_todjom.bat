@echo off
title TODJOM GAZ - Master Launcher
echo ==========================================
echo    TODJOM GAZ - STITCH UI ECOSYSTEM
echo ==========================================
echo.
echo [1/6] Lancement du BACKEND (Port 3000)...
start "TODJOM_BACKEND" cmd /k "cd backend && npm run dev"

echo [2/6] Lancement de l'ADMIN (Port 5173)...
start "TODJOM_ADMIN" cmd /k "cd admin && npm run dev"

echo [3/6] Lancement du CLIENT (Port 8080)...
start "TODJOM_CLIENT" cmd /k "cd client && npm run dev"

echo [4/6] Lancement du LIVREUR (Port 8081)...
start "TODJOM_DELIVERY" cmd /k "cd delivery && npm run dev"

echo [5/6] Lancement du DEPOT (Port 8082)...
start "TODJOM_DISTRIBUTOR" cmd /k "cd distributor && npm run dev"

echo [6/6] Lancement du HUB FOURNISSEUR (Port 5174)...
start "TODJOM_SUPPLIER" cmd /k "cd supplier && npm run dev"

echo.
echo ==========================================
echo SERVICES LANCES AVEC SUCCES !
echo Accédez au Portail: portal/index.html
echo ==========================================
pause
