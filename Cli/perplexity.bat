@echo off
REM ========================================================================================================
REM PERPLEXITY CLI - Setup and Launcher
REM ========================================================================================================

SETLOCAL EnableDelayedExpansion

ECHO.
ECHO ╔════════════════════════════════════════════════════════════════╗
ECHO ║           PERPLEXITY CLI - Setup ^& Launcher                   ║
ECHO ╚════════════════════════════════════════════════════════════════╝
ECHO.

REM Check if Node.js is installed
where node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    ECHO ❌ ERROR: Node.js is not installed
    ECHO Please install Node.js from https://nodejs.org/
    PAUSE
    EXIT /B 1
)

REM Check if API key is set
IF "%PERPLEXITY_API_KEY%"=="" (
    IF NOT EXIST ".env" (
        ECHO ⚠️  API Key Not Found!
        ECHO.
        ECHO Please set your Perplexity API key:
        ECHO   1. Get key from: https://www.perplexity.ai/settings/api
        ECHO   2. Option A: set PERPLEXITY_API_KEY=your-key-here
        ECHO   3. Option B: Create .env file with: PERPLEXITY_API_KEY=your-key-here
        ECHO.
        SET /P SETUP_KEY="Would you like to create .env file now? (y/n): "
        IF /I "!SETUP_KEY!"=="y" (
            SET /P API_KEY="Enter your Perplexity API key: "
            ECHO PERPLEXITY_API_KEY=!API_KEY!> .env
            ECHO ✅ API key saved to .env file
            ECHO.
        ) ELSE (
            ECHO.
            ECHO Please set API key and run again.
            PAUSE
            EXIT /B 1
        )
    )
)

:MENU
CLS
ECHO.
ECHO ╔════════════════════════════════════════════════════════════════╗
ECHO ║           PERPLEXITY CLI - Main Menu                          ║
ECHO ╚════════════════════════════════════════════════════════════════╝
ECHO.
ECHO 1. Interactive Chat Mode (recommended)
ECHO 2. Quick Query (one-shot)
ECHO 3. Change Model
ECHO 4. Test Connection
ECHO 5. View Help
ECHO 6. Setup API Key
ECHO 7. Exit
ECHO.

SET /P CHOICE="Enter your choice (1-7): "

IF "%CHOICE%"=="1" GOTO CHAT
IF "%CHOICE%"=="2" GOTO QUERY
IF "%CHOICE%"=="3" GOTO MODEL
IF "%CHOICE%"=="4" GOTO TEST
IF "%CHOICE%"=="5" GOTO HELP
IF "%CHOICE%"=="6" GOTO SETUP
IF "%CHOICE%"=="7" GOTO END

ECHO Invalid choice. Please try again.
TIMEOUT /T 2 >nul
GOTO MENU

:CHAT
ECHO.
ECHO 🚀 Starting Interactive Chat Mode...
ECHO.
node perplexity-cli.js --chat
PAUSE
GOTO MENU

:QUERY
ECHO.
SET /P QUERY="Enter your question: "
ECHO.
node perplexity-cli.js "!QUERY!"
ECHO.
PAUSE
GOTO MENU

:MODEL
ECHO.
ECHO Available Models:
ECHO   1. sonar            - Fast, real-time search (default)
ECHO   2. sonar-pro        - Advanced reasoning + search
ECHO   3. sonar-reasoning  - Deep analysis + search
ECHO.
SET /P MODEL_CHOICE="Enter model number (1-3): "

IF "%MODEL_CHOICE%"=="1" SET MODEL=sonar
IF "%MODEL_CHOICE%"=="2" SET MODEL=sonar-pro
IF "%MODEL_CHOICE%"=="3" SET MODEL=sonar-reasoning

IF NOT DEFINED MODEL (
    ECHO Invalid choice
    PAUSE
    GOTO MENU
)

ECHO.
SET /P QUERY="Enter your question: "
ECHO.
node perplexity-cli.js --model=!MODEL! "!QUERY!"
ECHO.
PAUSE
GOTO MENU

:TEST
ECHO.
ECHO 🧪 Testing Connection...
ECHO.
node perplexity-cli.js "say hello"
ECHO.
IF %ERRORLEVEL% EQU 0 (
    ECHO ✅ Connection successful!
) ELSE (
    ECHO ❌ Connection failed
)
PAUSE
GOTO MENU

:HELP
ECHO.
node perplexity-cli.js --help
PAUSE
GOTO MENU

:SETUP
ECHO.
ECHO ╔════════════════════════════════════════════════════════════════╗
ECHO ║                  API Key Setup                                 ║
ECHO ╚════════════════════════════════════════════════════════════════╝
ECHO.
ECHO Get your API key from: https://www.perplexity.ai/settings/api
ECHO.
SET /P NEW_KEY="Enter your Perplexity API key: "
ECHO PERPLEXITY_API_KEY=!NEW_KEY!> .env
ECHO.
ECHO ✅ API key saved to .env file
PAUSE
GOTO MENU

:END
ECHO.
ECHO 👋 Goodbye!
ECHO.
EXIT /B 0
