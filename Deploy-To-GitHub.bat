@echo off
title Deploying Math Whiteboard to GitHub...
echo ======================================================
echo    Math Whiteboard - One-Click GitHub Deployment
echo ======================================================
echo.
cd /d "%~dp0"

echo [1/3] Building production bundle with Vite...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed! Please check the error messages above.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Adding changes and committing...
if not exist ".git" (
    echo Initializing Git repository...
    git init
    git branch -M main
    git remote add origin https://github.com/gangalapudibhasker/Math-Board.git
)
git config http.postBuffer 524288000
git add .
git commit -m "Deploy latest math board with smooth pen nib fixes"

echo.
echo [3/3] Syncing and pushing to GitHub (main branch)...
git pull --rebase origin main
git push origin main
if %errorlevel% neq 0 (
    echo.
    echo [NOTE] If push fails, check your internet connection or GitHub login.
    pause
    exit /b %errorlevel%
)

echo.
echo ======================================================
echo    SUCCESS! Code pushed to GitHub.
echo.
echo    Your GitHub Actions workflow will now build and
echo    deploy automatically to:
echo    https://gangalapudibhasker.github.io/Math-Board/
echo ======================================================
echo.
pause
