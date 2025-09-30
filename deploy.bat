@echo off
REM SSM Technologies Frontend Deployment Script for Windows
REM Usage: deploy.bat [production|staging]

setlocal enabledelayedexpansion

REM Configuration
set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production
set BUILD_DIR=dist
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set BACKUP_DIR=backup_%YYYY%%MM%%DD%_%HH%%Min%%Sec%

echo 🚀 Starting deployment for %ENVIRONMENT% environment...

REM Check if Node.js and npm are installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm ci --production=false
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

REM Run linting
echo 🔍 Running code quality checks...
call npm run lint
if %errorlevel% neq 0 (
    echo ⚠️  Linting issues found, but continuing...
)

REM Create backup of existing build (if exists)
if exist "%BUILD_DIR%" (
    echo 💾 Creating backup of existing build...
    move "%BUILD_DIR%" "%BACKUP_DIR%"
)

REM Build for production
echo 🏗️  Building application for %ENVIRONMENT%...
if "%ENVIRONMENT%"=="production" (
    call npm run build:prod
) else if "%ENVIRONMENT%"=="staging" (
    call npm run build:staging
) else (
    call npm run build
)

if %errorlevel% neq 0 (
    echo ❌ Build failed! Restoring backup...
    if exist "%BACKUP_DIR%" (
        move "%BACKUP_DIR%" "%BUILD_DIR%"
    )
    exit /b 1
)

REM Verify build was successful
if not exist "%BUILD_DIR%" (
    echo ❌ Build directory not found! Build may have failed.
    if exist "%BACKUP_DIR%" (
        move "%BACKUP_DIR%" "%BUILD_DIR%"
    )
    exit /b 1
)

echo ✅ Build completed successfully!

REM Optional: Copy to web server directory
REM Uncomment and modify the path below for your server setup
REM set WEB_ROOT=C:\inetpub\wwwroot\ssm-technologies
REM if exist "%WEB_ROOT%" (
REM     echo 📁 Copying files to web server...
REM     xcopy /E /I /Y "%BUILD_DIR%\*" "%WEB_ROOT%\"
REM     echo ✅ Files copied to %WEB_ROOT%
REM )

REM Clean up old backups (keep only last 5)
echo 🧹 Cleaning up old backups...
for /f "skip=5 delims=" %%i in ('dir /b /o-d backup_* 2^>nul') do (
    rmdir /s /q "%%i" 2>nul
)

echo 🎉 Deployment completed successfully!
echo 📁 Build files are in: %BUILD_DIR%
echo 💡 To serve locally, run: npm run preview:prod

pause