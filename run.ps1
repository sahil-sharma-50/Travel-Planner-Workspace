# Check requirements
if (-not (Test-Path "backend/.env")) {
    Write-Host "WARNING: backend/.env not found! Please create it before running." -ForegroundColor Yellow
}

# Start Backend
Write-Host "Starting Backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python -m uvicorn app.main:app --reload"

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm install; npm run dev"

Write-Host "Application is launching! Backend: http://localhost:8000, Frontend: http://localhost:5173" -ForegroundColor Cyan
