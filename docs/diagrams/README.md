# Online Pharmacy - UML Diagrams

This directory contains Mermaid UML diagrams for the Online Pharmacy system.

## Files

### High-Level Design (HLD)
| File | Description |
|------|-------------|
| `hld-system-context.mmd` | System context with users, external services, and infrastructure |
| `hld-microservices.mmd` | Detailed microservices architecture with all services and infrastructure |
| `project-structure.mmd` | Full project structure showing Maven modules and frontend components |

### Low-Level Design (LLD)
| File | Description |
|------|-------------|
| `lld-identity-service.mmd` | Identity Service: Auth, User, Address, OTP, Notifications |
| `lld-catalog-service.mmd` | Catalog Service: Medicine, Category, Inventory, Prescription |
| `lld-orders-service.mmd` | Orders Service: Cart, Order, Payment |
| `lld-admin-service.mmd` | Admin Service: Dashboard, KPI aggregation |
| `lld-notifications-service.mmd` | Notifications Service: Email, In-App, Event listeners |

### Sequence Diagrams
| File | Description |
|------|-------------|
| `sequence-auth.mmd` | Login, Signup, OTP, and Logout flows |
| `sequence-checkout.mmd` | Add to cart, checkout, payment, cancellation |

### Common Types
| File | Description |
|------|-------------|
| `common-events.mmd` | Event classes (UserRegistered, OrderPlaced, etc.) |
| `common-types.mmd` | Enums and response types |
| `database-schema.mmd` | Entity relationship diagram (ERD) |
| `frontend-components.mmd` | Frontend component hierarchy |

## Rendering

Open any `.mmd` file at:
- [Mermaid Live Editor](https://mermaid.live)
- VS Code with Mermaid extension
- GitHub Markdown (native support)