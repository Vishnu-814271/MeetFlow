@echo off
title MeetFlow - Starting...
echo ============================================
echo    MEET-FLOW - Event Coordination App
echo ============================================
echo.

:: Check Java
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java is not installed or not in PATH.
    echo         Please install Java 21: https://adoptium.net/
    pause
    exit /b 1
)

:: Check Node
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo         Please install Node.js 18+: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/3] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
)
cd ..

echo.
echo [2/3] Starting Backend (Spring Boot on port 8081)...
cd backend
start "MeetFlow Backend" cmd /k "mvnw.cmd spring-boot:run \"-Dspring-boot.run.profiles=dev\""
cd ..

echo.
echo [3/3] Starting Frontend (Vite on port 5173)...
cd frontend
start "MeetFlow Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ============================================
echo  MeetFlow is starting up!
echo.
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:8081
echo  Swagger:  http://localhost:8081/swagger-ui.html
echo  H2 DB:    http://localhost:8081/h2-console
echo ============================================
echo.
echo  (Backend takes ~15-30 seconds to compile and start)
echo  Close both terminal windows to stop the app.
echo.
pause
