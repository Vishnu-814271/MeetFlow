# MeetFlow - NLP Alumni Meetup Coordination App

MeetFlow is a mobile-first, Progressive Web App (PWA) designed to transparently coordinate travel, carpooling, status updates, and communication for the NLP Alumni Meetup (July 11 to July 12). 

Instead of scattered and unstructured WhatsApp chat coordination, MeetFlow enables alumni to self-organize travel plans, offer/join carpools, broadcast announcements, view participant directory status logs, and export contact details securely under robust privacy configurations.

---

## 📋 Prerequisites

Before running this project, install the following on your system:

| Tool | Version | Download |
|------|---------|----------|
| **Java JDK** | 21 or higher | [Adoptium](https://adoptium.net/) |
| **Node.js** | 18 or higher | [nodejs.org](https://nodejs.org/) |

> **Note:** Maven is NOT required — the project includes a Maven Wrapper (`mvnw`) that downloads Maven automatically.

### Verify Installation

```bash
# Check Java (must be 21+)
java -version

# Check Node.js (must be 18+)
node --version
npm --version
```

---

## 🚀 Quick Start (One Command)

### Windows
```bash
# Double-click start.bat OR run:
start.bat
```

### Linux / macOS
```bash
chmod +x start.sh
./start.sh
```

This will:
1. Install frontend dependencies (`npm install`)
2. Start the Spring Boot backend on **port 8081**
3. Start the Vite frontend on **port 5173**

---

## 🔧 Manual Setup (Step-by-Step)

### 1. Start the Backend

```bash
cd backend

# Windows:
mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"

# Linux/macOS:
chmod +x mvnw
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Wait for: `Started MeetflowApplication in X seconds` (takes ~15-30 seconds on first run).

### 2. Start the Frontend

```bash
cd frontend

# Install dependencies (only needed once or after pulling new changes)
npm install

# Start the dev server
npm run dev
```

### 3. Open the App

| Service | URL |
|---------|-----|
| **App** | http://localhost:5173 |
| **API Docs (Swagger)** | http://localhost:8081/swagger-ui.html |
| **H2 Database Console** | http://localhost:8081/h2-console |

> **H2 Console login:** JDBC URL = `jdbc:h2:mem:meetflow`, Username = `sa`, Password = *(leave empty)*

---

## 📂 Project Structure

```
MeetFlow/
├── start.bat / start.sh       # One-click startup scripts
├── Dockerfile                 # Multi-stage Docker build for production
├── backend/                   # Spring Boot REST API (Java 21)
│   ├── mvnw / mvnw.cmd       # Maven Wrapper (no Maven install needed)
│   ├── pom.xml                # Dependencies: Spring Boot 3, JPA, Flyway, MapStruct, Twilio
│   └── src/main/
│       ├── java/com/meetflow/
│       │   ├── controller/    # REST endpoints (Event, Participant, Travel, Carpool, etc.)
│       │   ├── service/       # Business logic
│       │   ├── model/         # JPA Entities
│       │   ├── dto/           # Data Transfer Objects
│       │   ├── mapper/        # MapStruct Entity↔DTO mappers
│       │   ├── repository/    # Spring Data JPA repositories
│       │   ├── config/        # CORS, Database config
│       │   └── exception/     # Global error handler
│       └── resources/
│           ├── application.yml         # Main config (port 8081)
│           ├── application-dev.yml     # Dev: H2 in-memory DB
│           ├── application-prod.yml    # Prod: PostgreSQL via env vars
│           └── db/
│               ├── migration/          # V1 schema + V2 notification logs
│               └── seed/              # V3 demo data (56 participants)
└── frontend/                  # React + Vite + TypeScript PWA
    ├── src/
    │   ├── pages/             # 10 pages (Portal, Join, Dashboard, etc.)
    │   ├── components/        # Layout, Navbar, ProtectedRoute
    │   ├── services/          # API client + React Query hooks
    │   └── context/           # Auth context
    ├── e2e/                   # Playwright E2E tests
    ├── vite.config.ts         # Dev proxy to backend + PWA config
    ├── tailwind.config.js     # Tailwind styling
    └── package.json           # Dependencies
```

---

## ⚙️ Environment Profiles

| Profile | Database | Use Case |
|---------|----------|----------|
| **dev** (default) | H2 in-memory | Local development — no external DB needed |
| **prod** | PostgreSQL | Production deployment via env vars |

### Production Environment Variables

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/meetflow
SPRING_DATASOURCE_USERNAME=your_username
SPRING_DATASOURCE_PASSWORD=your_password
DATABASE_URL=postgres://user:pass@host:5432/meetflow  # Alternative format (auto-parsed)
```

---

## 🐳 Docker Deployment

```bash
# Build the image (combines frontend build + backend into single JAR)
docker build -t meetflow .

# Run with PostgreSQL
docker run -p 8081:8081 \
  -e DATABASE_URL="postgres://user:pass@host:5432/meetflow" \
  meetflow
```

---

## 🧪 Testing

### Backend (JUnit 5)
```bash
cd backend
mvnw.cmd test        # Windows
./mvnw test          # Linux/macOS
```

### Frontend E2E (Playwright)
```bash
cd frontend
npx playwright install   # Install browsers (first time only)
npx playwright test
```
*Playwright runs with mobile viewport emulation (Pixel 5) and auto-starts the frontend server.*

---

## 🔒 Privacy & Data Masking

MeetFlow respects user-configured visibility parameters in both views and CSV downloads:
- **Display Name (`showName`):** When disabled, displays the user as `Anonymous` in chat boards and participant listings.
- **Display Phone (`showPhone`):** When disabled, hides the participant's WhatsApp/mobile number and restricts direct links.
- **Display Email (`showEmail`):** When disabled, hides the email address.
- **Travel Visibility (`showTravelDetails`):** When disabled, conceals flight/train details, arrival timing estimates, and pickup areas from other cohort members.
- **Data Export Center:** CSV downloads strictly apply masking placeholders (`[Hidden]`) according to active preferences.

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| `java: command not found` | Install Java 21 from [Adoptium](https://adoptium.net/) and add to PATH |
| `node: command not found` | Install Node.js from [nodejs.org](https://nodejs.org/) |
| `Port 8081 already in use` | Kill the process using port 8081, or change port in `application.yml` |
| `Port 5173 already in use` | Kill the process using port 5173, or run `npx vite --port 3000` |
| Backend compiles but fails to start | Check the console for Flyway migration errors; try deleting `backend/target/` and rebuilding |
| Frontend shows API errors | Make sure the backend is running first on port 8081 |
| `mvnw` permission denied (Linux/Mac) | Run `chmod +x backend/mvnw` |
