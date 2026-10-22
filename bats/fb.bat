@echo off
setlocal
cd /d "%~dp0.."

REM Kill melee, rebuild, then launch Fox vs Bowser.
taskkill /F /T /IM melee.exe >nul 2>&1
if errorlevel 1 (
    echo melee.exe is not running.
) else (
    echo Stopped melee.exe.
)

call :wait_until_gone
if errorlevel 1 (
    echo melee.exe is still running. Build skipped.
    exit /b 1
)

echo Building melee...
ninja -C build melee
if errorlevel 1 (
    echo Build failed.
    exit /b 1
)

echo Starting Fox vs Bowser...
call "%~dp0fox-vs-bowser.bat"
exit /b %errorlevel%

:wait_until_gone
for /L %%i in (1,1,30) do (
    tasklist /FI "IMAGENAME eq melee.exe" 2>nul | findstr /I /C:"melee.exe" >nul
    if errorlevel 1 exit /b 0
    ping -n 2 127.0.0.1 >nul
)
exit /b 1
