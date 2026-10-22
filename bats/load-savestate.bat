@echo off
setlocal
REM Load the match saved with Ctrl+S.
REM Writes land in melee-pc\savestates\: latest.msv, plus state_YYYYMMDDTHHMMSS.msv.
REM Pass another .msv to load that file instead of latest.msv.
REM
REM The boot match below only has to reach the fight. The file then replaces
REM it, so this setup should be the same kind of match you saved (debug VS).

if "%~1"=="" (
    set "STATE=%~dp0..\savestates\latest.msv"
) else (
    set "STATE=%~f1"
)

cd /d "%~dp0..\build"

set MELEE_BOOT_SCENE=vs
set MELEE_DEBUG_VS=cpu
set MELEE_DEBUG_VS_P1=marth
set MELEE_DEBUG_VS_P2=fox
set MELEE_DEBUG_VS_STOCKS=4
set MELEE_SAVESTATE=%STATE%

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
if not exist "%STATE%" (
    echo Savestate was not found:
    echo "%STATE%"
    echo Get into a match and press Ctrl+S first.
    pause
    exit /b 1
)

start "" "melee.exe" "%DISC%"
