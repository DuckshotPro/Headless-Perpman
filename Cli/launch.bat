@echo off
REM ====================================================================================================
REM MCP PERPLEXITY CLIENT - WINDOWS LAUNCHER
REM ====================================================================================================
REM
REM This batch file provides convenient shortcuts for common operations.
REM Edit the configuration section below to set your preferences.
REM
REM ====================================================================================================

SETLOCAL EnableDelayedExpansion

REM ====================================================================================================
REM CONFIGURATION - EDIT THESE VALUES
REM ====================================================================================================

SET PERPLEXITY_EMAIL=your@example.com
SET CHROME_USER_DATA=C:\Users\432du\AppData\Local\Google\Chrome\User Data
SET OUTPUT_DIR=.\exports
SET PORT=3000

REM ====================================================================================================
REM SCRIPT START - DO NOT EDIT BELOW THIS LINE
REM ====================================================================================================

ECHO.
ECHO ╔════════════════════════════════════════════════════════════════════╗
ECHO ║       MCP PERPLEXITY CLIENT - WINDOWS LAUNCHER                     ║
ECHO ╚════════════════════════════════════════════════════════════════════╝
ECHO.

REM Check if Node.js is installed
where node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    ECHO ❌ ERROR: Node.js is not installed or not in PATH
    ECHO.
    ECHO Please install Node.js from https://nodejs.org/
    PAUSE
    EXIT /B 1
)

REM Check if project is built
IF NOT EXIST "dist\cli.js" (
    ECHO ⚠️  Project not built. Running build...
    CALL npm run build
    IF %ERRORLEVEL% NEQ 0 (
        ECHO ❌ Build failed. Please check for errors.
        PAUSE
        EXIT /B 1
    )
)

REM Display menu
:MENU
ECHO.
ECHO Please select an option:
ECHO.
ECHO 1. Interactive Mode (manual browser control)
ECHO 2. Export Conversations (with email login)
ECHO 3. Export Conversations (using Chrome session - RECOMMENDED)
ECHO 4. Start API Server
ECHO 5. Export in Headless Mode (requires Chrome session)
ECHO 6. Show Help
ECHO 7. Configure Settings
ECHO 8. View Recent Exports
ECHO 9. Exit
ECHO.

SET /P CHOICE="Enter your choice (1-9): "

IF "%CHOICE%"=="1" GOTO INTERACTIVE
IF "%CHOICE%"=="2" GOTO EXPORT_EMAIL
IF "%CHOICE%"=="3" GOTO EXPORT_SESSION
IF "%CHOICE%"=="4" GOTO SERVER
IF "%CHOICE%"=="5" GOTO HEADLESS
IF "%CHOICE%"=="6" GOTO HELP
IF "%CHOICE%"=="7" GOTO CONFIGURE
IF "%CHOICE%"=="8" GOTO VIEW_EXPORTS
IF "%CHOICE%"=="9" GOTO END

ECHO Invalid choice. Please try again.
GOTO MENU

REM ====================================================================================================
REM MODE HANDLERS
REM ====================================================================================================

:INTERACTIVE
ECHO.
ECHO 🚀 Starting Interactive Mode...
ECHO.
node mcp-perplexity-client.js --mode=interactive --email=%PERPLEXITY_EMAIL%
PAUSE
GOTO MENU

:EXPORT_EMAIL
ECHO.
ECHO 💾 Starting Export Mode (Email Login)...
ECHO ⚠️  You will need to enter OTP code from your email
ECHO.
node mcp-perplexity-client.js --mode=export --email=%PERPLEXITY_EMAIL% --output=%OUTPUT_DIR%
PAUSE
GOTO MENU

:EXPORT_SESSION
ECHO.
ECHO 💾 Starting Export Mode (Chrome Session)...
ECHO 📁 Using Chrome profile: %CHROME_USER_DATA%
ECHO.
ECHO ⚠️  IMPORTANT: Make sure Chrome is closed before proceeding!
PAUSE
node mcp-perplexity-client.js --mode=export --email=%PERPLEXITY_EMAIL% --output=%OUTPUT_DIR% --user-data-dir="%CHROME_USER_DATA%"
PAUSE
GOTO MENU

:SERVER
ECHO.
ECHO 🌐 Starting API Server...
ECHO 📡 Server will be available at: http://localhost:%PORT%
ECHO.
ECHO Press Ctrl+C to stop the server
ECHO.
node mcp-perplexity-client.js --mode=server --port=%PORT%
PAUSE
GOTO MENU

:HEADLESS
ECHO.
ECHO 🤖 Starting Headless Export Mode...
ECHO 📁 Using Chrome profile: %CHROME_USER_DATA%
ECHO.
ECHO ⚠️  IMPORTANT: Make sure Chrome is closed before proceeding!
PAUSE
node mcp-perplexity-client.js --mode=export --email=%PERPLEXITY_EMAIL% --output=%OUTPUT_DIR% --user-data-dir="%CHROME_USER_DATA%" --headless
PAUSE
GOTO MENU

:HELP
ECHO.
node mcp-perplexity-client.js --help
PAUSE
GOTO MENU

:CONFIGURE
ECHO.
ECHO ╔════════════════════════════════════════════════════════════════════╗
ECHO ║                    CONFIGURATION EDITOR                            ║
ECHO ╚════════════════════════════════════════════════════════════════════╝
ECHO.
ECHO Current Settings:
ECHO.
ECHO 1. Email: %PERPLEXITY_EMAIL%
ECHO 2. Chrome User Data: %CHROME_USER_DATA%
ECHO 3. Output Directory: %OUTPUT_DIR%
ECHO 4. Server Port: %PORT%
ECHO.
ECHO To change settings, edit this file (launch.bat) in a text editor.
ECHO Look for the CONFIGURATION section at the top of the file.
ECHO.
PAUSE
GOTO MENU

:VIEW_EXPORTS
ECHO.
ECHO 📂 Recent Exports:
ECHO.
IF NOT EXIST "%OUTPUT_DIR%" (
    ECHO No exports found. Run an export first.
) ELSE (
    DIR /B /O-D "%OUTPUT_DIR%\*.md" 2>nul | MORE
    IF %ERRORLEVEL% NEQ 0 (
        ECHO No markdown files found in %OUTPUT_DIR%
    )
)
ECHO.
PAUSE
GOTO MENU

:END
ECHO.
ECHO 👋 Goodbye!
ECHO.
EXIT /B 0
