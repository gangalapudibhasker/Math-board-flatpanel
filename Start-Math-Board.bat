@echo off
title Starting Math Whiteboard...
echo ======================================================
echo    Starting Math Whiteboard for Classroom / Panel
echo ======================================================
echo.
cd /d "%~dp0"

echo Opening browser at http://localhost:3000 ...
start http://localhost:3000

echo Starting local server...
npm run dev
pause
