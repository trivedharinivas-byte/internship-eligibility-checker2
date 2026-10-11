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

if exist "target\internship-eligibility-checker-1.0.0.jar" (
    echo Launching packaged JAR...
    "%JAVA_HOME%\bin\java.exe" -jar "target\internship-eligibility-checker-1.0.0.jar"
) else (
    echo Building and running with Maven...
    "C:\Program Files\JetBrains\IntelliJ IDEA 2026.2.1\plugins\maven-plugin\lib\maven3\bin\mvn.cmd" spring-boot:run
)

pause
