# PowerShell script to remove duplicate src/pages directory
# Run this script after stopping your dev server

$srcPagesPath = "src\pages"

if (Test-Path $srcPagesPath) {
    Write-Host "Found src\pages directory. Attempting to remove..."

    # Try to remove the directory
    try {
        Remove-Item -Path $srcPagesPath -Recurse -Force -ErrorAction Stop
        Write-Host "Successfully removed src\pages directory!" -ForegroundColor Green
    }
    catch {
        Write-Host "Failed to remove directory. Please ensure:" -ForegroundColor Red
        Write-Host "1. Your dev server is stopped (Ctrl+C in the terminal)" -ForegroundColor Yellow
        Write-Host "2. No editors have files from src\pages open" -ForegroundColor Yellow
        Write-Host "3. Try running this script as Administrator" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Error details: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "src\pages directory not found - already removed!" -ForegroundColor Green
}

Write-Host ""
Write-Host "You can now restart your dev server with: npm run dev" -ForegroundColor Cyan
