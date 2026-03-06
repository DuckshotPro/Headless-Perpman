# ====================================================================================================
# MCP PERPLEXITY CLIENT - POWERSHELL LAUNCHER
# ====================================================================================================
#
# Advanced PowerShell launcher with enhanced features and better error handling.
# Provides the same functionality as launch.bat but with PowerShell's robustness.
#
# ====================================================================================================

#Requires -Version 5.1

# Set strict mode for better error handling
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ====================================================================================================
# CONFIGURATION
# ====================================================================================================

$Config = @{
    Email = "420duck@google.com"
    ChromeUserData = Join-Path $env:LOCALAPPDATA "Google\Chrome\User Data"
    OutputDir = ".\exports"
    Port = 3000
    ScriptDir = $PSScriptRoot
}

# ====================================================================================================
# HELPER FUNCTIONS
# ====================================================================================================

function Write-Header {
    param([string]$Title)
    Write-Host "`n╔════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  $($Title.PadRight(66))║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Success "Node.js found: $nodeVersion"
    } catch {
        Write-Error-Custom "Node.js is not installed or not in PATH"
        Write-Host "`nPlease install Node.js from https://nodejs.org/`n"
        return $false
    }
    
    # Check if project is built
    $cliPath = Join-Path $Config.ScriptDir "dist\cli.js"
    if (-not (Test-Path $cliPath)) {
        Write-Warning-Custom "Project not built. Building now..."
        try {
            Set-Location $Config.ScriptDir
            npm run build
            Write-Success "Build completed successfully"
        } catch {
            Write-Error-Custom "Build failed: $_"
            return $false
        }
    } else {
        Write-Success "Project is built"
    }
    
    return $true
}

function Test-ChromeRunning {
    $chromeProcesses = Get-Process -Name "chrome" -ErrorAction SilentlyContinue
    if ($chromeProcesses) {
        Write-Warning-Custom "Chrome is currently running!"
        Write-Host "For best results with session reuse, Chrome should be closed."
        $response = Read-Host "Continue anyway? (y/n)"
        return ($response -eq 'y')
    }
    return $true
}

function Invoke-PerplexityClient {
    param(
        [string]$Mode,
        [hashtable]$AdditionalArgs = @{}
    )
    
    $args = @(
        "mcp-perplexity-client.js",
        "--mode=$Mode",
        "--email=$($Config.Email)"
    )
    
    foreach ($key in $AdditionalArgs.Keys) {
        $args += "--$key=$($AdditionalArgs[$key])"
    }
    
    Write-Info "Running: node $($args -join ' ')"
    Write-Host ""
    
    try {
        Set-Location $Config.ScriptDir
        & node $args
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Operation completed successfully"
        } else {
            Write-Warning-Custom "Operation completed with warnings (exit code: $LASTEXITCODE)"
        }
    } catch {
        Write-Error-Custom "Operation failed: $_"
    }
}

function Show-Menu {
    Write-Header "MCP PERPLEXITY CLIENT"
    
    Write-Host "Current Configuration:" -ForegroundColor Yellow
    Write-Host "  Email: $($Config.Email)"
    Write-Host "  Output: $($Config.OutputDir)"
    Write-Host "  Port: $($Config.Port)"
    Write-Host ""
    
    Write-Host "Select an option:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  1. Interactive Mode (manual browser control)"
    Write-Host "  2. Export Conversations (with email login)"
    Write-Host "  3. Export Conversations (using Chrome session - RECOMMENDED)"
    Write-Host "  4. Start API Server"
    Write-Host "  5. Export in Headless Mode (requires Chrome session)"
    Write-Host "  6. Show Help"
    Write-Host "  7. Configure Settings"
    Write-Host "  8. View Recent Exports"
    Write-Host "  9. Quick Test (check if tool works)"
    Write-Host " 10. Exit"
    Write-Host ""
}

function Start-InteractiveMode {
    Write-Header "INTERACTIVE MODE"
    Write-Info "Starting browser for manual interaction..."
    Invoke-PerplexityClient -Mode "interactive"
}

function Start-ExportWithEmail {
    Write-Header "EXPORT MODE (Email Login)"
    Write-Warning-Custom "You will need to enter OTP code from your email"
    Invoke-PerplexityClient -Mode "export" -AdditionalArgs @{
        output = $Config.OutputDir
    }
}

function Start-ExportWithSession {
    Write-Header "EXPORT MODE (Chrome Session)"
    
    if (-not (Test-ChromeRunning)) {
        Write-Warning-Custom "Operation cancelled by user"
        return
    }
    
    Write-Info "Using Chrome profile: $($Config.ChromeUserData)"
    Invoke-PerplexityClient -Mode "export" -AdditionalArgs @{
        output = $Config.OutputDir
        "user-data-dir" = $Config.ChromeUserData
    }
}

function Start-ApiServer {
    Write-Header "API SERVER MODE"
    Write-Info "Server will be available at: http://localhost:$($Config.Port)"
    Write-Warning-Custom "Press Ctrl+C to stop the server"
    Write-Host ""
    Invoke-PerplexityClient -Mode "server" -AdditionalArgs @{
        port = $Config.Port
    }
}

function Start-HeadlessExport {
    Write-Header "HEADLESS EXPORT MODE"
    
    if (-not (Test-ChromeRunning)) {
        Write-Warning-Custom "Operation cancelled by user"
        return
    }
    
    Write-Info "Running in headless mode with Chrome session..."
    Invoke-PerplexityClient -Mode "export" -AdditionalArgs @{
        output = $Config.OutputDir
        "user-data-dir" = $Config.ChromeUserData
        headless = $true
    }
}

function Show-Help {
    Write-Header "HELP"
    Set-Location $Config.ScriptDir
    & node mcp-perplexity-client.js --help
}

function Edit-Configuration {
    Write-Header "CONFIGURATION EDITOR"
    
    Write-Host "Current Settings:" -ForegroundColor Yellow
    Write-Host "  1. Email: $($Config.Email)"
    Write-Host "  2. Chrome User Data: $($Config.ChromeUserData)"
    Write-Host "  3. Output Directory: $($Config.OutputDir)"
    Write-Host "  4. Server Port: $($Config.Port)"
    Write-Host ""
    
    $choice = Read-Host "Enter number to edit (1-4) or Enter to go back"
    
    switch ($choice) {
        "1" {
            $newEmail = Read-Host "Enter new email"
            if ($newEmail) {
                $Config.Email = $newEmail
                Write-Success "Email updated to: $newEmail"
            }
        }
        "2" {
            $newPath = Read-Host "Enter new Chrome User Data path"
            if ($newPath) {
                $Config.ChromeUserData = $newPath
                Write-Success "Chrome User Data updated"
            }
        }
        "3" {
            $newOutput = Read-Host "Enter new output directory"
            if ($newOutput) {
                $Config.OutputDir = $newOutput
                Write-Success "Output directory updated"
            }
        }
        "4" {
            $newPort = Read-Host "Enter new port number"
            if ($newPort) {
                $Config.Port = [int]$newPort
                Write-Success "Port updated to: $newPort"
            }
        }
    }
    
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Show-RecentExports {
    Write-Header "RECENT EXPORTS"
    
    $exportPath = Join-Path $Config.ScriptDir $Config.OutputDir
    
    if (-not (Test-Path $exportPath)) {
        Write-Warning-Custom "No exports found. Run an export first."
    } else {
        $exports = Get-ChildItem -Path $exportPath -Filter "*.md" -ErrorAction SilentlyContinue |
                   Sort-Object LastWriteTime -Descending |
                   Select-Object -First 20
        
        if ($exports) {
            Write-Host "Most recent exports:" -ForegroundColor Cyan
            Write-Host ""
            $exports | Format-Table Name, Length, LastWriteTime -AutoSize
        } else {
            Write-Warning-Custom "No markdown files found in $exportPath"
        }
    }
    
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Start-QuickTest {
    Write-Header "QUICK TEST"
    
    Write-Info "Testing Node.js installation..."
    try {
        $nodeVersion = node --version
        Write-Success "Node.js: $nodeVersion"
    } catch {
        Write-Error-Custom "Node.js test failed"
        return
    }
    
    Write-Info "Testing project build..."
    $cliPath = Join-Path $Config.ScriptDir "dist\cli.js"
    if (Test-Path $cliPath) {
        Write-Success "Project is built"
    } else {
        Write-Error-Custom "Project not built"
        return
    }
    
    Write-Info "Testing CLI help..."
    try {
        Set-Location $Config.ScriptDir
        $output = & node mcp-perplexity-client.js --help 2>&1
        if ($output -match "MCP-INTEGRATED PERPLEXITY CLIENT") {
            Write-Success "CLI is functional"
        } else {
            Write-Warning-Custom "CLI output unexpected"
        }
    } catch {
        Write-Error-Custom "CLI test failed: $_"
        return
    }
    
    Write-Success "All tests passed! The tool is ready to use."
    Write-Host ""
    Read-Host "Press Enter to continue"
}

# ====================================================================================================
# MAIN PROGRAM
# ====================================================================================================

function Main {
    Clear-Host
    
    # Check prerequisites
    if (-not (Test-Prerequisites)) {
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    # Main loop
    while ($true) {
        Clear-Host
        Show-Menu
        
        $choice = Read-Host "Enter your choice (1-10)"
        
        switch ($choice) {
            "1" { Start-InteractiveMode; Read-Host "`nPress Enter to continue" }
            "2" { Start-ExportWithEmail; Read-Host "`nPress Enter to continue" }
            "3" { Start-ExportWithSession; Read-Host "`nPress Enter to continue" }
            "4" { Start-ApiServer; Read-Host "`nPress Enter to continue" }
            "5" { Start-HeadlessExport; Read-Host "`nPress Enter to continue" }
            "6" { Show-Help; Read-Host "`nPress Enter to continue" }
            "7" { Edit-Configuration }
            "8" { Show-RecentExports }
            "9" { Start-QuickTest }
            "10" {
                Write-Host "`n👋 Goodbye!`n" -ForegroundColor Cyan
                exit 0
            }
            default {
                Write-Warning-Custom "Invalid choice. Please try again."
                Start-Sleep -Seconds 2
            }
        }
    }
}

# Run main program
Main
