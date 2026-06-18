# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Spring Boot backend
FROM maven:3.9-eclipse-temurin-21-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B
COPY backend/src ./src
# Copy frontend production build to Spring Boot static resources
COPY --from=frontend-builder /app/frontend/dist ./src/main/resources/static/
RUN mvn clean package -DskipTests

# Stage 3: Run the integrated package
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=backend-builder /app/backend/target/meetflow-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8081
# Run with production profile active; PORT is dynamic under Render/Railway
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8081} -jar app.jar --spring.profiles.active=prod"]
