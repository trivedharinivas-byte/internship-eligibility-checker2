@echo off
title Internship Eligibility Checker
echo ========================================================
echo   Starting Internship Eligibility Checker Application
echo ========================================================
echo.

set "JAVA_HOME=C:\Users\sanja\.jdks\openjdk-26.0.2.1"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo Using Java: %JAVA_HOME%
"%JAVA_HOME%\bin\java.exe" -version
echo.

if exist "backend\target\internship-eligibility-checker-1.0.0.jar" (
    echo Launching packaged backend JAR...
    "%JAVA_HOME%\bin\java.exe" -jar "backend\target\internship-eligibility-checker-1.0.0.jar"
) else (
    echo Building and running backend with Maven...
    cd backend
    "C:\Program Files\JetBrains\IntelliJ IDEA 2026.2.1\plugins\maven-plugin\lib\maven3\bin\mvn.cmd" spring-boot:run
)

pause
