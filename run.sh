#!/bin/bash

# Check for .env
if [ ! -f "backend/.env" ]; then
    echo "WARNING: backend/.env not found! Please create it before running."
fi

# Start Backend in background
echo "Starting Backend..."
cd backend && python3 -m uvicorn app.main:app --reload &
BACKEND_PID=$!

# Start Frontend in background
echo "Starting Frontend..."
cd ../frontend && npm install && npm run dev &
FRONTEND_PID=$!

echo "Application is launching! Backend: http://localhost:8000, Frontend: http://localhost:5173"
echo "Press Ctrl+C to stop both processes."

# Wait for both
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
