@echo off
echo ========================================
echo Voice Bot QA Analysis System - Setup
echo ========================================
echo.

echo Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Failed to install root dependencies
    pause
    exit /b 1
)

echo.
echo Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo Failed to install server dependencies
    pause
    exit /b 1
)

echo.
echo Installing client dependencies...
cd ..\client
call npm install
if %errorlevel% neq 0 (
    echo Failed to install client dependencies
    pause
    exit /b 1
)

cd ..
echo.
echo ========================================
echo Installation completed successfully!
echo ========================================
echo.
echo To start the application:
echo   npm run dev
echo.
echo Or start components separately:
echo   Backend:  cd server && npm run dev
echo   Frontend: cd client && npm start
echo.
echo The application will be available at:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo.
pause