# Multi-stage Dockerfile pour Spring Boot Backend

# Stage 1: Build Maven
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080
EXPOSE 9092

ENTRYPOINT ["java", "-jar", "app.jar"]
