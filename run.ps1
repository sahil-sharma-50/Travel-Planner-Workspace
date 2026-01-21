# Check requirements
if (-not (Test-Path "backend/.env")) {
    Write-Host "WARNING: backend/.env not found! Please create it before running." -ForegroundColor Yellow
}

# Backend Setup (Venv)
Write-Host "Setting up Backend Virtual Environment..." -ForegroundColor Cyan
Set-Location backend

if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Gray
    python -m venv venv
}

Write-Host "Activating virtual environment and installing dependencies..." -ForegroundColor Gray
# Use a script block to handle venv activation and running
$backendCommand = @'
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
'@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand
Set-Location ..

# Frontend Setup
Write-Host "Starting Frontend..." -ForegroundColor Green
Set-Location frontend

$frontendCommand = @'
npm install
npm run dev
'@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand
Set-Location ..

Write-Host "Application is launching! Backend: http://localhost:8000, Frontend: http://localhost:5173" -ForegroundColor Cyan
