# Online Pharmacy Frontend Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Key Concepts Explained](#key-concepts-explained)
5. [API Integration](#api-integration)
6. [State Management](#state-management)
7. [Custom Hooks](#custom-hooks)
8. [Fixes & Updates](#fixes--updates)

---

## Project Overview

The Online Pharmacy frontend is a React-based web application that allows customers to browse medicines, add them to cart, place orders, and manage their profiles. It also includes an admin dashboard for managing medicines and orders.

**Running at:** http://localhost:5173/

---

## Tech Stack

| Technology | Purpose |
|-------------|---------|
| **React 18** | UI Framework |
| **Vite** | Build tool & Dev server |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **Zustand** | State management |
| **Axios** | HTTP client |
| **React Router** | Navigation |
| **Lucide React** | Icons |

---

## Project Structure

```
online-pharmacy-frontend/src/
├── api/                    # API client functions
│   ├── auth.ts            # Authentication endpoints
│   ├── cart.ts           # Shopping cart endpoints
│   ├── catalog.ts       # Medicine/category endpoints
│   └── orders.ts         # Order endpoints
├── components/
│   ├── shared/          # Shared components
│   │   └── Navbar.tsx   # Navigation bar
│   └── ui/             # Reusable UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Input.tsx
├── hooks/               # Custom React hooks
│   ├── useAuth.ts      # Authentication logic
│   ├── useCart.ts     # Cart logic
│   ├── useFetch.ts    # Generic fetch with loading/error
│   └── useLocalStorage.ts
├── layouts/            # Page layouts
│   └── Layout.tsx
├── lib/                # Utilities
│   ├── apiClient.ts   # Axios configuration
│   ├── cn.ts         # Class name merger
│   └── utils.ts      # Helper functions
├── pages/              # Page components
│   ├── HomePage.tsx          # Medicine listing (customer)
│   ├── LoginPage.tsx        # User login
│   ├── SignupPage.tsx       # User registration
│   ├── ForgotPasswordPage.tsx
│   ├── CartPage.tsx          # Shopping cart
│   ├── CheckoutPage.tsx     # Order checkout
│   ├── OrdersPage.tsx       # User orders
│   ├── OrderDetailsPage.tsx
│   ├── ProfilePage.tsx     # User profile
│   ├── NotificationsPage.tsx
│   ├── AdminDashboard.tsx  # Admin home
│   ├── AdminMedicinesPage.tsx
│   ├── AdminOrdersPage.tsx
│   └── AddMedicinePage.tsx  # Add/edit medicine
├── store/              # Zustand stores
│   ├── authStore.ts    # User authentication state
│   ├── cartStore.ts    # Shopping cart state
│   └── productStore.ts # Medicines/categories state
├── types/             # TypeScript interfaces
│   └── index.ts
├── App.tsx            # Main app component
└── main.tsx          # Entry point
```

---

## Key Concepts Explained

### 1. API Client (`lib/apiClient.ts`)

**What is it?** A pre-configured Axios instance that handles all HTTP requests to the backend.

**Why use it?**
- Centralized configuration (base URL, headers, interceptors)
- Automatic token handling
- Error handling
- Request/response logging

**How to use:**
```typescript
import apiClient from './lib/apiClient';

// GET request
const response = await apiClient.get('/api/catalog/medicines');

// POST request
const response = await apiClient.post('/api/orders/cart/items', { medicineId: 1, quantity: 2 });

// With headers
const response = await apiClient.get('/api/user', {
  headers: { Authorization: `Bearer ${token}` }
});
```

### 2. Zustand Stores (`store/*.ts`)

**What is it?** A state management library that's simpler than Redux. Each store holds application state.

**Why use it?**
- Minimal boilerplate
- Easy to understand
- Supports async actions
- Works great with TypeScript

**How each store works:**

#### authStore.ts
```typescript
// Usage in component
const { user, login, logout, isAuthenticated } = useAuthStore();

// Inside store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}
```

#### cartStore.ts
```typescript
// Usage
const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = useCartStore();
```

#### productStore.ts
```typescript
// Usage
const { medicines, categories, fetchMedicines, fetchCategories } = useProductStore();
```

### 3. TypeScript Types (`types/index.ts`)

**What is it?** Centralized type definitions for all API responses and data structures.

**Why use it?**
- Type safety across the app
- Auto-complete in IDE
- Easy refactoring

**Key types:**
```typescript
// Medicine from API
interface Medicine {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  categoryName: string;
  price: number;
  mrp: number;
  requiresPrescription: boolean;
  stock: number;
  inStock: boolean;
  // ... more fields
}

// API Response format
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Pagination
interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;  // current page
  first: boolean;
  last: boolean;
}
```

---

## API Integration

### API Files and Their Purpose

#### `api/auth.ts`
Handles user authentication:
- `login()` - Regular email/password login
- `signup()` - User registration
- `requestPasswordReset()` - OTP for password reset
- `verifyLoginOtp()` - Verify OTP for login
- `getCurrentUser()` - Get logged-in user info
- `logout()` - Sign out

#### `api/catalog.ts`
Handles medicines and categories:
- `getMedicines(page, size)` - Get all medicines
- `searchMedicines(filters, page, size)` - Search with filters
- `getMedicineById(id)` - Get single medicine
- `getCategories()` - Get all categories

#### `api/cart.ts`
Shopping cart operations:
- `getCart()` - Get user's cart
- `addToCart(medicineId, quantity)` - Add item
- `updateCartItem(itemId, quantity)` - Update quantity
- `removeFromCart(itemId)` - Remove item
- `clearCart()` - Empty cart

#### `api/orders.ts`
Order management:
- `createOrder(address, pincode, slot)` - Place order
- `getOrders()` - Get user's orders
- `getOrderById(id)` - Get order details
- `cancelOrder(id)` - Cancel order

---

## State Management (Zustand)

### How Zustand Works

```typescript
// 1. Create a store
import { create } from 'zustand';

interface ProductStore {
  medicines: Medicine[];
  loading: boolean;
  fetchMedicines: () => Promise<void>;
}

const useProductStore = create<ProductStore>((set) => ({
  medicines: [],
  loading: false,
  fetchMedicines: async () => {
    set({ loading: true });
    const data = await catalogApi.getMedicines();
    set({ medicines: data, loading: false });
  }
}));

// 2. Use in component
function MedicineList() {
  const { medicines, fetchMedicines } = useProductStore();
  
  useEffect(() => {
    fetchMedicines();
  }, []);
  
  return medicines.map(m => <div>{m.name}</div>);
}
```

### Why Zustand Instead of Redux?

| Feature | Zustand | Redux |
|---------|---------|-------|
| Boilerplate | Minimal | Large |
| Learning curve | Easy | Steep |
| Async actions | Native | Need middleware |
| Bundle size | Small | Large |
| Code amount | ~50 lines | ~200+ lines |

---

## Custom Hooks (`hooks/`)

### Hooks Available:

#### 1. `useAuth.ts`
```typescript
const { user, login, logout, getToken, getRole, isAdmin } = useAuth();

// OTP authentication
const { loading, error, requestLoginOtp, verifyLoginOtp, completeOtpLogin } = useOtpAuth();
```

#### 2. `useCart.ts`
```typescript
const { 
  cart,           // Cart data
  loading,        // Loading state
  error,          // Error message
  refetch,        // Reload cart
  addToCart,      // Add item
  updateQuantity, // Change quantity
  removeItem,    // Remove item
  clearCart,      // Empty cart
  itemCount,     // Total items
  total           // Total price
} = useCart();
```

#### 3. `useFetch.ts`
```typescript
// Simple fetch
const { data, loading, error, refetch } = useFetch('/api/medicines');

// With options
const { data, loading, error, refetch } = useFetch('/api/medicines', {
  immediate: true,
  onSuccess: (data) => console.log('Loaded!', data),
  onError: (err) => console.error(err)
});

// Mutations
const { loading, error, mutate } = useMutate();
await mutate('/api/orders', { medicineId: 1, quantity: 2 }, 'post');
```

#### 4. `useLocalStorage.ts`
```typescript
// Persistent storage
const [theme, setTheme] = useLocalStorage('theme', 'dark');

// Session storage
const [sessionData, setSession] = useSessionStorage('session', {});
```

---

## Fixes & Updates

### 1. API Response Format Fix

**Problem:** Frontend expected `{ content: [...] }` but backend returned `{ success, data: [...] }`.

**Solution:** Updated `productStore.ts` to handle the actual format:
```typescript
// Before (broken)
medicines: response.content

// After (fixed)
medicines: response.data?.data || response.data
```

### 2. Edit Medicine Button

**Problem:** Edit button in AdminMedicinesPage had no onClick handler.

**Solution:**
1. Added `handleEdit()` function
2. Added route `/admin/medicines/edit/:medicineId`
3. Updated AddMedicinePage to support edit mode (fetch existing data, PUT request)

### 3. Delete Medicine Button

**Problem:** Delete was soft-delete (set active=false), not removed from database.

**Solution:**
1. Added `deleteMedicinePermanently()` to backend
2. Added delete button (Trash2 icon) in table
3. Frontend now shows confirmation dialog

### 4. Custom Hooks Created

Created reusable hooks in `hooks/` folder:
- `useAuth` - Authentication logic
- `useOtpAuth` - OTP login/signup
- `useCart` - Shopping cart
- `useFetch` - Generic data fetching
- `useMutate` - POST/PUT/DELETE operations
- `useLocalStorage` - Persistent state

### 5. undefined Check Fix

**Problem:** `medicines.length` threw error when medicines was undefined.

**Solution:** Added null check:
```typescript
// Before
medicines.length === 0

// After
!medicines || medicines.length === 0
```

---

## Common Issues & Solutions

### Issue: "Cannot read properties of undefined"
**Solution:** Add null checks before accessing array/object properties:
```typescript
const items = data?.items || [];
items.map(...)
```

### Issue: API returns 500 Internal Server Error
**Solution:** Check backend is running and JWT_SECRET is configured in Docker.

### Issue: Cart shows empty
**Solution:** Ensure user is logged in. Cart requires authentication token.

---

## Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## File Naming Conventions

| File Type | Convention | Example |
|----------|-----------|---------|
| Pages | PascalCase | `HomePage.tsx` |
| Components | PascalCase | `Button.tsx` |
| Store | camelCase + Store | `authStore.ts` |
| API | camelCase | `catalog.ts` |
| Hooks | camelCase | `useAuth.ts` |
| Types | camelCase | `index.ts` |
| Utils | camelCase | `utils.ts` |

---

## Quick Reference

### Making an API Call
```typescript
// 1. Use existing API function
import { catalogApi } from './api/catalog';
const medicines = await catalogApi.getMedicines(0, 20);

// 2. Or use API client directly
import apiClient from './lib/apiClient';
const response = await apiClient.get('/api/catalog/medicines');
```

### Accessing State
```typescript
// In any component
const { user, isAuthenticated } = useAuthStore();
const { cart } = useCartStore();
const { medicines } = useProductStore();
```

### Navigation
```typescript
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/some-page');
  };
}
```