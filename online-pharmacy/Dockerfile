FROM eclipse-temurin:17-jre-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY pharmacy-*/pom.xml ./
COPY pharmacy-common/src pharmacy-common/src
COPY pharmacy-orders/src pharmacy-orders/src

RUN mvn dependency:go-offline -B -q && \
    mvn package -DskipTests -B -q && \
    mkdir -p target/dependency && \
    (cd target/dependency; jar -xf ../*.jar)

FROM eclipse-temurin:17-jre-alpine
VOLUME /tmp

RUN addgroup -g 1000 appgroup && \
    adduser -u 1000 -G appgroup -s /bin/sh -D appuser

USER appuser
WORKDIR /app

COPY --from=builder /app/target/dependency/dependency/ ./lib/
COPY --from=builder /app/target/dependency/spring-jcl/ ./lib/
COPY --from=builder /app/target/dependency/spring-core/ ./lib/
COPY --from=builder /app/target/dependency/spring-boot/ ./lib/
COPY --from=builder /app/target/*.jar app.jar

RUN chmod +x app.jar

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]