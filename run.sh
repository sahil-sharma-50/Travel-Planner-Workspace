#!/bin/bash

# Check for .env
if [ ! -f "backend/.env" ]; then
    echo "WARNING: backend/.env not found! Please create it before running."
fi

# Backend Setup
echo "Setting up Backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating venv and installing requirements..."
source venv/bin/activate
pip install -r requirements.txt

# Start Backend in background
echo "Starting Backend..."
python3 -m uvicorn app.main:app --reload &
BACKEND_PID=$!
cd ..

# Frontend Setup
echo "Starting Frontend..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Application is launching! Backend: http://localhost:8000, Frontend: http://localhost:5173"
echo "Press Ctrl+C to stop both processes."

# Wait for both
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
