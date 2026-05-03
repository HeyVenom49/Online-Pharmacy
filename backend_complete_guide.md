# Online Pharmacy - Backend Complete Guide

## Architecture Overview
Microservices architecture with Spring Boot, backed by:
- **Service Discovery**: Netflix Eureka (`pharmacy-eureka`)
- **Configuration**: Spring Cloud Config (`pharmacy-config`)
- **API Gateway**: Spring Cloud Gateway (`pharmacy-gateway`)
- **Message Broker**: RabbitMQ for async event communication
- **Cache**: Redis for OTP storage and JWT blacklisting
- **Database**: PostgreSQL (per service)
- **Outbox Pattern**: For reliable event publishing

## Microservices

### 1. Pharmacy Eureka (`pharmacy-eureka`)
**Port**: 8761
**Purpose**: Service discovery server
- All microservices register here
- Enables service-to-service discovery

### 2. Pharmacy Config (`pharmacy-config`)
**Port**: 8888
**Purpose**: Centralized configuration server
- Serves configuration from Git or local files
- Each service fetches config on startup

### 3. Pharmacy Gateway (`pharmacy-gateway`)
**Port**: 8080
**Purpose**: API Gateway / Entry point
- Routes requests to downstream services
- JWT authentication filter
- Rate limiting filter
- OpenAPI aggregation from all services
- Swagger UI available at `/webjars/swagger-ui/index.html`

**Key Files**:
- `PharmacyGatewayApplication.java` - Main class
- `JwtAuthenticationFilter.java` - Validates JWT tokens
- `RateLimitingFilter.java` - Rate limiting via Redis
- `OpenApiAggregator.java` - Aggregates OpenAPI specs

**Route Configuration** (application.yml):
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: identity
          uri: http://localhost:8081
          predicates:
            - Path=/api/auth/**,/api/addresses/**,/api/users/**,/internal/users/**
        - id: catalog
          uri: http://localhost:8082
          predicates:
            - Path=/api/catalog/**,/internal/catalog/**,/api/prescriptions/**
        - id: orders
          uri: http://localhost:8083
          predicates:
            - Path=/api/orders/**,/api/cart/**,/internal/orders/**
        - id: notifications
          uri: http://localhost:8084
          predicates:
            - Path=/api/notifications/**
        - id: admin
          uri: http://localhost:8085
          predicates:
            - Path=/admin/**
```

### 4. Pharmacy Identity (`pharmacy-identity`)
**Port**: 8081
**Purpose**: User authentication, registration, profile management
**Database**: `pharmacy_identity`

**Entities**:
- `User` - id, name, email, passwordHash, mobile, role, status
- `Address` - id, userId, line1, line2, city, state, pincode, landmark, isDefault
- `OtpVerification` - id, email, otpCode, otpType, expiresAt, verified
- `Notification` - id, userId, type, title, message, read, createdAt

**Controllers**:
| Controller | Path | Description |
|------------|------|-------------|
| `AuthController` | `/api/auth` | Login, signup, OTP, password reset |
| `AddressController` | `/api/addresses` | CRUD addresses |
| `NotificationController` | `/api/notifications` | User notifications |
| `InternalIdentityController` | `/internal/users` | Internal user lookups |

**AuthController Endpoints**:
| Method | Path | Description |
|--------|------|-------------|
| POST | `/signup` | Register new user |
| POST | `/signup/otp/generate` | Send signup OTP |
| POST | `/signup/otp/verify` | Verify OTP + complete signup |
| POST | `/login` | Login (sends OTP) |
| POST | `/otp/generate` | Generate login OTP |
| POST | `/otp/verify` | Verify OTP |
| POST | `/verify-otp-login` | Complete OTP login, return JWT |
| POST | `/password-reset/request` | Request password reset OTP |
| POST | `/password-reset/confirm` | Confirm reset with OTP |
| GET | `/me` | Get current user profile |
| PUT | `/profile` | Update profile |
| POST | `/logout` | Blacklist JWT token |

**Services**:
- `AuthService` - Authentication logic, JWT generation
- `OtpService` - OTP generation, verification, Redis storage
- `AddressService` - Address CRUD operations
- `NotificationService` - Notification management
- `JwtBlacklistService` - JWT token blacklisting via Redis

**Key DTOs**:
```java
// SignupRequest
{ name: String, email: String, password: String, mobile: String }

// LoginRequest
{ email: String, password: String }

// AuthResponse
{ userId: Long, name: String, email: String, mobile: String, role: Role, token: String }

// OtpRequest
{ email: String, otpType: OtpType }

// OtpVerificationRequest
{ email: String, otpCode: String, otpType: OtpType }
```

### 5. Pharmacy Catalog (`pharmacy-catalog`)
**Port**: 8082
**Purpose**: Medicine catalog, categories, inventory, prescriptions
**Database**: `pharmacy_catalog`

**Entities**:
- `Medicine` - id, name, genericName, brand, categoryId, price, discountedPrice, stock, requiresPrescription, imageUrl, description, ingredients, sideEffects, manufacturer, dosage
- `Category` - id, name, description
- `Inventory` - id, medicineId, batchNumber, quantity, expiryDate, receivedDate
- `Prescription` - id, userId, orderId, fileName, filePath, status, reviewedBy, reviewedAt, rejectionReason

**Controllers**:
| Controller | Path | Description |
|------------|------|-------------|
| `MedicineController` | `/api/catalog/medicines` | Medicine CRUD, search |
| `CategoryController` | `/api/catalog/categories` | Category management |
| `InventoryController` | `/api/catalog/inventory` | Inventory batches |
| `PrescriptionController` | `/api/prescriptions` | Prescription upload/review |
| `InternalCatalogController` | `/internal/catalog` | Internal medicine lookups |

**MedicineController Endpoints**:
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Get all medicines (paginated) |
| GET | `/search` | Search with filters |
| GET | `/{id}` | Get medicine details |
| POST | `/` | Create medicine (ADMIN) |
| POST | `/with-inventory` | Create medicine + inventory (ADMIN) |
| PUT | `/{id}` | Update medicine (ADMIN) |
| DELETE | `/{id}` | Delete medicine (ADMIN) |
| PUT | `/{id}/stock` | Update stock (ADMIN) |

**Medicine Search Filters**:
```java
SearchRequest {
  name: String
  categoryId: Long
  minPrice: Double
  maxPrice: Double
  requiresPrescription: Boolean
  inStock: Boolean
}
```

**Services**:
- `MedicineService` - Medicine CRUD, search with Specification
- `CategoryService` - Category management
- `InventoryService` - Inventory batch management
- `PrescriptionService` - Prescription file handling, approval workflow
- `FileStorageService` - Local file storage for prescription images

**Key Features**:
- JPA Specification for dynamic filtering
- Pagination and sorting support
- Prescription file upload (stored locally)
- Inventory batch tracking with expiry dates
- Stock level management

### 6. Pharmacy Orders (`pharmacy-orders`)
**Port**: 8083
**Purpose**: Shopping cart, order management, payments
**Database**: `pharmacy_orders`

**Entities**:
- `Cart` - id, userId, createdAt, updatedAt
- `CartItem` - id, cartId, medicineId, quantity, unitPrice
- `Order` - id, userId, status, grandTotal, addressSnapshot, orderedAt, paymentMode, paymentStatus, prescriptionId
- `OrderItem` - id, orderId, medicineId, quantity, unitPrice
- `Payment` - id, orderId, paymentMode, status, transactionId, amount, paidAt

**Order Status Flow**:
```
DRAFT_CART → CHECKOUT_STARTED → PRESCRIPTION_PENDING → PRESCRIPTION_APPROVED
    ↓                                                           ↓
PAYMENT_PENDING → PAID → PACKED → OUT_FOR_DELIVERY → DELIVERED
    ↓               ↓
PAYMENT_FAILED   CUSTOMER_CANCELLED / ADMIN_CANCELLED
```

**Controllers**:
| Controller | Path | Description |
|------------|------|-------------|
| `OrderController` | `/api/orders`, `/api/cart` | Cart & order operations |
| `InternalOrdersController` | `/internal/orders` | Internal order lookups |

**OrderController Endpoints**:
| Method | Path | Description |
|--------|------|-------------|
| GET | `/cart` | Get current cart |
| POST | `/cart/items` | Add item to cart |
| PUT | `/cart/items/{itemId}` | Update cart item quantity |
| DELETE | `/cart/items/{itemId}` | Remove item from cart |
| DELETE | `/cart` | Clear cart |
| POST | `/checkout/start` | Initiate checkout |
| POST | `/checkout/payment` | Initiate payment |
| POST | `/checkout/confirm` | Confirm payment, place order |
| GET | `/orders` | Get user's orders |
| GET | `/orders/{id}` | Get order details |
| POST | `/orders/{id}/cancel` | Cancel order |
| PUT | `/orders/{id}/status` | Update order status (ADMIN) |
| POST | `/orders/{id}/prescription` | Upload prescription |
| GET | `/orders/{id}/prescription/status` | Check prescription status |

**Services**:
- `OrderService` - Core order logic, cart management, checkout flow
- `CatalogClient` - Feign client to catalog service

**Event Publishing**:
- `OrderPlacedEvent` - Published when order is placed
- `OrderCancelledEvent` - Published when order is cancelled
- `InventoryReservedEvent` - Published when inventory is reserved
- `InventoryReleasedEvent` - Published when inventory is released

### 7. Pharmacy Notifications (`pharmacy-notifications`)
**Port**: 8084
**Purpose**: Email notifications via RabbitMQ events
**Database**: No database (stateless)

**Components**:
- `EmailController` - REST endpoint for email dispatch
- `NotificationDomainEventListener` - Listens to domain events
- `EmailChannelService` - Sends emails via SMTP
- `NotificationDispatchCoordinator` - Coordinates notification dispatch

**Events Consumed**:
- `OrderPlacedEvent` - Send order confirmation email
- `OrderCancelledEvent` - Send cancellation email
- `PrescriptionApprovedEvent` - Notify prescription approved
- `PrescriptionRejectedEvent` - Notify prescription rejected
- `UserRegisteredEvent` - Send welcome email
- `UserLoggedInEvent` - (Optional) Notify new login

### 8. Pharmacy Admin (`pharmacy-admin`)
**Port**: 8085
**Purpose**: Admin dashboard, aggregated views
**Database**: No database (aggregates from other services)

**Components**:
- `AdminController` - Dashboard stats, aggregated data
- `DashboardService` - Fetches data from other services
- `CatalogClient` - Feign client to catalog service
- `OrdersClient` - Feign client to orders service

**AdminController Endpoints**:
| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/dashboard` | Dashboard statistics |
| GET | `/admin/medicines` | All medicines (internal) |
| GET | `/admin/orders` | All orders (internal) |

**Dashboard DTO**:
```java
DashboardDTO {
  totalOrders: Long
  pendingOrders: Long
  completedOrders: Long
  totalRevenue: Double
  totalMedicines: Long
  lowStockItems: Long
  recentOrders: List<OrderDTO>
  topSellingMedicines: List<MedicineDTO>
}
```

## Common Module (`pharmacy-common`)

Shared code used by all microservices:

### Events (`com.pharmacy.common.events`)
| Event | Description |
|-------|-------------|
| `BaseEvent` | Abstract base class with eventId, timestamp |
| `OrderPlacedEvent` | Order placed with items |
| `OrderCancelledEvent` | Order cancelled |
| `InventoryReservedEvent` | Inventory reserved for order |
| `InventoryReleasedEvent` | Inventory released (cancellation) |
| `PrescriptionApprovedEvent` | Prescription approved |
| `PrescriptionRejectedEvent` | Prescription rejected |
| `UserRegisteredEvent` | User registered |
| `UserLoggedInEvent` | User logged in |

### Enums (`com.pharmacy.common.enums`)
```java
OrderStatus {
  DRAFT_CART, CHECKOUT_STARTED, PRESCRIPTION_PENDING, PRESCRIPTION_APPROVED,
  PRESCRIPTION_REJECTED, PAYMENT_PENDING, PAID, PACKED, OUT_FOR_DELIVERY,
  DELIVERED, CUSTOMER_CANCELLED, ADMIN_CANCELLED, PAYMENT_FAILED
}

PaymentStatus { PENDING, SUCCESS, FAILED, CANCELLED, REFUNDED }

PrescriptionStatus { PENDING, APPROVED, REJECTED }

Role { CUSTOMER, ADMIN }

UserStatus { ACTIVE, INACTIVE, SUSPENDED }
```

### API Response Wrappers (`com.pharmacy.common.api`)
```java
// Standard API response
ApiResponse<T> {
  data: T
  message: String
  timestamp: LocalDateTime
  status: String
}

// Paginated response
ApiPaginatedResponse<T> {
  data: List<T>
  page: Int, size: Int, totalElements: Long, totalPages: Int
  message: String
}
```

### Feign Clients (`com.pharmacy.common.feign`)
- `CatalogFeignClient` - For catalog service calls
- `OrdersFeignClient` - For orders service calls
- `IdentityNotificationFeignClient` - For identity/notification calls
- With fallback factories for resilience

### Outbox Pattern (`com.pharmacy.common.outbox`)
- `OutboxEvent` - Stored in `outbox_events` table
- `OutboxService` - Publishes events to message broker
- `ProcessedEvent` - Tracks processed events (idempotency)

### Utilities (`com.pharmacy.common.util`)
- `JwtUtil` - JWT token generation and validation
- `PharmacyLoggerFactory` - Standardized logging
- `FileUtils` - File operations

### Configuration (`com.pharmacy.common.config`)
- `RabbitMQConfig` - Queue/exchange definitions
- `Resilience4jConfig` - Circuit breaker, retry config
- `SwaggerUiConfig` - OpenAPI/Swagger configuration

### Health Indicators (`com.pharmacy.common.config.actuator`)
- `EurekaHealthIndicator` - Eureka connectivity
- `RabbitMQHealthIndicator` - RabbitMQ connectivity
- `RedisHealthIndicator` - Redis connectivity
- `ServiceDependenciesHealthIndicator` - Dependent services health

## Security

### JWT Authentication Flow
1. User logs in → `POST /api/auth/login` → OTP sent
2. User verifies OTP → `POST /api/auth/verify-otp-login` → JWT returned
3. Frontend stores JWT in localStorage
4. Subsequent requests include `Authorization: Bearer <token>` header
5. Gateway's `JwtAuthenticationFilter` validates token
6. User details extracted and passed downstream via headers (`X-User-Id`, `X-User-Role`, `X-User-Email`)

### Role-Based Access Control
- `@PreAuthorize("hasRole('ADMIN')")` - Admin-only endpoints
- `@PreAuthorize("hasRole('CUSTOMER')")` - Customer-only endpoints
- Gateway filters enforce authentication for protected paths

## Event-Driven Architecture

### RabbitMQ Configuration
**Exchanges**:
- `pharmacy.events` - Topic exchange for all domain events

**Queues**:
- `order.placed` - Order placed events
- `order.cancelled` - Order cancelled events
- `prescription.approved` - Prescription approved events
- `prescription.rejected` - Prescription rejected events
- `user.registered` - User registered events
- `user.logged.in` - User logged in events

**Event Flow Example** (Order Placement):
1. `OrderService` saves order → creates `OutboxEvent` in DB
2. `OutboxService` polls outbox → publishes to RabbitMQ
3. `NotificationDomainEventListener` consumes event → sends email
4. `InventoryService` consumes event → reserves inventory

## Resilience Patterns

### Circuit Breaker (Resilience4j)
- Applied to Feign clients
- Fallback factories return sensible defaults
- Prevents cascade failures

### Retry Pattern
- Automatic retries for transient failures
- Configurable retry attempts and backoff

### Outbox Pattern
- Events stored in DB before publishing
- Guarantees at-least-once delivery
- Prevents event loss on service crash

## How to Run

### Prerequisites
- Java 17+
- Maven 3.8+
- PostgreSQL 14+
- Redis 6+
- RabbitMQ 3.9+

### Database Setup
```sql
CREATE DATABASE pharmacy_identity;
CREATE DATABASE pharmacy_catalog;
CREATE DATABASE pharmacy_orders;
```

### Start Services (in order)
```bash
# 1. Start Eureka
cd online-pharmacy/pharmacy-eureka && mvn spring-boot:run

# 2. Start Config Server
cd online-pharmacy/pharmacy-config && mvn spring-boot:run

# 3. Start Gateway
cd online-pharmacy/pharmacy-gateway && mvn spring-boot:run

# 4. Start Identity Service
cd online-pharmacy/pharmacy-identity && mvn spring-boot:run

# 5. Start Catalog Service
cd online-pharmacy/pharmacy-catalog && mvn spring-boot:run

# 6. Start Orders Service
cd online-pharmacy/pharmacy-orders && mvn spring-boot:run

# 7. Start Notifications Service
cd online-pharmacy/pharmacy-notifications && mvn spring-boot:run

# 8. Start Admin Service
cd online-pharmacy/pharmacy-admin && mvn spring-boot:run
```

### Using Docker Compose (Recommended)
```bash
cd online-pharmacy
docker-compose up -d
```

## API Documentation

### Swagger UI
Access at: `http://localhost:8080/webjars/swagger-ui/index.html`
- Aggregated from all services
- Interactive API testing

### OpenAPI Endpoints
- Gateway: `http://localhost:8080/v3/api-docs`
- Identity: `http://localhost:8081/v3/api-docs`
- Catalog: `http://localhost:8082/v3/api-docs`
- Orders: `http://localhost:8083/v3/api-docs`
- Notifications: `http://localhost:8084/v3/api-docs`
- Admin: `http://localhost:8085/v3/api-docs`

## Key Design Decisions

1. **Database per Service**: Each microservice owns its data
2. **Event-Driven**: Loose coupling via RabbitMQ events
3. **Outbox Pattern**: Reliable event publishing
4. **JWT Propagation**: User context passed via gateway headers
5. **Feign Clients**: Declarative REST clients with fallback
6. **Redis**: Used for OTP storage and JWT blacklisting
7. **Specification Pattern**: Dynamic queries in catalog service

## Environment Configuration

Each service has `application.yml` with:
- Server port
- Database config (PostgreSQL)
- Eureka server address
- Config server address
- RabbitMQ config
- Redis config
- JWT secret

Example (`pharmacy-identity`):
```yaml
server:
  port: 8081
spring:
  application:
    name: identity-service
  datasource:
    url: jdbc:postgresql://localhost:5432/pharmacy_identity
    username: postgres
    password: password
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
  data:
    redis:
      host: localhost
      port: 6379
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
jwt:
  secret: my-secret-key
  expiration: 86400
```
