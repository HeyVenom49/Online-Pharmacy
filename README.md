# 🏥 Online Pharmacy - Complete Setup Guide

A modern **microservices-based online pharmacy platform** built with **Spring Boot 3**, **Java 17**, **React + TypeScript**, and containerized with **Docker**. Features include JWT authentication, OTP verification, real-time notifications, distributed tracing, and comprehensive monitoring.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start - Backend](#quick-start---backend)
- [Quick Start - Frontend](#quick-start---frontend)
- [Services & Ports](#services--ports)
- [Demo Users](#demo-users)
- [API Documentation](#api-documentation)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)
- [Additional Resources](#additional-resources)

---

## 📦 Project Overview

This is a **full-stack microservices application** for managing an online pharmacy with the following capabilities:

### Backend Features

- ✅ **User Authentication & Authorization** - JWT + OTP-based email verification
- ✅ **Microservices Architecture** - 6 independent services with service discovery
- ✅ **Medicine Catalog** - Categories, inventory management, batch tracking
- ✅ **Shopping Cart & Orders** - Full checkout flow with order lifecycle
- ✅ **Prescriptions** - Upload, admin review (approve/reject)
- ✅ **Notifications** - In-app + email notifications via event-driven architecture
- ✅ **Admin Dashboard** - KPI tracking (orders, inventory, revenue)
- ✅ **Observability** - Logging, metrics (Prometheus), distributed tracing (Zipkin)
- ✅ **Resilience** - Circuit breakers, retry logic, rate limiting

### Frontend Features

- 🎨 **React + TypeScript + Vite** - Modern, type-safe frontend
- 🔐 **JWT Authentication** - Secure API communication
- 🛒 **Shopping Cart** - Add/remove medicines, checkout
- 👤 **User Profile Management** - Addresses, notifications
- 📊 **Admin Dashboard** - Medicine management, order tracking
- 📱 **Responsive Design** - Works on desktop and mobile

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React + Vite)                     │
│                    http://localhost:5173                          │
└────────────┬────────────────────────────────────────────────────┘
             │ (HTTP Requests)
             ↓
┌─────────────────────────────────────────────────────────────────┐
│                   API GATEWAY (Port 8080)                         │
│          JWT Validation • Rate Limiting • Load Balancing         │
└────┬─────────┬──────────────┬──────────────┬────────────────────┘
     │         │              │              │
     ↓         ↓              ↓              ↓
   ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐
   │Identity│ │Catalog │ │ Orders │ │  Admin   │
   │(8081)  │ │ (8082) │ │ (8083) │ │  (8084)  │
   └──┬──────┘ └──┬─────┘ └───┬────┘ └─────┬────┘
      │           │           │           │
      └───────────┼───────────┴───────────┘
                  │
                  ↓ (RabbitMQ Events)
          ┌──────────────────┐
          │  Notifications   │
          │      (8085)      │
          └──────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                          │
├──────────────────────────────────────────────────────────────────┤
│  PostgreSQL (5432)  │  Redis (6379)  │  RabbitMQ (5672)         │
│  Eureka (8761)      │  Config Server (8888)  │  Zipkin (9411)   │
│  Prometheus (9090)  │  Grafana (3000)  │  Mailpit (1025/8025)   │
└─────────────────────────────────────────────────────────────────┘
```

### Microservices Breakdown

| Service           | Port | Responsibility                                                 |
| ----------------- | ---- | -------------------------------------------------------------- |
| **Gateway**       | 8080 | API entry point, JWT auth, rate limiting, load balancing       |
| **Identity**      | 8081 | User signup/login, JWT tokens, OTP verification, user profiles |
| **Catalog**       | 8082 | Medicines, categories, prescriptions, inventory                |
| **Orders**        | 8083 | Shopping cart, checkout, order management                      |
| **Admin**         | 8084 | Dashboard KPIs, analytics                                      |
| **Notifications** | 8085 | Email & in-app notifications (event-driven)                    |
| **Eureka**        | 8761 | Service registry & discovery                                   |
| **Config Server** | 8888 | Centralized configuration management                           |

### Infrastructure Components

| Component      | Port       | Purpose                                                   |
| -------------- | ---------- | --------------------------------------------------------- |
| **PostgreSQL** | 5432       | Main database (4 databases: auth, catalog, orders, admin) |
| **Redis**      | 6379       | Caching, JWT blacklist, session storage                   |
| **RabbitMQ**   | 5672/15672 | Message broker for async events                           |
| **Zipkin**     | 9411       | Distributed tracing                                       |
| **Prometheus** | 9090       | Metrics collection & storage                              |
| **Grafana**    | 3000       | Metrics visualization & dashboards                        |
| **Mailpit**    | 1025/8025  | Fake SMTP for testing emails                              |

---

## 🛠️ Prerequisites

Before you start, ensure you have installed:

### Required

- **Docker** (20.10+) - [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose** (2.0+) - Usually comes with Docker Desktop
- **Java 17+** - [Install JDK 17](https://adoptopenjdk.net/)
- **Maven 3.8+** - [Install Maven](https://maven.apache.org/install.html)
- **Node.js 18+** & **npm 9+** - [Install Node.js](https://nodejs.org/)

### Optional

- **Git** - For cloning and version control
- **Postman/Insomnia** - For API testing
- **VS Code** - For development

### Verify installations

```bash
docker --version
docker compose version
java -version
mvn --version
node --version
npm --version
```

---

## 🚀 Quick Start - Backend

### Step 1: Clone the Repository (if needed)

```bash
git clone https://github.com/HeyVenom49/Online-Pharmacy.git
cd Online-Pharmacy/online-pharmacy
```

### Step 2: Set Up Environment Variables

```bash
# Copy the example .env file (create if it doesn't exist)
cp .env.example .env  # if .env.example exists

# Or create a new .env file with essential settings:
cat > .env << 'EOF'
# Database
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=pharmacy
DATABASE_PASSWORD=pharmacy123

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest

# JWT (use a strong random value in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345

# Email (Mailpit for dev/demo)
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_FROM=noreply@pharmacy.local
MAIL_SMTP_AUTH=false
MAIL_SMTP_TLS=false

# Eureka
EUREKA_HOSTNAME=eureka
EUREKA_PORT=8761

# Config Server
CONFIG_SERVER_URL=http://config:8888

# Zipkin (tracing)
ZIPKIN_URL=http://zipkin:9411

# Prometheus
PROMETHEUS_URL=http://prometheus:9090
EOF
```

### Step 3: Build All Microservices

```bash
# Clean and build all projects (skip tests for faster build)
mvn clean package -DskipTests

# Or with tests (slower, but safer)
mvn clean package
```

Expected output: JAR files in each service's `target/` directory.

### Step 4: Start All Services with Docker Compose

```bash
# Start in background (-d flag)
docker compose up -d

# Or start in foreground (see logs in real-time, Ctrl+C to stop)
docker compose up
```

⏳ **Wait 30-60 seconds** for services to fully start (see health checks below).

### Step 5: Verify Services Are Running

```bash
# Check all containers
docker compose ps

# Expected: All services should show "Up" status
```

### Step 6: Health Checks

```bash
# Quick health check on Gateway (wait if not ready)
curl -s http://localhost:8080/actuator/health | jq '.'

# Health check all services
for port in 8080 8081 8082 8083 8084 8085; do
  echo "Port $port:"
  curl -s http://localhost:$port/actuator/health | jq '.status'
done
```

Expected response: `"status": "UP"`

### ✅ Backend is Ready!

Your backend is now running! Visit:

- **Gateway**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **Eureka**: http://localhost:8761

---

## 🎨 Quick Start - Frontend

### Step 1: Navigate to Frontend Directory

```bash
cd ../online-pharmacy-frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Frontend Environment File (if needed)

```bash
cat > .env << 'EOF'
VITE_API_URL=http://localhost:8080/api
VITE_APP_TITLE=Online Pharmacy
EOF
```

### Step 4: Start Development Server

```bash
npm run dev
```

Expected output:

```
  VITE v... ready in ... ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### ✅ Frontend is Ready!

Open in your browser: http://localhost:5173

---

## 🔌 Services & Ports

### All Running Services

```bash
# See status of all Docker containers
docker compose ps
```

### Access URLs

| Service               | URL                                   | Purpose                       |
| --------------------- | ------------------------------------- | ----------------------------- |
| **Frontend**          | http://localhost:5173                 | React app (after npm run dev) |
| **Gateway + Swagger** | http://localhost:8080/swagger-ui.html | API docs & testing            |
| **Identity**          | http://localhost:8081                 | User auth (direct)            |
| **Catalog**           | http://localhost:8082                 | Medicines (direct)            |
| **Orders**            | http://localhost:8083                 | Cart/checkout (direct)        |
| **Admin**             | http://localhost:8084                 | Dashboard (direct)            |
| **Notifications**     | http://localhost:8085                 | Notifications (direct)        |
| **Eureka Registry**   | http://localhost:8761                 | Service discovery             |
| **Config Server**     | http://localhost:8888                 | Configuration                 |
| **RabbitMQ UI**       | http://localhost:15672                | Message broker (guest/guest)  |
| **Mailpit**           | http://localhost:8025                 | Email inbox (demo)            |
| **Zipkin**            | http://localhost:9411                 | Distributed tracing           |
| **Prometheus**        | http://localhost:9090                 | Metrics                       |
| **Grafana**           | http://localhost:3000                 | Dashboards (admin/admin)      |

---

## 👥 Demo Users

These accounts are pre-seeded in the database during application startup:

### Admin Account

```
Email:    admin@pharmacy.com
Password: admin123
Role:     ADMIN
```

### Customer Account

```
Email:    demo.customer@example.com
Password: password123
Role:     CUSTOMER
```

### Login Flow

1. **Open Frontend**: http://localhost:5173
2. **Navigate to Login** (or click on auth endpoint in Swagger)
3. **Enter credentials** from above
4. **Receive JWT token** (automatically stored in frontend)
5. **Access protected endpoints** as authenticated user

---

## 📚 API Documentation

### Using Swagger UI (Recommended)

1. **Open Swagger**: http://localhost:8080/swagger-ui.html
2. **Login** to get a JWT token:
   - Go to `POST /api/auth/login`
   - Click "Try it out"
   - Enter demo user credentials
   - Copy the returned token
3. **Authorize** for protected endpoints:
   - Click the green "Authorize" button (top right)
   - Paste: `Bearer <your-token-here>`
   - Click "Authorize"
4. **Test endpoints** - Now you can try any endpoint that requires authentication

### Key Endpoints

#### Authentication (Public)

```
POST   /api/auth/login                    - Login with email/password
POST   /api/auth/signup                   - Register new user
POST   /api/auth/logout                   - Logout (blacklist token)
POST   /api/auth/otp/request              - Request OTP for signup/password-reset
POST   /api/auth/otp/verify               - Verify OTP
GET    /api/auth/me                       - Get current user profile
```

#### Catalog (Public/Authenticated)

```
GET    /api/catalog/medicines             - List all medicines
GET    /api/catalog/medicines/{id}        - Get medicine details
GET    /api/catalog/categories            - List categories
POST   /api/catalog/prescriptions/upload  - Upload prescription (auth required)
GET    /api/catalog/prescriptions         - List user's prescriptions (auth required)
```

#### Orders (Authenticated)

```
GET    /api/orders/cart                   - Get shopping cart
POST   /api/orders/cart/items             - Add item to cart
DELETE /api/orders/cart/items/{itemId}    - Remove from cart
POST   /api/orders/checkout               - Process checkout
GET    /api/orders                        - List user's orders
GET    /api/orders/{orderId}              - Get order details
```

#### Notifications (Authenticated)

```
GET    /api/notifications                 - Get user's notifications
PUT    /api/notifications/{id}/read       - Mark notification as read
DELETE /api/notifications/{id}            - Delete notification
```

#### Admin (Admin Only)

```
GET    /api/admin/dashboard               - Dashboard KPIs
GET    /api/admin/prescriptions           - List all prescriptions (for review)
PUT    /api/admin/prescriptions/{id}      - Approve/reject prescription
```

### Testing via cURL

#### 1. Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo.customer@example.com",
    "password": "password123"
  }'

# Response includes: { "token": "eyJhbGc..." }
```

#### 2. Use Token in Requests

```bash
TOKEN="eyJhbGc..." # from login response

# Get medicines
curl -X GET http://localhost:8080/api/catalog/medicines \
  -H "Authorization: Bearer $TOKEN"

# Get cart
curl -X GET http://localhost:8080/api/orders/cart \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🛠️ Common Tasks

### Build & Deploy

#### Build only (skip tests)

```bash
mvn clean package -DskipTests
```

#### Build with tests

```bash
mvn clean package
```

#### Build specific service

```bash
mvn clean package -pl pharmacy-identity -am -DskipTests
```

### Running Tests

#### Run all tests

```bash
mvn test
```

#### Run tests for specific service

```bash
mvn test -pl pharmacy-identity
```

#### Run tests excluding a service

```bash
mvn test --exclude=pharmacy-notifications
```

### Database & Infrastructure

#### View database

```bash
# Connect to PostgreSQL
docker exec -it pharmacy-postgres psql -U pharmacy -d postgres

# List databases
\l

# Connect to auth_db
\c auth_db

# List tables
\dt

# Exit
\q
```

#### Reset database (warning: deletes data)

```bash
docker compose down -v  # -v removes volumes
docker compose up -d
# Migrations run automatically; demo users are re-seeded
```

#### View RabbitMQ UI

```
http://localhost:15672
Username: guest
Password: guest
```

#### View email (Mailpit)

```
http://localhost:8025
```

### Logs

#### View logs for all services

```bash
docker compose logs -f
```

#### View logs for specific service

```bash
docker compose logs -f pharmacy-identity
# or
docker compose logs -f pharmacy-gateway
```

#### View logs for specific time range

```bash
docker compose logs --since 5m  # last 5 minutes
```

### Stopping Services

#### Stop all containers (keep data)

```bash
docker compose stop
```

#### Stop and remove containers (keep data)

```bash
docker compose down
```

#### Stop and remove everything (deletes volumes/data)

```bash
docker compose down -v
```

#### Restart specific service

```bash
docker compose restart pharmacy-identity
```

---

## 🐛 Troubleshooting

### Services Won't Start

#### Problem: "Docker is not running"

**Solution**: Start Docker Desktop or Docker daemon

```bash
# macOS
open -a Docker

# Linux
sudo systemctl start docker
```

#### Problem: "Port already in use"

**Solution**: Kill the process using the port or change port in `docker-compose.yml`

```bash
# Find process on port 8080
lsof -i :8080

# Kill it
kill -9 <PID>

# Or change port in docker-compose.yml and restart
docker compose down
docker compose up -d
```

#### Problem: Service shows "Unhealthy"

**Solution**: Wait longer (services take 30-60s) or check logs

```bash
docker compose logs pharmacy-identity
```

### Database Issues

#### Problem: "Connection refused" from services to database

**Solution**: Ensure PostgreSQL is healthy

```bash
docker compose ps  # Check postgres status
docker compose logs postgres
```

#### Problem: "Flyway migration errors"

**Solution**: Reset the database

```bash
docker compose down -v
docker compose up -d
```

### Frontend Issues

#### Problem: "Failed to fetch API"

**Solution**: Ensure backend is running and CORS is configured

```bash
# Check if gateway is up
curl http://localhost:8080/actuator/health

# Check frontend .env VITE_API_URL
cat .env
```

#### Problem: "Module not found" after npm install

**Solution**: Clear and reinstall

```bash
rm -rf node_modules package-lock.json
npm install
```

### JWT/Authentication Issues

#### Problem: "Invalid token" or "Unauthorized"

**Solution**:

1. Get a fresh token by logging in again
2. Ensure token is passed in `Authorization: Bearer <token>` header
3. Check JWT_SECRET matches across services

#### Problem: "Token expired"

**Solution**: Login again to get a new token

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo.customer@example.com", "password": "password123"}'
```

### Common Error Messages

| Error                                                       | Cause               | Solution                            |
| ----------------------------------------------------------- | ------------------- | ----------------------------------- |
| `java.net.ConnectException: Connection refused`             | Service not running | Check `docker compose ps`           |
| `org.springframework.amqp.AmqpConnectException`             | RabbitMQ not ready  | Wait longer or check logs           |
| `PSQLException: FATAL: remaining connection slots reserved` | DB connection limit | Reduce connection pool size         |
| `ERROR: schema "public" does not exist`                     | DB not initialized  | Reset with `docker compose down -v` |

### Getting Help

#### Check specific service logs

```bash
# Service startup logs
docker compose logs pharmacy-gateway

# Watch real-time logs
docker compose logs -f pharmacy-identity
```

#### Check health of all services

```bash
for port in 8080 8081 8082 8083 8084 8085; do
  echo "Checking port $port..."
  curl -s http://localhost:$port/actuator/health
done
```

#### Check Eureka service registry

Visit http://localhost:8761 - should show all services as "UP"

---

## 📁 Project Structure

```
Online-Pharmacy/
│
├── online-pharmacy/                    # Backend Microservices
│   ├── pharmacy-eureka/               # Service Registry
│   ├── pharmacy-config/               # Config Server
│   ├── pharmacy-gateway/              # API Gateway
│   ├── pharmacy-identity/             # Auth & User Service
│   ├── pharmacy-catalog/              # Medicine & Prescription Service
│   ├── pharmacy-orders/               # Order & Cart Service
│   ├── pharmacy-admin/                # Admin Dashboard Service
│   ├── pharmacy-notifications/        # Notification Service
│   ├── pharmacy-common/               # Shared Models & Utilities
│   ├── docker-compose.yml             # Docker infrastructure
│   ├── docker-compose.override.yml    # Local overrides
│   ├── docker-compose.prod.yml        # Production config
│   ├── pom.xml                        # Root Maven config
│   ├── mvnw & mvnw.cmd               # Maven Wrapper (for CI/CD)
│   ├── deploy.sh                      # One-click deployment script
│   ├── prometheus.yml                 # Metrics config
│   ├── k8s/                           # Kubernetes manifests
│   ├── docs/                          # Additional documentation
│   └── scripts/                       # Utility scripts
│
└── online-pharmacy-frontend/           # React + TypeScript Frontend
    ├── src/
    │   ├── api/                       # API client code
    │   ├── components/                # Reusable React components
    │   ├── pages/                     # Page components (routes)
    │   ├── context/                   # React Context (state)
    │   ├── hooks/                     # Custom React hooks
    │   ├── store/                     # Global state management
    │   ├── types/                     # TypeScript type definitions
    │   ├── utils/                     # Utility functions
    │   └── App.tsx                    # Main app component
    ├── public/                        # Static assets
    ├── package.json                   # Dependencies & scripts
    ├── tsconfig.json                  # TypeScript config
    ├── vite.config.ts                 # Vite bundler config
    ├── eslint.config.js               # Linting rules
    └── index.html                     # Entry HTML
```

---

## 📖 Additional Resources

### Key Documentation Files

- **[Backend README](./online-pharmacy/README.md)** - Technical details about microservices
- **[Technical Documentation](./online-pharmacy/docs/TECHNICAL_DOCUMENTATION.md)** - Architecture deep-dive
- **[API Endpoints Reference](./online-pharmacy/docs/API_ENDPOINTS.md)** - Complete API spec
- **[Swagger Testing Guide](./online-pharmacy/docs/SWAGGER_TESTING.md)** - How to test APIs
- **[OTP Authentication](./online-pharmacy/docs/OTP_AUTHENTICATION.md)** - Email OTP flow
- **[Frontend README](./online-pharmacy-frontend/README.md)** - Frontend setup & development
- **[Test Data](./online-pharmacy/docs/ENDPOINTS_TEST_DATA.json)** - Sample request bodies

### External Links

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Cloud Documentation](https://spring.io/projects/spring-cloud)
- [React Documentation](https://react.dev)
- [Docker Documentation](https://docs.docker.com)
- [Kubernetes Documentation](https://kubernetes.io/docs)

### Development Guides

- **Local Development**: Use `docker-compose.yml` with hot-reload
- **Testing**: Run `mvn test` for unit tests; see `docs/SWAGGER_TESTING.md` for integration tests
- **Debugging**: Use IDE breakpoints with `mvn spring-boot:run` or attach to Docker containers
- **Performance**: Use Prometheus/Grafana dashboards at http://localhost:3000
- **Tracing**: Use Zipkin at http://localhost:9411 to trace requests

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes and write tests
4. **Commit** your changes (`git commit -m 'Add amazing feature'`)
5. **Push** to the branch (`git push origin feature/amazing-feature`)
6. **Open** a Pull Request

### Code Quality

Run before committing:

```bash
# Format code
mvn spotless:apply

# Run static analysis
mvn clean verify -DskipTests

# Run tests
mvn test
```

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## ✨ Support & Questions

- **Report Issues**: Open a GitHub issue with detailed description
- **Ask Questions**: Create a GitHub discussion
- **Security**: Report security vulnerabilities privately

---

## 🎯 Next Steps

After starting the project:

1. ✅ **Verify everything is running**: http://localhost:8080/actuator/health
2. ✅ **Open Swagger UI**: http://localhost:8080/swagger-ui.html
3. ✅ **Login with demo account**: `demo.customer@example.com` / `password123`
4. ✅ **Test API endpoints**: Use Swagger or cURL commands
5. ✅ **Open Frontend**: http://localhost:5173
6. ✅ **Browse documentation**: Check `docs/` folder for detailed guides

---

**Happy coding! 🚀**

---

_Last updated: May 2026 | Version: 1.0.0_
