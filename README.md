# MeetFlow - NLP Alumni Meetup Coordination App

MeetFlow is a mobile-first, Progressive Web App (PWA) designed to transparently coordinate travel, carpooling, status updates, and communication for the NLP Alumni Meetup (July 11 to July 12). 

Instead of scattered and unstructured WhatsApp chat coordination, MeetFlow enables alumni to self-organize travel plans, offer/join carpools, broadcast announcements, view participant directory status logs, and export contact details securely under robust privacy configurations.

---

## 📂 Repository Structure

The project is structured as a decoupled full-stack application:

```
MeetFlow/
├── backend/                  # Spring Boot REST API
│   ├── src/main/java/        # JPA Entities, Controllers, Services, Mappers, Repositories
│   ├── src/main/resources/   # Application config (application.yml), Flyway migrations
│   │   └── db/migration/     # V1 Schema Definition & V2 Demo Seeding Scripts
│   └── pom.xml               # Maven Dependency Configuration
└── frontend/                 # React + Vite + TypeScript PWA
    ├── src/                  # React views, components, hooks, routing, contexts
    ├── e2e/                  # Playwright E2E Integration tests
    ├── vite.config.ts        # Vite configuration with PWA plugin & dev proxy
    ├── tailwind.config.js    # Tailwind styling system
    └── package.json          # Node dependencies and scripts
```

---

## 🚀 Setup & Launch Instructions

### 1. Spring Boot Backend Server
The backend is built with Spring Boot 3, Java 21, Spring Data JPA, H2, and Flyway.
- **Port:** Configured on `8081` (avoiding port `8080` if occupied by system daemons).
- **Profile Configuration:**
  - **`dev` (Default):** Runs an in-memory/file-based H2 Database with Flyway migrations automatically seeding 56 demo participants, matching travel plans, and dummy chats.
  - **`prod`:** Configured to connect to a PostgreSQL instance via env variables (e.g. `SPRING_DATASOURCE_URL`).

To start the backend:
```bash
cd backend
mvn spring-boot:run
```
Once started, Swagger API docs are available at: `http://localhost:8081/swagger-ui/index.html`

---

### 2. React Frontend App
The frontend is built with React 19, Vite, TypeScript, Tailwind CSS, and TanStack React Query.
- **Port:** Configured on `5173` with dynamic proxy redirection to the backend on `8081`.
- **Offline / PWA Capabilities:** Bundled with service workers and an installable manifest matching responsive layouts.

To start the frontend:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in a web browser (or mobile emulator) to interact with the application.

---

## 🧪 Testing Guidelines

### Backend Testing (JUnit 5)
Runs unit/integration tests covering mapper conversions, carpool routing suggestions, and API controller endpoints:
```bash
cd backend
mvn test
```

### Frontend / E2E Integration Testing (Playwright)
An automated end-to-end suite mimicking user registration, travel-plan mapping, carpool publishes, chat broadcasts, settings privacy toggling, and data downloads:
```bash
cd frontend
npx playwright test
```
*Note: Playwright is configured to run with mobile viewport emulation (Pixel 5) and starts the frontend server automatically.*

---

## 🔒 Privacy & Data Masking Commitments
MeetFlow respects user-configured visibility parameters inside both views and CSV downloads:
- **Display Name (`showName`):** When disabled, displays the user as `Anonymous` in chat boards and participant listings.
- **Display Phone (`showPhone`):** When disabled, hides the participant's WhatsApp/mobile number and restricts direct links.
- **Display Email (`showEmail`):** When disabled, hides the email address.
- **Travel Visibility (`showTravelDetails`):** When disabled, conceals flight/train details, arrival timing estimates, and pickup areas from other cohort members.
- **Data Export Center:** CSV downloads for participants and travel coordinates strictly apply masking placeholders (`[Hidden]`) according to the active preferences of each participant.
