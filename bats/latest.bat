@echo off
setlocal
REM Open the savestate written by Z or Ctrl+S (savestates\latest.msv).
REM The fight below only has to reach VS. The file then replaces it.

cd /d "%~dp0..\build"

set MELEE_BOOT_SCENE=vs
set MELEE_DEBUG_VS=cpu
set MELEE_DEBUG_VS_P1=fox
set MELEE_DEBUG_VS_P2=bowser
set MELEE_DEBUG_VS_STOCKS=4
set "MELEE_SAVESTATE=%~dp0..\savestates\latest.msv"

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
if not exist "%MELEE_SAVESTATE%" (
    echo Savestate was not found:
    echo "%MELEE_SAVESTATE%"
    echo Pause in a match and press Z or Ctrl+S first.
    pause
    exit /b 1
)

start "" "melee.exe" "%DISC%"
