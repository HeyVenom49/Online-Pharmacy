# Online Pharmacy - Frontend Complete Guide

## Tech Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand (with persist middleware)
- **Routing**: React Router v6
- **HTTP Client**: Axios (via apiClient)
- **Notifications**: Custom ToastContext
- **Icons**: lucide-react

## Project Structure
```
online-pharmacy-frontend/
├── src/
│   ├── api/                    # API layer (Axios-based)
│   │   ├── auth.ts             # Authentication API calls
│   │   ├── catalog.ts          # Medicine/category API calls
│   │   ├── cart.ts             # Cart operations
│   │   ├── orders.ts           # Order management
│   │   ├── address.ts          # Address management
│   │   └── prescription.ts     # Prescription uploads
│   ├── components/
│   │   ├── shared/
│   │   │   └── Navbar.tsx      # Main navigation bar
│   │   └── ui/                 # Reusable UI components
│   │       ├── Button.tsx      # Button component
│   │       ├── Card.tsx        # Card container
│   │       ├── ConfirmModal.tsx # Confirmation dialogs
│   │       ├── Input.tsx       # Input fields
│   │       └── Modal.tsx       # Modal wrapper
│   ├── context/
│   │   └── ToastContext.tsx     # Toast notification system
│   ├── hooks/
│   │   ├── index.ts            # Hook exports
│   │   ├── useAuth.ts          # Auth helper hook
│   │   ├── useCart.ts          # Cart helper hook
│   │   ├── useFetch.ts         # Data fetching hook
│   │   └── useLocalStorage.ts  # LocalStorage hook
│   ├── layouts/
│   │   ├── Layout.tsx          # Main app layout (with mobile nav)
│   │   └── AdminLayout.tsx     # Admin dashboard layout
│   ├── lib/
│   │   ├── apiClient.ts        # Axios instance with interceptors
│   │   ├── cn.ts               # ClassName merge utility
│   │   ├── errorMessage.ts     # Error extraction utility
│   │   └── utils.ts            # General utilities
│   ├── pages/                  # All route pages
│   │   ├── HomePage.tsx        # Landing page with medicine listing
│   │   ├── LoginPage.tsx       # Login with OTP support
│   │   ├── SignupPage.tsx      # Registration with OTP
│   │   ├── ForgotPasswordPage.tsx # Password reset flow
│   │   ├── ProfilePage.tsx     # User profile
│   │   ├── EditProfilePage.tsx # Profile editing
│   │   ├── AddressPage.tsx     # Address management
│   │   ├── MedicineDetailPage.tsx # Medicine info with prescription
│   │   ├── CartPage.tsx        # Shopping cart
│   │   ├── CheckoutPage.tsx    # Order checkout
│   │   ├── OrdersPage.tsx      # User order history
│   │   ├── OrderDetailsPage.tsx # Order tracking with timeline
│   │   ├── WishlistPage.tsx    # Saved medicines
│   │   ├── NotificationsPage.tsx # User notifications
│   │   ├── AdminDashboard.tsx  # Admin stats dashboard
│   │   ├── AdminMedicinesPage.tsx # Medicine management
│   │   ├── AdminOrdersPage.tsx # Order management for admin
│   │   └── AddMedicinePage.tsx # Add/edit medicine form
│   ├── store/                  # Zustand stores
│   │   ├── authStore.ts        # Authentication state
│   │   ├── cartStore.ts        # Cart state
│   │   ├── productStore.ts     # Product filters/sorting
│   │   └── userPrefsStore.ts   # User preferences (wishlist)
│   ├── types/
│   │   └── index.ts            # All TypeScript type definitions
│   ├── utils/
│   │   └── medicineImage.ts    # Medicine image utility
│   ├── App.tsx                 # Main routing config
│   └── main.tsx                # Entry point
```

## Pages Overview

### Public Pages
| Page | Path | Description |
|------|------|-------------|
| HomePage | `/` | Medicine listing with search, category filter, sorting, infinite scroll |
| LoginPage | `/login` | Email/password login with OTP verification flow |
| SignupPage | `/signup` | User registration with OTP verification |
| ForgotPasswordPage | `/forgot-password` | Password reset with OTP |
| MedicineDetailPage | `/medicines/:id` | Medicine details, prescription upload, add to cart |

### Protected User Pages
| Page | Path | Description |
|------|------|-------------|
| ProfilePage | `/profile` | User profile with stats and quick links |
| EditProfilePage | `/profile/edit` | Edit name, email, mobile |
| AddressPage | `/addresses` | CRUD addresses, set default |
| CartPage | `/cart` | View cart, update quantities, remove items |
| CheckoutPage | `/checkout` | Select address, payment method, place order |
| OrdersPage | `/orders` | Order history with status tabs |
| OrderDetailsPage | `/orders/:id` | Order tracking timeline, cancel order |
| WishlistPage | `/wishlist` | Saved medicines for later |
| NotificationsPage | `/notifications` | User notifications list |

### Admin Pages (require ADMIN role)
| Page | Path | Description |
|------|------|-------------|
| AdminDashboard | `/admin/dashboard` | Stats cards, revenue chart, order status buckets |
| AdminMedicinesPage | `/admin/medicines` | Manage medicines, stock status, category filter |
| AdminOrdersPage | `/admin/orders` | All orders, search, status filter, payment decisions |
| AddMedicinePage | `/admin/medicines/add` | Add new medicine form |
| Edit Medicine | `/admin/medicines/:id/edit` | Edit existing medicine |

## API Layer

### Base Configuration (`lib/apiClient.ts`)
- Axios instance with base URL `/` (proxied to backend)
- Request interceptor: attaches `Authorization: Bearer <token>` header
- Response interceptor: handles token expiration, logs errors
- Proxy configured in `vite.config.ts` to `http://localhost:8080`

### API Modules

#### `api/auth.ts` - Authentication
| Function | Endpoint | Description |
|----------|----------|-------------|
| `login(data)` | `POST /api/auth/login` | Login with email/password |
| `signupWithOtp(data)` | `POST /api/auth/signup/otp` | Request signup OTP |
| `verifySignupOtp(data)` | `POST /api/auth/signup/verify` | Verify signup OTP |
| `verifyLoginOtp(data)` | `POST /api/auth/login/otp` | Verify login OTP |
| `completeOtpLogin(email)` | `POST /api/auth/login/otp/complete` | Complete OTP login |
| `requestPasswordReset(data)` | `POST /api/auth/password-reset/request` | Request password reset OTP |
| `resetPassword(data)` | `POST /api/auth/password-reset/confirm` | Confirm password reset |

#### `api/catalog.ts` - Medicine Catalog
| Function | Endpoint | Description |
|----------|----------|-------------|
| `getMedicines(page, size)` | `GET /api/catalog/medicines` | Paginated medicine list |
| `searchMedicines(filters, page, size)` | `GET /api/catalog/medicines/search` | Search with filters |
| `getMedicineById(id)` | `GET /api/catalog/medicines/:id` | Single medicine details |
| `getCategories()` | `GET /api/catalog/categories` | All categories |

#### `api/cart.ts` - Shopping Cart
| Function | Endpoint | Description |
|----------|----------|-------------|
| `getCart()` | `GET /api/cart` | Get current cart |
| `addToCart(data)` | `POST /api/cart/items` | Add item to cart |
| `updateCartItem(itemId, qty)` | `PUT /api/cart/items/:itemId` | Update quantity |
| `removeCartItem(itemId)` | `DELETE /api/cart/items/:itemId` | Remove item |
| `clearCart()` | `DELETE /api/cart` | Clear all items |

#### `api/orders.ts` - Orders
| Function | Endpoint | Description |
|----------|----------|-------------|
| `getOrders()` | `GET /api/orders` | User's orders |
| `getOrderById(id)` | `GET /api/orders/:id` | Order details |
| `checkout(data)` | `POST /api/orders/checkout` | Place order |
| `updateStatus(id, status)` | `PUT /api/orders/:id/status` | Update order status |
| `cancelOrder(id)` | `PUT /api/orders/:id/status?status=CUSTOMER_CANCELLED` | Cancel order |
| `uploadPrescription(orderId, file)` | `POST /api/orders/:id/prescription` | Upload prescription |

#### `api/address.ts` - Address Management
| Function | Endpoint | Description |
|----------|----------|-------------|
| `getAddresses()` | `GET /api/addresses` | User's addresses |
| `addAddress(data)` | `POST /api/addresses` | Add new address |
| `updateAddress(id, data)` | `PUT /api/addresses/:id` | Update address |
| `deleteAddress(id)` | `DELETE /api/addresses/:id` | Delete address |
| `setDefault(id)` | `PUT /api/addresses/:id/default` | Set as default |

#### `api/prescription.ts` - Prescriptions
| Function | Endpoint | Description |
|----------|----------|-------------|
| `uploadPrescription(orderId, file)` | `POST /api/orders/:id/prescription` | Upload prescription file |
| `getPrescriptionStatus(orderId)` | `GET /api/orders/:id/prescription` | Check prescription status |

## State Management (Zustand Stores)

### `authStore.ts` - Authentication State
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  // Actions
  login(email, password): Promise<{requiresOtp, email}>
  loginWithOtp(email, otpCode): Promise<User>
  signup(name, email, password, mobile): Promise<{requiresOtp, email}>
  verifySignupOtp(email, otpCode, name, password, mobile): Promise<void>
  resetPassword(email, otpCode, newPassword): Promise<void>
  requestPasswordReset(email): Promise<void>
  logout(): void
  setUser(user): void
  clearError(): void
}
```
- Persisted to localStorage (`auth-storage`)
- Stores: `user`, `token`, `isAuthenticated`

### `cartStore.ts` - Cart State
```typescript
interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  // Actions
  fetchCart(): Promise<void>
  addToCart(medicineId, quantity): Promise<void>
  updateItem(itemId, quantity): Promise<void>
  removeItem(itemId): Promise<void>
  clearCart(): Promise<void>
}
```

### `productStore.ts` - Product Filters
```typescript
interface ProductState {
  filters: MedicineSearchFilters;
  sortBy: string;
  // Actions
  setFilters(filters): void
  setSortBy(sortBy): void
  resetFilters(): void
}
```

### `userPrefsStore.ts` - User Preferences
```typescript
interface UserPrefsState {
  wishlist: number[]; // medicine IDs
  recentlyViewed: number[]
  // Actions
  toggleWishlist(id): void
  addToRecentlyViewed(id): void
  isInWishlist(id): boolean
}
```
- Persisted to localStorage (`user-prefs`)

## TypeScript Types (`types/index.ts`)

### Core Types
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: 'USER' | 'ADMIN';
  status: string;
}

interface Medicine {
  id: number;
  name: string;
  genericName: string;
  brand: string;
  categoryId: number;
  categoryName: string;
  price: number;
  discountedPrice: number;
  stock: number;
  requiresPrescription: boolean;
  imageUrl: string;
  rating: number;
  numReviews: number;
}

interface MedicineDetail extends Medicine {
  description: string;
  ingredients: string;
  sideEffects: string;
  manufacturer: string;
  dosage: string;
}

interface Order {
  id: number;
  userId: number;
  status: OrderStatus;
  items: OrderItem[];
  grandTotal: number;
  addressSnapshot: string;
  orderedAt: string;
  paymentMode: string;
  paymentStatus: string;
}

type OrderStatus =
  | 'DRAFT_CART'
  | 'CHECKOUT_STARTED'
  | 'PRESCRIPTION_PENDING'
  | 'PRESCRIPTION_APPROVED'
  | 'PRESCRIPTION_REJECTED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'PACKED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CUSTOMER_CANCELLED'
  | 'ADMIN_CANCELLED'
  | 'PAYMENT_FAILED';

interface Address {
  id: number;
  userId: number;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  isDefault: boolean;
}
```

## Key Features Implemented

### 1. Authentication Flow
- JWT-based auth with HTTP-only cookie fallback
- OTP verification for login and signup
- Token stored in localStorage (Bearer token)
- Role-based access (USER vs ADMIN)
- Persistent auth state across page refreshes

### 2. Medicine Catalog
- Paginated medicine listing with infinite scroll
- Search by name/generic name
- Filter by category, price range, requires prescription
- Sort by price (low-high, high-low), rating, name
- Stock status indicators (In Stock, Low Stock, Out of Stock)
- Category-based medicine images (Unsplash/Picsum)

### 3. Shopping Cart
- Add/remove items, update quantities
- Stock validation (prevents ordering more than available)
- Cart total with itemized breakdown
- Persistent cart (stored in backend)

### 4. Order Management
- Multi-step checkout (address selection → payment → review)
- Order status tracking with visual timeline
- Cancel orders (before delivery)
- Order history with status tabs
- Payment modes: COD, UPI, Card, NetBanking

### 5. Prescription Handling
- Upload prescription images (JPEG/PNG/PDF)
- Admin approval/rejection workflow
- Prescription status displayed on order details
- Required for prescription medicines

### 6. Admin Dashboard
- Statistics cards: total orders, revenue, medicines, low stock
- Order status distribution (Pending, Completed, Cancelled)
- Revenue trend chart (6-month history)
- Gradient cards with icons and trend indicators

### 7. Admin Medicine Management
- List all medicines with stock status
- Filter by category, stock status (In Stock, Low Stock, Out of Stock)
- Sort by name, price, stock
- Add/edit medicine with image upload
- Stock level indicators

### 8. Admin Order Management
- View all orders with user emails
- Search by order ID, user email, status
- Filter tabs: All, Active, Completed, Cancelled
- Payment decision workflow (SUCCESS/FAILED/CANCELLED/REFUNDED)
- Update order status (Pack, Ship, Deliver, Cancel)

### 9. Address Management
- CRUD operations for user addresses
- Set default address
- Address validation
- Displayed as snapshots on orders

### 10. UI/UX Features
- Mobile-responsive design with bottom navigation
- Skeleton loaders (replacing spinners)
- Toast notifications for feedback
- ConfirmModal for destructive actions
- Gradient cards and hover effects
- Order tracking timeline with icons

## Component Library (`components/ui/`)

### Button (`Button.tsx`)
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}
```

### Card (`Card.tsx`)
```typescript
// Card - container
// CardHeader - header with optional actions
// CardContent - content area
// CardTitle - title text
// CardDescription - description text
```

### ConfirmModal (`ConfirmModal.tsx`)
```typescript
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}
```

## Hooks

### `useAuth()` - Auth Helper
```typescript
const { user, isAuthenticated, login, logout, ... } = useAuth();
// Wraps authStore with convenient helpers
```

### `useCart()` - Cart Helper
```typescript
const { cart, itemCount, total, addItem, removeItem, ... } = useCart();
// Wraps cartStore with computed values
```

### `useFetch()` - Data Fetching
```typescript
const { data, loading, error, refetch } = useFetch(fetchFunction);
// Generic data fetching with loading/error states
```

## Utility Functions

### `lib/apiClient.ts`
- Axios instance with interceptors
- Auto-attaches JWT token
- Handles 401 unauthorized (redirects to login)
- logs errors to console

### `lib/utils.ts`
- `formatPrice(amount: number): string` - Formats as ₹X,XXX
- `formatDate(date: string): string` - Formats date
- `getInitials(name: string): string` - Gets initials for avatar

### `lib/cn.ts`
- `cn(...inputs): string` - Merges class names (like clsx + twMerge)

### `utils/medicineImage.ts`
- `getMedicineImage(medicine: Medicine): string` - Returns category-based image URL
- Uses Unsplash for known categories, Picsum as fallback

## Routing (`App.tsx`)

### Public Routes
- `/` - HomePage
- `/login` - LoginPage
- `/signup` - SignupPage
- `/forgot-password` - ForgotPasswordPage
- `/medicines/:id` - MedicineDetailPage

### Protected Routes (USER)
- `/profile` - ProfilePage
- `/profile/edit` - EditProfilePage
- `/addresses` - AddressPage
- `/cart` - CartPage
- `/checkout` - CheckoutPage
- `/orders` - OrdersPage
- `/orders/:id` - OrderDetailsPage
- `/wishlist` - WishlistPage
- `/notifications` - NotificationsPage

### Protected Routes (ADMIN)
- `/admin/dashboard` - AdminDashboard
- `/admin/medicines` - AdminMedicinesPage
- `/admin/medicines/add` - AddMedicinePage
- `/admin/medicines/:id/edit` - Edit medicine
- `/admin/orders` - AdminOrdersPage

## Responsive Design

### Breakpoints
- Mobile: `< 768px` - Bottom navigation, stacked cards
- Tablet: `768px - 1024px` - Responsive grid
- Desktop: `> 1024px` - Full layout with sidebar

### Mobile Features
- Bottom navigation bar (Home, Search, Cart, Orders, Profile)
- Horizontal scroll for tables
- Stacked form fields
- Touch-friendly button sizes

## How to Run

### Prerequisites
- Node.js 18+
- npm or yarn

### Development
```bash
cd online-pharmacy-frontend
npm install
npm run dev    # Starts on http://localhost:5173
```

### Build
```bash
npm run build   # Output in dist/
npm run preview # Preview production build
```

### Type Checking
```bash
npx tsc --noEmit
```

## Environment Configuration
- `vite.config.ts` proxies `/api`, `/internal` to `http://localhost:8080`
- API base URL configured in `lib/apiClient.ts`
- JWT token stored in localStorage as `token`
- User data stored in localStorage as `user`

## Known Patterns
- All API calls use `apiClient` (Axios instance)
- Error handling: `getErrorMessage(error)` from `lib/errorMessage.ts`
- Loading states: Use skeleton loaders (`.skeleton` CSS class)
- Notifications: Use `useToast()` from ToastContext
- Confirmation dialogs: Use `ConfirmModal` component
- Forms: Controlled components with TypeScript types
- Images: `getMedicineImage()` utility for consistent image handling
