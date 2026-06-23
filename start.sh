#!/bin/bash
echo "============================================"
echo "   MEET-FLOW - Event Coordination App"
echo "============================================"
echo ""

# Check Java
if ! command -v java &> /dev/null; then
    echo "[ERROR] Java is not installed."
    echo "        Please install Java 21: https://adoptium.net/"
    exit 1
fi

# Check Node
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed."
    echo "        Please install Node.js 18+: https://nodejs.org/"
    exit 1
fi

echo "[1/3] Installing frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] npm install failed."
    exit 1
fi
cd ..

echo ""
echo "[2/3] Starting Backend (Spring Boot on port 8081)..."
cd backend
chmod +x mvnw
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev &
BACKEND_PID=$!
cd ..

echo ""
echo "[3/3] Starting Frontend (Vite on port 5173)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "============================================"
echo " MeetFlow is starting up!"
echo ""
echo " Frontend: http://localhost:5173"
echo " Backend:  http://localhost:8081"
echo " Swagger:  http://localhost:8081/swagger-ui.html"
echo " H2 DB:    http://localhost:8081/h2-console"
echo "============================================"
echo ""
echo " Press Ctrl+C to stop both servers."
echo ""

# Trap Ctrl+C to kill both processes
trap "echo 'Stopping MeetFlow...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

# Wait for both processes
wait
