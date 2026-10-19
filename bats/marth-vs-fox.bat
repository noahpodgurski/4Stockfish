@echo off
setlocal
cd /d "%~dp0..\build"

REM Marth (you) vs a Bowser CPU on Final Destination, 4 stocks.
REM The debug match already starts on Final Destination.
set MELEE_BOOT_SCENE=vs
set MELEE_DEBUG_VS=cpu
set MELEE_DEBUG_VS_P1=marth
set MELEE_DEBUG_VS_P2=fox
set MELEE_DEBUG_VS_STOCKS=4

set "DISC=%~dp0..\..\Super Smash Bros. Melee (v1.02).iso"

if not exist "melee.exe" (
    echo melee.exe was not found in "%cd%".
    echo Build the game, then run this again.
    pause
    exit /b 1
)
if not exist "%DISC%" (
    echo Disc image was not found:
    echo "%DISC%"
    pause
    exit /b 1
)

start "" "melee.exe" "%DISC%"
