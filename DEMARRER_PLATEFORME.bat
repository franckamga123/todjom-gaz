@echo off
echo ==========================================
4: echo   DEMARRAGE DE LA PLATEFORME TODJOM GAZ
5: echo ==========================================
6: echo.
7: 
8: echo [1/2] Demarrage du BACKEND (Port 3000)...
9: start cmd /k "cd /d c:\xampp\TODJOM GAZ\backend && npm run dev"
10: 
11: echo [2/2] Demarrage du FRONTEND ADMIN (Port 5000)...
12: start cmd /k "cd /d c:\xampp\TODJOM GAZ\admin && npm run dev"
13: 
14: echo.
15: echo ==========================================
16: echo   SERVEURS EN COURS DE LANCEMENT !
17: echo   Admin : http://localhost:5000
18: echo   API   : http://localhost:3000
19: echo ==========================================
20: echo.
21: echo NOTE : Assurez-vous que MySQL est "START" dans XAMPP.
22: pause
