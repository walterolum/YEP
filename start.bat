@echo off
REM ============================================================================
REM YEP (Youth Empowerment Project) — single development launcher
REM Starts the Spring Boot API and the Vite frontend in separate windows.
REM Requirements: Java 21, Node.js 20.19+, MySQL 8 with the YEP schema imported.
REM ============================================================================
setlocal
cd /d "%~dp0"

echo Starting YEP backend (http://localhost:8080) ...
start "YEP backend" cmd /k "cd /d "%~dp0backend" && mvnw.cmd spring-boot:run"

echo Starting YEP frontend (http://localhost:5173) ...
start "YEP frontend" cmd /k "cd /d "%~dp0" && npm run dev"

echo.
echo Database connection is read from DB_URL, DB_USERNAME and DB_PASSWORD.
echo Demo data: SPRING_PROFILES_ACTIVE=local,demo
echo.
endlocal
