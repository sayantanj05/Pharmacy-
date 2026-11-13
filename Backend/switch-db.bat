@echo off
echo Switching MongoDB connection...
echo.

if /I "%~1"=="college" goto college
if /I "%~1"=="home" goto home

echo Usage: switch-db.bat [home^|college]
pause
exit /b 1

:college
echo Setting to LOCAL MongoDB (College) - Compass
powershell -Command "$lines = Get-Content .env; $lines = $lines -replace '^MONGODB_URI=.*', 'MONGODB_URI=mongodb://localhost:27017/Pharmacy'; Set-Content -Path .env -Value $lines -Encoding ASCII"
goto success

:home
echo Setting to ATLAS MongoDB (Home)
powershell -Command "$lines = Get-Content .env; $lines = $lines -replace '^MONGODB_URI=.*', 'MONGODB_URI=mongodb+srv://goandstudyadmin:goandstudyadmin@goandstudycluster.4jz25t7.mongodb.net/?appName=goandstudycluster'; Set-Content -Path .env -Value $lines -Encoding ASCII"
goto success

:success
echo.
echo MongoDB connection switched successfully!
echo.
pause
