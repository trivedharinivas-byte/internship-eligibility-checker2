# ========================================================
# Stage 1: Build JAR using Maven
# ========================================================
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app

# Copy dependency configuration first to leverage Docker layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and build production artifact
COPY src ./src
RUN mvn clean package -DskipTests

# ========================================================
# Stage 2: Minimal Production Runtime
# ========================================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create a non-root application user for container security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy built executable jar from builder stage
COPY --from=builder /app/target/internship-eligibility-checker-1.0.0.jar app.jar

# Environment Variables
ENV PORT=8080 \
    SPRING_PROFILES_ACTIVE=prod

EXPOSE 8080

# Health check probe for orchestrators
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
