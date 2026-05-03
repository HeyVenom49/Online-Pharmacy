# Online Pharmacy - Complete Line-by-Line Code Explanation

## FRONTEND (online-pharmacy-frontend/src/)

---

### 1. `main.tsx` (Entry Point)

**Lines 1-4**: Imports React 18's `createRoot` function, global CSS, and the App component.
**Line 5**: Logs startup message to browser console.
**Lines 7-11**: Finds the `<div id="root">` HTML element. Throws error if missing.
**Line 13**: Logs that root element was found.
**Line 15**: Creates a React root and renders the `<App />` component into it.
**Line 17**: Logs completion message.

---

### 2. `App.tsx` (Routing Configuration)

**Line 1**: Imports routing components from React Router v6.
**Line 2**: Imports the authentication Zustand store.
**Lines 3-22**: Imports all page components and layouts.
**Line 23**: Imports Toast context for notifications.

**Lines 25-35** (`ProtectedRoute`): A guard component that checks if user is authenticated (from store OR localStorage). If authenticated, renders child components; otherwise redirects to `/login`.

**Lines 37-57** (`AdminRoute`): A stricter guard that checks authentication AND verifies the user has `role === 'ADMIN'`. Redirects non-admins to `/`.

**Lines 59-169** (`App`): Main app component wrapped in `ToastProvider` and `BrowserRouter`. Defines all routes:
- **Line 64**: Root route uses `Layout` as parent (renders Navbar + Footer + `<Outlet />`)
- **Lines 65-68**: Public routes (home, login, signup, forgot-password)
- **Lines 69-109**: Protected user routes (cart, checkout, orders, profile, addresses, wishlist)
- **Lines 110-158**: Admin routes (dashboard, medicines CRUD, orders) wrapped in `AdminRoute` and `AdminLayout`
- **Lines 159-163**: Medicine detail page (protected)

---

### 3. `types/index.ts` (All TypeScript Interfaces)

**Lines 3-10** (`User`): User account shape with id, name, email, mobile, role ('CUSTOMER' | 'ADMIN'), and status.
**Lines 12-22** (`AuthResponse`): Login/signup response containing JWT token, user details, and optional OTP flag.
**Lines 26-45** (OTP types): `OtpType` enum, `OtpRequest`, `OtpVerificationRequest`, `OtpResponse` for OTP flows.
**Lines 47-57** (`SignupRequest`, `LoginRequest`): Form input types for auth.
**Lines 61-75** (`PageResponse`, `ApiResponse`): Generic API response wrappers for pagination and data.
**Lines 79-95** (`Medicine`): Medicine product with id, name, description, category, price, mrp, prescription flag, stock, dosage info, manufacturer.
**Lines 97-110** (`MedicineDetail`, `Inventory`): Extended medicine with inventory batch list. Each batch has batch number, quantity, manufacture/expiry dates, expired/expiringSoon flags.
**Lines 112-117** (`Category`): Product category with id, name, description, imageUrl.
**Lines 121-138** (`Cart`, `CartItem`, `AddToCartRequest`): Shopping cart with items array, subtotal, totalItems. Each item has medicineId, quantity, unitPrice, subtotal.
**Lines 149-165** (`OrderStatus`): Union type of 14 possible order states (DRAFT_CART through REFUND_COMPLETED).
**Lines 167-169** (`PaymentStatus`, `PaymentMethod`): Payment state and method enums.
**Lines 171-206** (`Order`, `OrderItem`, `Payment`): Full order shape with userId, status, totals, address snapshot, items array, payment object, timestamps.
**Lines 208-217** (`CheckoutRequest`, `PaymentRequest`): Form inputs for checkout and payment.
**Lines 221-235** (`Prescription`, `PrescriptionStatus`): Prescription document with medicine reference, status, imageUrl, review details, rejection reason.
**Lines 239-260** (`Address`, `AddressRequest`): Delivery address with fullAddress, landmark, pincode, city, state, type (HOME/WORK/OTHER), isDefault flag.
**Lines 264-272** (`Notification`): User notification with title, message, type (ORDER/PRESCRIPTION/PAYMENT/SYSTEM), isRead flag.
**Lines 276-284** (`Dashboard`): Admin dashboard stats (totalOrders, pendingOrders, revenue, etc.).
**Lines 288-295** (`MedicineSearchFilters`): Search filter shape with name, categoryId, price range, inStock, requiresPrescription.

---

### 4. `lib/apiClient.ts` (Axios HTTP Client)

**Lines 1-5**: Imports Axios, sets base URLs (`/api` and `/api/auth`).
**Lines 6-11**: Creates `apiClient` - Axios instance with baseURL `/api` and JSON content-type header.
**Lines 13-18**: Creates `authClient` - Separate Axios instance with baseURL `/api/auth`.
**Lines 20-32**: Request interceptor on `apiClient`: reads JWT token from localStorage, attaches `Authorization: Bearer <token>` header if token exists and isn't 'null'. Logs request details.
**Lines 34-42**: Response interceptor: on 401 errors, logs to console (does NOT auto-redirect). Returns error.
**Lines 44-45**: Exports `AUTH_BASE_URL` constant and `apiClient` as default.

---

### 5. `lib/utils.ts` (Utility Functions - DUPLICATE of apiClient)

**Lines 1-10**: Creates an Axios instance with baseURL from `VITE_API_URL` env var or default `http://localhost:8080/api`. Sets JSON content-type.
**Lines 12-23**: Request interceptor: attaches JWT token from localStorage to `Authorization` header.
**Lines 25-35**: Response interceptor: on 401 errors, clears localStorage (token + user) and redirects to `/login`.
**Line 37**: Exports as default.

---

### 6. `lib/cn.ts` (Class Name Merger)

**Lines 1-2**: Imports `clsx` (conditional class names) and `twMerge` (Tailwind class conflict resolver).
**Lines 4-6**: `cn()` function: takes multiple class name inputs, merges them with clsx (removing falsy values), then resolves Tailwind conflicts with twMerge.

---

### 7. `lib/errorMessage.ts` (Error Message Extractor)

**Line 3**: Function `getErrorMessage(error, fallback)`: extracts user-friendly error messages.
**Line 4**: Casts error to AxiosError with optional message field.
**Lines 5-8**: First tries to get message from `error.response.data.message` (backend error).
**Lines 9-11**: Falls back to `error.message` (JavaScript error).
**Line 12**: Returns the provided fallback string as last resort.

---

### 8. `store/authStore.ts` (Authentication State)

**Lines 1-5**: Imports Zustand, persist middleware, types, authApi, and error utility.
**Lines 7-34**: Defines `AuthState` interface with user, token, auth status, loading, error, and all action methods.
**Lines 36-243**: Creates Zustand store with persist middleware (persists user, token, isAuthenticated to localStorage as 'auth-storage').

**Lines 39-43**: Initial state: no user, no token, not authenticated, not loading, no error.

**Lines 45-83** (`login` action): Sets loading=true. Calls `authApi.login()`. Checks if OTP is required (`otpRequired === true` or no token but userId exists). If OTP needed, returns `{requiresOtp: true}`. Otherwise, constructs User object, saves token and user to localStorage, updates store state. On error, sets error message.

**Lines 85-119** (`loginWithOtp` action): Sets loading=true. Verifies OTP via `authApi.verifyLoginOtp()`. Then calls `authApi.completeOtpLogin()` to get JWT token. Saves user/token to localStorage, updates store.

**Lines 121-134** (`signup` action): Calls `authApi.signupWithOtp()` to trigger OTP. Returns `{requiresOtp: true}`.

**Lines 136-148** (`signupWithOtp` action): Same as signup - sends OTP.

**Lines 150-190** (`verifySignupOtp` action): Verifies signup OTP, creates user account, auto-logs in. Saves token/user to localStorage.

**Lines 192-218** (`requestPasswordReset`, `resetPassword`): Password reset flow using OTP.

**Lines 220-224** (`logout`): Clears localStorage (token, user), resets store state.
**Lines 226-228** (`setUser`): Directly sets user object.
**Lines 230-232** (`clearError`): Clears error message.

**Lines 234-242**: Persist config: stores only `user`, `token`, `isAuthenticated` to localStorage.

---

### 9. `store/cartStore.ts` (Cart State)

**Lines 1-3**: Imports Zustand, types, cartApi.
**Lines 5-14**: Defines `CartState` interface with cart data and CRUD actions.
**Lines 16-89**: Creates Zustand store.

**Lines 21-32** (`fetchCart`): Sets loading, calls `cartApi.getCart()`, stores result.
**Lines 34-49** (`addToCart`): Sets loading, calls `cartApi.addToCart()`, updates cart. On error, extracts error message and throws.
**Lines 52-64** (`updateItem`): Calls `cartApi.updateCartItem()` with item ID and new quantity.
**Lines 66-78** (`removeFromCart`): Calls `cartApi.removeFromCart()` with item ID.
**Lines 80-88** (`clearCart`): Calls `cartApi.clearCart()`, sets cart to null.

---

### 10. `store/productStore.ts` (Product/Catalog State)

**Lines 1-3**: Imports Zustand, types, catalogApi.
**Lines 5-24**: Defines `ProductState` interface with medicines, categories, selected product, pagination, filters, loading, error, and actions.
**Lines 26-128**: Creates Zustand store.

**Lines 27-38**: Initial state: empty arrays, pagination defaults (page 0, size 20), empty filters.

**Lines 40-67** (`fetchMedicines`): Fetches paginated medicine list via `catalogApi.getMedicines()`. Handles nested response structure (`response.data?.data` or `response.data`). Updates medicines and pagination.

**Lines 69-80** (`fetchCategories`): Fetches categories via `catalogApi.getCategories()`. Sets empty array on error.

**Lines 82-94** (`fetchProductById`): Fetches single medicine detail. Sets `selectedProduct`.

**Lines 96-119** (`searchMedicines`): Searches medicines with filters. Extracts data/pagination from nested response.

**Lines 121-127** (`setFilters`, `clearFilters`): Merges new filters or resets to empty.

---

### 11. `store/userPrefsStore.ts` (User Preferences - Wishlist & Recently Viewed)

**Lines 1-2**: Imports Zustand and persist middleware.
**Lines 4-12**: Defines interface with wishlist and recently viewed arrays + manipulation methods.
**Lines 14-62**: Creates persisted store (persists to 'user-prefs-storage').

**Lines 20-26** (`addToWishlist`): Adds medicine ID to wishlist if not already present. Prepends to array.
**Lines 28-32** (`removeFromWishlist`): Filters out the given medicine ID.
**Lines 34-41** (`toggleWishlist`): Checks if ID exists, calls add or remove accordingly.
**Lines 43** (`isWishlisted`): Returns boolean for whether ID is in wishlist.
**Lines 45-52** (`addRecentlyViewed`): Removes existing occurrence, prepends new ID, limits to 12 items.

---

### 12. `api/auth.ts` (Authentication API Calls)

**Lines 1-11**: Imports apiClient, authClient, and all auth-related types.
**Lines 13-78**: Exports `authApi` object with all auth methods:

- **Line 14-17** (`login`): POST `/auth/login` with email/password. Returns `AuthResponse`.
- **Line 19-22** (`generateLoginOtp`): POST `/auth/otp/generate`. Sends OTP to email.
- **Line 24-27** (`signup`): POST `/auth/signup`. Creates user account.
- **Line 29-32** (`getCurrentUser`): GET `/auth/me`. Returns current user profile.
- **Line 34-36** (`logout`): POST `/auth/logout`. Invalidates token server-side.
- **Line 38-41** (`signupWithOtp`): POST `/auth/signup/otp/generate`. Triggers signup OTP.
- **Line 43-54** (`verifySignupOtp`): POST `/auth/signup/otp/verify` with query params (email, otpCode, name, password, mobile). Completes registration and returns auth token.
- **Line 56-59** (`verifyLoginOtp`): POST `/auth/otp/verify`. Verifies login OTP.
- **Line 61-64** (`completeOtpLogin`): POST `/auth/verify-otp-login?email=...`. Gets JWT after OTP verified.
- **Line 66-69** (`requestPasswordReset`): POST `/auth/forgot-password`. Sends reset OTP.
- **Line 71-77** (`resetPassword`): POST `/auth/reset-password` with query params (email, otpCode, newPassword).

---

### 13. `api/catalog.ts` (Catalog API Calls)

**Lines 1-20**: Imports apiClient and types. Defines `PaginatedMedicinesResponse` type.
**Lines 22-77**: Exports `catalogApi` object:

- **Lines 23-33** (`getMedicines`): GET `/api/catalog/medicines?page=0&size=20`. Returns paginated list.
- **Lines 35-62** (`searchMedicines`): GET `/api/catalog/medicines/search` with filter query params. Handles multiple response shapes (array or nested object).
- **Lines 64-69** (`getMedicineById`): GET `/api/catalog/medicines/{id}`. Returns medicine detail.
- **Lines 71-77** (`getCategories`): GET `/api/catalog/categories`. Returns category list.

---

### 14. `api/cart.ts` (Cart API Calls)

**Lines 1-32**: Exports `cartApi`:
- **Line 9-12** (`getCart`): GET `/api/orders/cart`. Returns current user's cart.
- **Line 14-17** (`addToCart`): POST `/api/orders/cart/items` with medicineId and quantity.
- **Line 19-22** (`updateCartItem`): PUT `/api/orders/cart/items/{itemId}?quantity=N`.
- **Line 24-27** (`removeFromCart`): DELETE `/api/orders/cart/items/{itemId}`.
- **Line 29-31** (`clearCart`): DELETE `/api/orders/cart`. Removes all items.

---

### 15. `api/orders.ts` (Orders API Calls)

**Lines 1-47**: Exports `ordersApi`:
- **Line 10-13** (`checkout`): POST `/api/orders/checkout/start`. Initiates checkout with address.
- **Line 15-18** (`initiatePayment`): POST `/api/orders/checkout/payment?orderId=N`. Starts payment flow.
- **Line 20-23** (`confirmPayment`): POST `/api/orders/checkout/confirm?orderId=N&transactionId=X`. Confirms payment.
- **Line 25-33** (`getOrders`): GET `/api/orders`. Handles both paginated and array responses.
- **Line 35-39** (`getOrderById`): GET `/api/orders/{orderId}`. Returns order detail.
- **Line 41-44** (`cancelOrder`): POST `/api/orders/{orderId}/cancel`. Cancels order.

---

### 16. `api/address.ts` (Address API Calls)

**Lines 1-28**: Exports `addressApi`:
- **Line 5-9** (`getAddresses`): GET `/api/addresses`. Returns user's addresses.
- **Line 11-14** (`addAddress`): POST `/api/addresses` with address data.
- **Line 16-19** (`updateAddress`): PUT `/api/addresses/{id}`.
- **Line 21-23** (`deleteAddress`): DELETE `/api/addresses/{id}`.
- **Line 25-27** (`setDefault`): PUT `/api/addresses/{id}/default`. Sets as default address.

---

### 17. `api/prescription.ts` (Prescription API Calls)

**Lines 1-40**: Exports `prescriptionApi`:
- **Lines 10-18** (`upload`): POST `/api/prescriptions/upload` with multipart/form-data (file + medicineId).
- **Line 21-25** (`getMyPrescriptions`): GET `/api/prescriptions/my`. User's prescriptions.
- **Line 27-31** (`getPending`): GET `/api/prescriptions/pending`. Pending prescriptions (admin).
- **Line 33-35** (`approve`): PUT `/api/internal/prescriptions/{id}/approve`.
- **Line 37-39** (`reject`): PUT `/api/internal/prescriptions/{id}/reject` with reason.

---

### 18. `utils/medicineImage.ts` (Medicine Image Helper)

**Lines 5-12**: Maps category names to Unsplash image URLs. Has a 'default' fallback.
**Lines 14-17** (`getMedicineImage`): Takes a medicine object, looks up category in map. Falls back to `picsum.photos/seed/med-{id}/400/400`.
**Lines 19-22** (`getMedicineImageById`): Same logic but takes ID and category name directly.

---

### 19. `hooks/useAuth.ts` (Auth Hook)

**Lines 1-16**: Imports React hooks, authApi, error utility, types. Defines localStorage keys.
**Lines 18-34** (`persistSession`): Helper that saves auth response to localStorage (token, user data, role).
**Lines 36-99** (`useAuth` hook): Returns user, loading, isAuthenticated, login, logout, getToken, getRole, isAdmin. On mount, reads localStorage to restore session.
**Lines 101-226** (`useOtpAuth` hook): OTP-specific auth functions with loading/error state: requestLoginOtp, verifyLoginOtp, completeOtpLogin, requestSignupOtp, verifySignupOtp, requestPasswordReset, resetPassword.

---

### 20. `hooks/useCart.ts` (Cart Hook)

**Lines 1-95**: Standalone cart hook (alternative to cartStore). Manages cart state with useState. Provides fetchCart, addToCart, updateQuantity, removeItem, clearCart, getItemCount (sum of quantities), getTotal (sum of price*quantity). Auto-fetches on mount.

---

### 21. `hooks/useFetch.ts` (Generic Fetch Hook)

**Lines 1-62** (`useFetch`): Generic GET hook. Takes a URL and options (immediate, onSuccess, onError). Uses AbortController for cancellation. Returns data, loading, error, execute, refetch.
**Lines 64-92** (`useMutate`): Generic mutation hook for POST/PUT/DELETE. Returns loading, error, mutate function.

---

### 22. `hooks/useLocalStorage.ts` (LocalStorage Hook)

**Lines 1-45** (`useLocalStorage`): React hook that syncs state with localStorage. Initializes from storage, provides setValue (with function support), removeValue. Listens for cross-tab storage events.
**Lines 47-78** (`useSessionStorage`): Same as useLocalStorage but uses sessionStorage instead.

---

### 23. `hooks/index.ts` (Hook Barrel Export)

**Lines 1-4**: Re-exports all custom hooks for convenient importing.

---

### 24. `context/ToastContext.tsx` (Toast Notification System)

**Lines 1-10**: Defines ToastType ('success' | 'error' | 'info' | 'warning') and Toast interface (id, message, type, duration).
**Lines 12-18**: Defines ToastContextType interface with toasts array, showToast, success, error, removeToast.
**Line 20**: Creates React context.
**Line 22**: Counter for unique toast IDs.
**Lines 24-56** (`ToastProvider`): Manages toast state. `showToast` adds toast and auto-removes after duration (setTimeout). `success` and `error` are convenience wrappers. Renders `ToastContainer`.
**Lines 58-64** (`useToast`): Hook to access toast context.
**Lines 66-96** (`ToastContainer`): Renders toasts fixed at top-right. Each toast has color based on type (green=success, red=error, amber=warning, sky=info). Has close button and auto-dismiss animation.

---

### 25. `components/ui/Button.tsx` (Button Component)

**Lines 1-5**: Imports React, CVA (class-variance-authority), cn utility, Loader2 icon.
**Lines 6-31** (`buttonVariants`): Defines button styles using CVA. Variants: default (primary bg), destructive (red), outline (border), secondary (gray), ghost (transparent), link (text only), gradient. Sizes: default, sm, lg, icon.
**Lines 33-38** (`ButtonProps`): Extends HTML button props with variant, size, loading state.
**Lines 40-55** (`Button`): Renders button with merged classes. Shows spinner when loading. Disables button when loading or disabled prop.
**Line 56**: Sets displayName for debugging.

---

### 26. `components/ui/Card.tsx` (Card Component)

**Lines 1-71**: Exports Card sub-components using forwardRef:
- `Card`: Container with border, white bg, shadow.
- `CardHeader`: Flex column with padding, for title/description.
- `CardTitle`: h3 with large font, no tracking.
- `CardDescription`: p with small gray text.
- `CardContent`: Padding area (pt-0 to avoid double padding with header).
- `CardFooter`: Flex row for actions.

---

### 27. `components/ui/Input.tsx` (Input Component)

**Lines 1-23**: ForwardRef input component with Tailwind classes: full width, rounded border, focus ring, disabled styling.

---

### 28. `components/ui/Modal.tsx` (Modal Component)

**Lines 1-27**: Simple modal with backdrop (black/50 overlay). Has title header with close (X) button. Renders children in white rounded container. Returns null when not open.

---

### 29. `components/ui/ConfirmModal.tsx` (Confirmation Dialog)

**Lines 1-93**: Confirmation modal with 3 variants (danger/warning/info). Each has different icon (Trash2 for danger, AlertTriangle for others) and color scheme. Shows title, message, cancel button, and confirm button (with loading state). Has scale-in animation.

---

### 30. `components/shared/Navbar.tsx` (Navigation Bar)

**Lines 1-9**: Imports routing, icons, state stores, UI components, orders API.
**Lines 10-378** (`Navbar`): Top navigation component.

**State**: `isMenuOpen` (mobile menu), `searchQuery`, `isScrolled` (scroll-based styling), `showNotifications`, `notifications` array, `loadingNotifications`.

**Lines 22-41**: Reads auth state from store + localStorage fallback. Determines if user is admin.

**Lines 43-49**: Scroll listener: sets `isScrolled` when user scrolls past 10px (triggers glass effect).
**Lines 51-55**: Fetches cart on authentication.
**Lines 57-76**: Click-outside and Escape key listeners to close notification dropdown.
**Lines 78-113** (`fetchNotifications`): Builds notifications from recent orders (payment status changes, delivery updates).
**Lines 115-120** (`handleNotificationClick`): Toggles notification dropdown, fetches on open.
**Lines 122-127** (`handleSearch`): Navigates to homepage with search query parameter.
**Lines 129-132** (`handleLogout`): Calls logout, navigates to login.

**JSX Structure**:
- **Lines 135-153**: Logo with HeartPulse icon and "PharmaCare" brand.
- **Lines 155-168**: Desktop search bar (hidden on mobile).
- **Lines 170-276**: Desktop nav items: phone link, admin dashboard link OR cart (with badge), orders link, wishlist (non-admin), notification bell with dropdown, user avatar, logout button. OR Sign In/Sign Up buttons if not authenticated.
- **Lines 278-293**: Mobile hamburger menu button + cart icon.
- **Lines 297-375**: Mobile menu dropdown with search, phone, trust badge, navigation links.

---

### 31. `layouts/Layout.tsx` (Main Layout)

**Lines 1-200**: Wraps all user-facing pages. Contains:
- **Line 38**: `<Navbar />` at top.
- **Line 39-43**: `<main>` with `<Outlet />` (page content). Has `pb-16` on mobile for bottom nav.
- **Lines 46-96**: Mobile bottom navigation bar (Home, Search, Cart, Orders, Profile). Only shown for authenticated non-admin users.
- **Lines 98-197**: Footer with 4 columns: brand info, quick links, contact details, why-choose-us features. Copyright bar at bottom.

---

### 32. `layouts/AdminLayout.tsx` (Admin Layout)

**Lines 1-189**: Admin-specific layout with sidebar.
**Lines 32-48**: Navigation items: Dashboard, Medicines, Orders.
**Lines 50-55** (`isActive`): Determines if current route matches nav item.
**Lines 58-189** JSX:
- **Lines 59-65**: Mobile sidebar overlay (black/50 backdrop).
- **Lines 68-160**: Sidebar: header with logo, navigation links, "View Store" quick link, user profile with logout button.
- **Lines 162-187**: Main content area with mobile header (hamburger + title) and page content.

---

### PAGES (33-48)

### 33. `pages/HomePage.tsx` (Landing Page)
**Lines 1-500**: Main product listing page. Features:
- Search bar (synced with URL params)
- Category carousel
- Medicine grid with add-to-cart, wishlist, and recently viewed carousel
- Prescription upload modal for prescription-required medicines
- Sorting (by name, price, stock)
- Pagination

### 34. `pages/LoginPage.tsx`
**Lines 1-284**: Two-step login: credentials form → OTP verification. Left panel has hero branding. Right panel has form. Handles admin redirect.

### 35. `pages/SignupPage.tsx`
**Lines 1-328**: Two-step signup: registration form (name, email, mobile, password with requirements) → OTP verification.

### 36. `pages/ForgotPasswordPage.tsx`
Password reset flow: email entry → OTP verification → new password entry.

### 37. `pages/ProfilePage.tsx`
**Lines 1-202**: Displays user info (name, email, mobile), quick stats (total orders, total spent, wishlist count, member since), quick action links (orders, addresses, wishlist).

### 38. `pages/EditProfilePage.tsx`
Edit user name, email, mobile with form validation.

### 39. `pages/AddressPage.tsx`
CRUD for delivery addresses. Add, edit, delete, set default. Form validation.

### 40. `pages/CartPage.tsx`
**Lines 1-164**: Shopping cart display. Lists items with quantity controls, subtotal. Clear cart button. ConfirmModal for delete/clear actions. Checkout button.

### 41. `pages/CheckoutPage.tsx`
Multi-step checkout: address selection → payment method selection → order review → confirmation. Uses ordersApi for checkout flow.

### 42. `pages/OrdersPage.tsx`
**Lines 1-176**: User's order history. Status-colored badges. Cancel order button for active orders. Links to order details.

### 43. `pages/OrderDetailsPage.tsx`
Full order details: items list, address, payment info, order status timeline. Cancel order button.

### 44. `pages/MedicineDetailPage.tsx`
Medicine detail view: image, name, price, description, ingredients, side effects, dosage, manufacturer. Add to cart button. Prescription upload for prescription-required medicines.

### 45. `pages/NotificationsPage.tsx`
Lists user notifications from orders (payment status, delivery updates). Mark as read.

### 46. `pages/WishlistPage.tsx`
Displays wishlisted medicines with remove button. Grid layout with medicine cards.

### 47. `pages/AdminDashboard.tsx`
**Lines 1-347**: Admin statistics dashboard: total orders, pending/completed/cancelled counts, revenue, medicine count, low stock alerts. Revenue chart (6-month). Order status distribution.

### 48. `pages/AdminMedicinesPage.tsx`
Admin medicine management: list all medicines with stock status, category filter, search, sort. Links to add/edit medicine.

### 49. `pages/AddMedicinePage.tsx`
Add/edit medicine form: name, generic name, brand, category, price, MRP, stock, description, ingredients, side effects, dosage, manufacturer, prescription required flag. Image upload.

### 50. `pages/AdminOrdersPage.tsx`
Admin order management: all orders table with search (by ID, email, status), status filter tabs (All, Active, Completed, Cancelled). Payment decision workflow for PAYMENT_PENDING orders. Cancel order. View details.

---

## BACKEND (online-pharmacy/)

### MICROSERVICES ARCHITECTURE

The backend consists of 8 Spring Boot microservices communicating via REST and RabbitMQ events.

---

### 1. `pharmacy-eureka` (Service Discovery - Port 8761)

**`PharmacyGatewayApplication.java`**: Spring Boot main class with `@SpringBootApplication`. Runs Eureka server for service registration and discovery.

---

### 2. `pharmacy-config` (Config Server - Port 8888)

**`ConfigServerApplication.java`**: Spring Cloud Config server. Serves configuration properties to all microservices from Git or filesystem.

---

### 3. `pharmacy-common` (Shared Library)

**API Response Wrappers:**
- `ApiResponse.java`: Generic wrapper `{success, message, data, timestamp}`
- `ApiPaginatedResponse.java`: Paginated response with page info
- `PageResponse.java`: Alternative pagination format
- `ErrorResponse.java`: Error response structure

**Enums:**
- `OrderStatus.java`: 14 order states enum
- `PaymentStatus.java`: PENDING, SUCCESS, FAILED, CANCELLED, REFUNDED
- `PrescriptionStatus.java`: PENDING, APPROVED, REJECTED, EXPIRED
- `Role.java`: CUSTOMER, ADMIN
- `UserStatus.java`: ACTIVE, INACTIVE, SUSPENDED

**Events (RabbitMQ messages):**
- `BaseEvent.java`: Abstract base with eventId, timestamp, source, type
- `OrderPlacedEvent.java`: orderId, userId, grandTotal, list of OrderItemEvent
- `OrderCancelledEvent.java`: orderId, userId, reason
- `InventoryReservedEvent.java`: medicineId, quantity, orderId
- `InventoryReleasedEvent.java`: medicineId, quantity, orderId (on cancellation)
- `PrescriptionApprovedEvent.java`: prescriptionId, medicineId, userId
- `PrescriptionRejectedEvent.java`: prescriptionId, reason
- `UserRegisteredEvent.java`: userId, email, name
- `UserLoggedInEvent.java`: userId, email

**Feign Clients (inter-service REST calls):**
- `CatalogFeignClient.java`: Declarative client for catalog service
- `OrdersFeignClient.java`: Declarative client for orders service
- `IdentityNotificationFeignClient.java`: Client for identity/notification services
- With fallback factories for circuit breaker resilience

**Configuration:**
- `RabbitMQConfig.java`: Queue and exchange bean definitions
- `Resilience4jConfig.java`: Circuit breaker and retry configurations
- `SecurityProperties.java`: JWT secret and expiration config
- `SwaggerUiConfig.java`: OpenAPI documentation setup

**Outbox Pattern:**
- `OutboxEvent.java`: Entity storing events before publishing
- `OutboxService.java`: Polls outbox table, publishes to RabbitMQ, marks as sent
- `ProcessedEvent.java`: Tracks consumed events (idempotency)

**Exceptions:**
- `GlobalExceptionHandler.java`: @ControllerAdvice for unified error responses
- `BadRequestException.java`: 400 error
- `ResourceNotFoundException.java`: 404 error
- `UnauthorizedException.java`: 401 error
- `InsufficientStockException.java`: Custom stock error

**Utilities:**
- `JwtUtil.java`: JWT token creation, parsing, validation
- `FileUtils.java`: File validation and sanitization
- `PharmacyLoggerFactory.java`: Standardized logging with correlation IDs
- `CorrelationIdFilter.java`: Adds request tracing ID to all logs

---

### 4. `pharmacy-gateway` (API Gateway - Port 8080)

**`PharmacyGatewayApplication.java`**: Main class, scans gateway and common packages.

**`SecurityConfig.java`**: Spring Security config for gateway. Disables CSRF, configures route-based authorization.

**`JwtAuthenticationFilter.java`**: WebFilter that intercepts all requests. Extracts JWT from Authorization header, validates it, adds user info (userId, role, email) to request headers for downstream services.

**`RateLimitingFilter.java`**: Redis-backed rate limiter. Tracks requests per user/IP. Returns 429 Too Many Requests when limit exceeded.

**`OpenApiAggregator.java`**: Aggregates OpenAPI specs from all downstream services into a single Swagger UI.

Routes configured in `application.yml`:
- `/api/auth/**` → identity-service (8081)
- `/api/catalog/**` → catalog-service (8082)
- `/api/orders/**` → orders-service (8083)
- `/api/notifications/**` → notifications-service (8084)
- `/admin/**` → admin-service (8085)

---

### 5. `pharmacy-identity` (Identity Service - Port 8081)

**Entities:**
- `User.java`: id, name, email, passwordHash, mobile, role, status, addresses (one-to-many), timestamps
- `Address.java`: id, user (many-to-one), fullAddress, landmark, pincode, city, state, type (HOME/WORK/OTHER), isDefault
- `OtpVerification.java`: id, email, otpCode, otpType (SIGNUP/LOGIN/PASSWORD_RESET), expiresAt, verified
- `Notification.java`: id, user, type, title, message, isRead, createdAt

**Controllers:**
- `AuthController.java` (`/api/auth`): signup, login, OTP generation/verification, password reset, profile management
- `AddressController.java` (`/api/addresses`): CRUD addresses for authenticated user
- `NotificationController.java` (`/api/notifications`): User notification management
- `InternalIdentityController.java` (`/internal/users`): Internal endpoints for other services (user lookup by ID)

**Services:**
- `AuthService.java`: Registration, login with OTP flow, JWT generation, profile updates
- `OtpService.java`: OTP generation (6-digit random), storage in Redis, verification, expiry checking
- `AddressService.java`: Address CRUD, default address management
- `NotificationService.java`: Create, read, mark as read notifications
- `JwtBlacklistService.java`: Stores revoked JWTs in Redis for logout
- `CustomUserDetailsService.java`: Spring Security user detail loader

**Security:**
- `SecurityConfig.java`: Configures HTTP security, JWT filter, method authorization
- `JwtAuthenticationFilter.java`: Validates JWT, sets SecurityContext
- `JwtUserPrincipal.java`: Custom principal with userId, role, email

**DTOs:**
- `SignupRequest`: name, email, password, mobile
- `LoginRequest`: email, password
- `AuthResponse`: userId, name, email, role, token, otpRequired
- `OtpRequest`: email, otpType
- `OtpVerificationRequest`: email, otpCode, otpType
- `OtpResponse`: email, message, expiresInMinutes
- `AddressDTO`: Full address with id
- `AddressRequest`: Address creation/update input
- `UserDTO`: User profile data
- `UpdateProfileRequest`: name, mobile
- `NotificationDTO`: Notification with id, type, message, isRead
- `TokenValidationResponse`: valid flag, userId, role

---

### 6. `pharmacy-catalog` (Catalog Service - Port 8082)

**Entities:**
- `Medicine.java`: id, name, genericName, brand, categoryId, categoryName, price, mrp, discountedPrice, description, ingredients, sideEffects, dosageForm, strength, manufacturer, requiresPrescription, imageUrl, stock, isActive
- `Category.java`: id, name, description, imageUrl
- `Inventory.java`: id, medicine (many-to-one), batchNumber, quantity, manufactureDate, expiryDate, receivedDate
- `Prescription.java`: id, userId, orderId, medicineId, fileName, filePath, status (PENDING/APPROVED/REJECTED), reviewedBy, reviewedAt, rejectionReason

**Controllers:**
- `MedicineController.java` (`/api/catalog/medicines`): CRUD medicines, search, pagination
- `CategoryController.java` (`/api/catalog/categories`): List/create/update categories
- `InventoryController.java` (`/api/catalog/inventory`): Manage inventory batches
- `PrescriptionController.java` (`/api/prescriptions`): Upload prescriptions, admin review
- `InternalCatalogController.java` (`/internal/catalog`): Internal medicine/inventory lookups

**Services:**
- `MedicineService.java`: Medicine CRUD, search with JPA Specification, stock management
- `CategoryService.java`: Category management
- `InventoryService.java`: Inventory batch CRUD, stock calculations, expiry tracking
- `PrescriptionService.java`: File upload, status updates, admin review workflow
- `FileStorageService.java`: Local file storage for prescription uploads

**Specifications:**
- `MedicineSpecification.java`: Dynamic JPA criteria builder for search filters (name LIKE, categoryId, price range, inStock, requiresPrescription)

**Events:**
- `CatalogEventListener.java`: Listens to inventory reservation/release events
- `CatalogEventPublisher.java`: Publishes inventory-related events

**DTOs:**
- `MedicineDTO`: Basic medicine info
- `MedicineDetailDTO`: Extended with inventory list
- `MedicineRequest`: Create/update input
- `SearchRequest`: name, categoryId, minPrice, maxPrice, requiresPrescription, inStock
- `CategoryDTO`: Category data
- `InventoryDTO`: Inventory batch data
- `InventoryRequest`: Create inventory batch
- `PrescriptionDTO`: Prescription data
- `PrescriptionCheckDTO`: Check if prescription exists for medicine

---

### 7. `pharmacy-orders` (Orders Service - Port 8083)

**Entities:**
- `Cart.java`: id, userId, items (one-to-many), createdAt, updatedAt
- `CartItem.java`: id, cart (many-to-one), medicineId, medicineName, quantity, unitPrice, subtotal
- `Order.java`: id, userId, status (enum), totalAmount, deliveryFee, discount, grandTotal, addressSnapshot, addressPincode, deliverySlot, notes, paymentStatus, items (one-to-many), orderedAt, updatedAt
- `OrderItem.java`: id, order (many-to-one), medicineId, medicineName, quantity, unitPrice, subtotal, prescriptionId
- `Payment.java`: id, order (one-to-one), paymentMethod (enum), status (enum), transactionId, amount, paidAt

**Controllers:**
- `OrderController.java` (`/api/orders`, `/api/cart`): Cart operations, checkout flow, order management
- `InternalOrdersController.java` (`/internal/orders`): Internal order lookups for admin service

**Services:**
- `OrderService.java`: Cart management, checkout workflow (start → payment → confirm), order status transitions, cancellation with inventory release
- `CatalogClient.java`: Feign client to catalog service for medicine lookups and inventory checks

**Events:**
- `OrderEventPublisher.java`: Publishes OrderPlacedEvent, OrderCancelledEvent

**Outbox:**
- `OutboxProcessor.java`: Scheduled task that processes pending outbox events

**DTOs:**
- `CartDTO`: Cart with items and totals
- `CartItemDTO`: Item with medicine info
- `AddToCartRequest`: medicineId, quantity
- `OrderDTO`: Full order with items, payment, status
- `OrderItemDTO`: Order item data
- `CheckoutRequest`: address, pincode, deliverySlot, notes
- `PaymentDTO`: Payment information
- `PaymentRequest`: paymentMethod

**Status Flow:**
```
Cart → checkout/start → CHECKOUT_STARTED
→ checkout/payment → PAYMENT_PENDING
→ checkout/confirm → PAID → PACKED → OUT_FOR_DELIVERY → DELIVERED
→ cancel at any point → CUSTOMER_CANCELLED
```

---

### 8. `pharmacy-notifications` (Notifications Service - Port 8084)

**Components:**
- `NotificationDispatchCoordinator.java`: Coordinates email dispatch, reads events from RabbitMQ
- `EmailChannelService.java`: Sends emails via SMTP (JavaMailSender)
- `NotificationDomainEventListener.java`: @RabbitListener that consumes domain events and triggers email dispatch
- `EmailController.java` (`/api/notifications`): REST endpoint for manual email sending

**Events Consumed:**
- OrderPlacedEvent → "Order Confirmation" email
- OrderCancelledEvent → "Order Cancelled" email
- PrescriptionApprovedEvent → "Prescription Approved" notification
- PrescriptionRejectedEvent → "Prescription Rejected" email with reason
- UserRegisteredEvent → "Welcome" email

---

### 9. `pharmacy-admin` (Admin Service - Port 8085)

**Components:**
- `AdminController.java` (`/admin`): Dashboard stats, aggregated medicine/order views
- `DashboardService.java`: Aggregates data from catalog and orders services via Feign clients
- `CatalogClient.java`: Feign client for catalog service (medicines, inventory)
- `OrdersClient.java`: Feign client for orders service (all orders)

**DTOs:**
- `DashboardDTO`: totalOrders, pendingOrders, completedOrders, totalRevenue, totalMedicines, lowStockItems, recentOrders

**Security:**
- `SecurityConfig.java`: Restricts all endpoints to ADMIN role
- `JwtHeaderAuthenticationFilter.java`: Extracts user info from gateway-passed headers
- `AdminUserPrincipal.java`: Admin-specific principal

---

### CONFIGURATION FILES

Each service has `application.yml` with:
- `server.port`: Service port
- `spring.application.name`: Service name for Eureka
- `spring.datasource`: PostgreSQL connection
- `spring.jpa`: Hibernate config (ddl-auto: update)
- `spring.rabbitmq`: RabbitMQ connection
- `spring.data.redis`: Redis connection
- `eureka.client.service-url.defaultZone`: Eureka server URL
- `jwt.secret` / `jwt.expiration`: JWT configuration

---

### DETAILED BACKEND FILE EXPLANATIONS

#### `pharmacy-common/src/main/java/com/pharmacy/common/api/ApiResponse.java` (Generic API Response Wrapper)

**Lines 1-10**: Package declaration, imports Jackson annotations for JSON serialization, Lombok for boilerplate reduction, and Java time utilities.
**Lines 12-15**: Lombok annotations: `@Data` (getters/setters/toString/equals/hashCode), `@NoArgsConstructor`, `@AllArgsConstructor`, `@JsonInclude(JsonInclude.Include.NON_NULL)` (exclude null fields from JSON).
**Line 16**: Generic class `ApiResponse<T>` with type parameter T for response data.
**Lines 18-34**: Fields with `@JsonProperty` for explicit JSON key names: `success` (boolean), `message` (string), `data` (generic T), `errors` (list of strings), `timestamp` (Instant), `traceId` (string for request tracing).
**Lines 36-41**: Setter methods (Lombok @Data generates these, but explicit setters provided).
**Lines 43-49** (`of(T data)`): Static factory method - creates success response with data, timestamp=now.
**Lines 51-58** (`of(T data, String message)`): Static factory method - creates success response with data and message.
**Lines 60-66** (`error(String message)`): Static factory method - creates error response (success=false) with message.
**Lines 68-75** (`error(List<String> errors, String message)`): Static factory method - creates error response with multiple error details.

---

#### `pharmacy-common/src/main/java/com/pharmacy/common/enums/OrderStatus.java` (Order Status Enum)

**Lines 1-3**: Package declaration, enum definition with 14 states representing the complete order lifecycle.
**Lines 4-19**: Enum constants in lifecycle order:
- `DRAFT_CART`: Items in cart, not yet checkout
- `CHECKOUT_STARTED`: User began checkout process
- `PRESCRIPTION_PENDING`: Awaiting prescription upload/review
- `PRESCRIPTION_APPROVED`: Prescription verified by admin
- `PRESCRIPTION_REJECTED`: Prescription rejected
- `PAYMENT_PENDING`: Awaiting payment
- `PAID`: Payment received
- `PACKED`: Order packed for shipping
- `OUT_FOR_DELIVERY`: With delivery person
- `DELIVERED`: Successfully delivered
- `CUSTOMER_CANCELLED`: Cancelled by customer
- `ADMIN_CANCELLED`: Cancelled by admin
- `PAYMENT_FAILED`: Payment attempt failed
- `RETURN_REQUESTED`: Return requested by customer
- `REFUND_INITIATED`: Refund processing started
- `REFUND_COMPLETED`: Refund completed

---

#### `pharmacy-common/src/main/java/com/pharmacy/common/util/JwtUtil.java` (JWT Token Utility)

**Lines 1-16**: Package declaration, imports JJWT library for JWT operations, Spring annotations, Java utilities.
**Lines 18-19**: `@Component` makes it a Spring-managed bean. Class definition.
**Line 21**: Constant: minimum 32 characters for HS256 algorithm security.
**Lines 23-27**: `@Value` injections: reads `jwt.secret` from application.yml, `jwt.expiration` with default 86400000ms (24 hours).
**Lines 29-38** (`validateSecret`): `@PostConstruct` runs after bean creation. Validates secret is not null/blank and meets minimum length. Throws `IllegalStateException` if invalid.
**Lines 40-43** (`getSigningKey`): Converts secret string to bytes, creates HMAC-SHA signing key using `Keys.hmacShaKeyFor()`.
**Lines 45-47** (`extractEmail`): Extracts email from JWT subject claim.
**Lines 49-51** (`extractUserId`): Extracts custom `userId` claim as Long.
**Lines 53-55** (`extractRole`): Extracts custom `role` claim as String.
**Lines 57-59** (`extractExpiration`): Extracts expiration date from claims.
**Lines 61-64** (`extractClaim`): Generic method to extract any claim using a function that operates on Claims object.
**Lines 66-72** (`extractAllClaims`): Parses JWT token, verifies signature with signing key, returns all claims (payload).
**Lines 74-76** (`isTokenExpired`): Compares expiration date with current time. Returns true if expired.
**Lines 78-83** (`generateToken`): Creates JWT with userId and role as custom claims, email as subject. Calls `createToken()`.
**Lines 85-93** (`createToken`): Builds JWT with claims map, subject (email), issuedAt=now, expiration=now+expiration, signs with key, returns compact string.
**Lines 95-98** (`validateToken(String token, String email)`): Validates token matches given email and is not expired.
**Lines 100-107** (`validateToken(String token)`): Validates token by parsing claims and checking expiration. Catches JwtException for invalid tokens.
**Lines 109-116** (`getExpirationTime`): Returns token expiration timestamp in milliseconds. Returns 0 on error.

---

#### `pharmacy-common/src/main/java/com/pharmacy/common/exception/GlobalExceptionHandler.java` (Centralized Exception Handler)

**Lines 1-28**: Package declaration, imports for error response DTO, Jackson ObjectMapper, Spring exception types, validation classes, logging.
**Lines 29-30**: `@Slf4j` for logging, `@RestControllerAdvice` to handle exceptions from all controllers.
**Line 33**: ObjectMapper with JavaTimeModule for date/time serialization.
**Lines 35-36**: Reads application name from config.
**Lines 38-42** (`handleResourceNotFound`): `@ExceptionHandler` for `ResourceNotFoundException`. Returns 404 with error message.
**Lines 44-48** (`handleBadRequest`): Handles `BadRequestException`. Returns 400.
**Lines 50-54** (`handleUnauthorized`): Handles `UnauthorizedException`. Returns 401.
**Lines 56-60** (`handleAccessDenied`): Handles Spring Security `AccessDeniedException`. Returns 403 Forbidden.
**Lines 62-66** (`handleBadCredentials`): Handles invalid login credentials. Returns 401.
**Lines 68-72** (`handleInsufficientStock`): Handles stock shortage. Returns 409 Conflict.
**Lines 74-84** (`handleValidationErrors`): Handles `@Valid` validation failures. Extracts field-level errors, maps to "fieldName: message" format. Returns 400 with error list.
**Lines 86-96** (`handleBindException`): Similar to above for binding errors.
**Lines 98-103** (`handleTypeMismatch`): Handles type conversion errors (e.g., string where number expected). Returns 400 with parameter name and invalid value.
**Lines 105-109** (`handleNoHandlerFound`): Handles 404 for unknown endpoints.
**Lines 111-115** (`handleMethodNotSupported`): Handles wrong HTTP method (e.g., POST on GET-only endpoint). Returns 405.
**Lines 117-121** (`handleMaxUploadSizeExceeded`): Handles file upload size limit exceeded. Returns 413.
**Lines 123-127** (`handleMessageNotReadable`): Handles malformed JSON in request body. Returns 400.
**Lines 129-133** (`handleJsonProcessing`): Handles JSON serialization errors. Returns 400.
**Lines 135-143** (`handleGenericException`): Catch-all for any unhandled exception. Returns 500 Internal Server Error.
**Lines 145-148** (`buildErrorResponse`): Helper method that creates ErrorResponse DTO and wraps in ResponseEntity with appropriate status code.

---

#### `pharmacy-gateway/src/main/java/com/pharmacy/gateway/config/JwtAuthenticationFilter.java` (Gateway JWT Filter)

**Lines 1-28**: Package declaration, imports JJWT, Spring WebFlux reactive types, Spring Security, Gateway filter interfaces.
**Lines 29-31**: `@Component` (Spring bean), `@Slf4j` (logging). Implements `GlobalFilter` (runs on all requests) and `Ordered` (controls filter priority).
**Lines 33-34**: Injects JWT secret from config.
**Lines 36-40**: `@PostConstruct` logs secret length for debugging.
**Lines 42-70** (`PUBLIC_PATHS`): List of paths that don't require authentication (auth endpoints, actuator health, Swagger docs).
**Lines 72-78** (`READ_ONLY_PUBLIC_PATHS`): Paths that allow GET without auth (medicine catalog, categories - for browsing).
**Lines 80-146** (`filter` method): Main filter logic:
- **Lines 81-84**: Gets request path and HTTP method.
- **Lines 86-88**: If public path, skips auth check, passes request through.
- **Lines 90-93**: If read-only public path AND GET method, allows through.
- **Lines 95-101**: Checks Authorization header exists. Returns 401 if missing.
- **Lines 103-106**: Checks header starts with "Bearer ". Returns 401 if malformed.
- **Lines 108**: Extracts token (removes "Bearer " prefix).
- **Lines 110-133**: Validates token:
  - **Lines 111-116**: Parses claims, extracts userId, email, role.
  - **Lines 118**: Logs successful validation.
  - **Lines 120-124**: Creates Spring Security authentication token with role authority.
  - **Lines 126-130**: Mutates request to add `X-User-Id`, `X-User-Email`, `X-User-Role` headers for downstream services.
  - **Lines 132-133**: Passes modified request through filter chain with security context.
- **Lines 134-143**: On validation failure, logs error (JWT exception or general exception).
- **Line 145**: Returns 401 with error message.
**Lines 148-154** (`isPublicPath`, `isReadOnlyPublicPath`): Checks if path starts with any public path prefix.
**Lines 156-164** (`validateToken`): Parses token, checks expiration. Returns false on any error.
**Lines 166-173** (`getClaims`): Parses and verifies JWT token, returns claims payload.
**Lines 175-177** (`isTokenExpired`): Compares claim expiration with current time.
**Lines 179-184** (`unauthorized`): Sets 401 status, adds JSON content-type header, writes error JSON body.
**Lines 186-189** (`getOrder`): Returns -100 (runs early in filter chain, before routing).

---

### DATABASE SCHEMA

**pharmacy_identity:**
- `users`: id, name, email, password_hash, mobile, role, status, created_at, updated_at
- `addresses`: id, user_id, full_address, landmark, pincode, city, state, type, is_default, created_at
- `otp_verifications`: id, email, otp_code, otp_type, expires_at, verified, created_at
- `notifications`: id, user_id, type, title, message, is_read, created_at

**pharmacy_catalog:**
- `categories`: id, name, description, image_url
- `medicines`: id, name, generic_name, brand, category_id, category_name, price, mrp, description, ingredients, side_effects, dosage_form, strength, manufacturer, requires_prescription, image_url, stock, is_active
- `inventory`: id, medicine_id, batch_number, quantity, manufacture_date, expiry_date, received_date
- `prescriptions`: id, user_id, order_id, medicine_id, file_name, file_path, status, reviewed_by, reviewed_at, rejection_reason
- `outbox_events`: id, event_type, payload, status, created_at
- `processed_events`: id, event_id, processed_at

**pharmacy_orders:**
- `carts`: id, user_id, created_at, updated_at
- `cart_items`: id, cart_id, medicine_id, medicine_name, quantity, unit_price, subtotal
- `orders`: id, user_id, status, total_amount, delivery_fee, discount, grand_total, address_snapshot, address_pincode, delivery_slot, notes, payment_status, ordered_at, updated_at
- `order_items`: id, order_id, medicine_id, medicine_name, quantity, unit_price, subtotal, prescription_id
- `payments`: id, order_id, payment_method, status, transaction_id, amount, paid_at

---

### COMPLETE PAGE EXPLANATIONS (Frontend)

#### `pages/HomePage.tsx` (Landing Page - 500 lines)

**Lines 1-15**: Imports React hooks, React Router, Zustand stores, medicine image utility, prescription API, catalog API, UI components, icons.
**Lines 16-20**: `categoryIcons` map: SVG icons for different medicine categories (Analgesics=heart, Antibiotics=beaker, default=clipboard).
**Line 22**: HomePage component definition.

**State Management (Lines 23-35)**:
- **Line 23**: `searchParams` - URL query parameters, `setSearchParams` - to modify them
- **Line 24**: `navigate` - programmatic navigation
- **Line 25**: `searchQuery` - reads `?search=` from URL
- **Line 26**: `localSearch` - local search input state (synced with URL)
- **Line 27**: `sortOption` - current sort selection (default, price-asc, price-desc, name-asc, name-desc)
- **Line 28**: `mounted` - for entrance animations
- **Line 29**: `quantities` - per-medicine quantity selectors (Record<medicineId, quantity>)
- **Line 30**: `uploadModalOpen` - prescription upload modal visibility
- **Line 31**: `prescriptionFile` - selected file for upload
- **Line 32**: `uploading` - upload in progress flag
- **Line 33**: `pendingMedicine` - medicine waiting for prescription upload
- **Line 34**: `recentItems` - recently viewed medicines
- **Line 35**: `fileInputRef` - reference to hidden file input

**Lines 37-49**: Destructures stores: `useProductStore` (medicines, categories, pagination, loading, error, fetchMedicines, searchMedicines, fetchCategories), `useAuthStore` (isAuthenticated), `useCartStore` (addToCart), `useUserPrefsStore` (recentMedicineIds, toggleWishlist, isWishlisted).

**Lines 51**: Sets `mounted=true` on mount (triggers CSS animations).
**Lines 53-60** (`loadCategories`): Fetches categories via direct fetch (redundant with store fetch below).
**Lines 63-71**: On mount/searchQuery change: loads categories, fetches categories from store. If search query exists, searches medicines by name; otherwise fetches all medicines.
**Lines 73-85**: Loads recently viewed medicine details by fetching each ID from wishlist store's `recentMedicineIds`. Limits to 8 items. Filters out failed fetches.

**Lines 87-93** (`handleCategoryClick`): If category provided, searches medicines by categoryId; otherwise fetches all medicines.
**Lines 95-104** (`handleLocalSearch`): Updates local search state. If query has text, searches medicines and updates URL params. If empty, fetches all medicines and clears URL params.

**Lines 106-122** (`handleAddToCart`): If not authenticated, redirects to login. If medicine requires prescription, opens upload modal and stores pending medicine. Otherwise, adds to cart with selected quantity.

**Lines 124-129** (`updateQuantity`): Increments/decrements quantity for a medicine. Minimum of 1.

**Lines 131-133** (`handlePageChange`): Fetches medicines for new page number.

**JSX Structure (Lines 135-500)**:
- **Lines 137-188**: Hero banner (only when no search query). Gradient background with floating decorative circles. Left side: "Trusted by 50,000+ Customers" badge, headline with gradient text, description, "Browse Medicines" and "Upload Prescription" buttons. Right side: Large animated HeartPulse icon with floating "100% Genuine" and "Fast Delivery" badges.
- **Lines 190-407**: Medicine listing section:
  - **Lines 191-226**: Header with title ("Search Results" or "Popular Medicines"), product count, search input, sort dropdown, clear button (when searching).
  - **Lines 228-233**: Error banner (red background with AlertCircle icon).
  - **Lines 235-245**: Loading state: 8 skeleton cards with animated gray boxes.
  - **Lines 246-254**: Empty state: "No medicines found" with AlertCircle icon.
  - **Lines 255-406**: Medicine grid:
    - **Lines 257-265**: Sorts medicines array based on sortOption (price, name ascending/descending).
    - **Lines 266-360**: Maps each medicine to a clickable Card:
      - **Lines 274-283**: Wishlist heart button (top-left overlay). Toggles wishlist on click.
      - **Lines 284-289**: Medicine image with fallback on error.
      - **Lines 290-296**: "Rx Required" badge for prescription medicines (orange overlay).
      - **Lines 297-303**: "Out of Stock" overlay when stock is 0.
      - **Lines 304-310**: Discount badge (percentage off) when mrp > price.
      - **Lines 312-317**: Medicine info: category name, name (truncated), manufacturer/dosage.
      - **Lines 318-323**: Price display with strikethrough MRP if discounted.
      - **Lines 324-329**: Stock indicator (green dot + "X in stock" or red dot + "Out of stock").
      - **Lines 330-356**: Quantity selector (-/+) and "Add to Cart" button. Disabled when out of stock.
  - **Lines 363-404**: Pagination: Previous button, page numbers (up to 5 visible), Next button. Sliding window of 5 pages when total > 5.
- **Lines 409-429**: Recently viewed carousel (only when no search and has recent items). Horizontal scrollable row of mini medicine cards.
- **Lines 431-497**: Prescription upload modal:
  - **Lines 433-439**: Info banner showing which medicine needs prescription.
  - **Lines 444-453**: Hidden file input for image/PDF selection.
  - **Lines 455-471**: File display (if selected) with checkmark and remove button, OR upload area (dashed border with upload icon).
  - **Lines 473-496**: Cancel and "Submit & Upload" buttons. On submit: uploads prescription, then adds medicine to cart with prescriptionId.

---

#### `pages/LoginPage.tsx` (284 lines)
Two-step login: credentials → OTP verification. Left panel has hero branding with feature cards (100% Genuine, Quick Delivery, Secure). Right panel has login form with email/password fields. On submit, calls authStore.login(). If OTP required, switches to OTP step. OTP form shows masked email, 6-digit input (numbers only), "Verify & Sign In" button. Admin users redirect to `/admin/dashboard`, others to `/`.

---

#### `pages/SignupPage.tsx` (328 lines)
Two-step signup: registration form → OTP verification. Form fields: name, email, mobile, password (with requirements checklist: 8+ chars, uppercase, number), confirm password. Password must meet all requirements to submit. On OTP step, shows email, 6-digit input. On success, navigates to home.

---

#### `pages/CartPage.tsx` (164 lines)
Shopping cart display. Lists items with name, unit price, quantity controls (-/+), subtotal, delete button. Order summary card: subtotal, delivery (₹50), total. "Proceed to Checkout" button. ConfirmModal for delete item and clear cart actions.

---

#### `pages/CheckoutPage.tsx` (181 lines)
Checkout form with address fields (address, pincode, delivery slot, notes), payment method radio buttons (COD, UPI, Card), order summary. On submit: calls ordersApi.checkout() → initiatePayment() → clearCart() → navigate to order details. Redirects to cart if empty.

---

#### `pages/OrderDetailsPage.tsx` (382 lines)
Order detail view with:
- **Lines 39**: `trackingSteps` array for visual order tracking timeline
- **Lines 48-59**: Admin detection via JWT payload decoding
- **Lines 61-82**: Fetches order from `/internal/orders/{id}` (admin) or `/api/orders/{id}` (user)
- **Lines 131-148**: `getStepStatus()`: Maps tracking step to order status, compares with current status to mark as completed/current/pending
- **Lines 150-156**: `downloadInvoice()`: Generates plain text invoice
- Visual timeline with icons (Package → Wallet → Box → Truck → CheckCircle)
- Order items list, address, payment info
- Cancel order button for active orders

---

#### `pages/MedicineDetailPage.tsx` (249 lines)
Medicine detail view: large image, name, manufacturer, price with discount badge, stock indicator, description, ingredients, side effects, dosage, manufacturer info. Add to cart with quantity selector. Wishlist toggle. Related medicines (same category, up to 4).

---

#### `pages/AddressPage.tsx` (221 lines)
Address management: list of saved addresses with type icon (HOME/WORK/OTHER), default badge. Add/edit form with type selector, full address textarea, pincode, city, state inputs. Delete confirmation. Set default button.

---

#### `pages/WishlistPage.tsx` (102 lines)
Displays wishlisted medicines in grid. Each card shows image, name, category, price. "Add to Cart" button and "Remove from Wishlist" button. Fetches medicine details for each wishlist ID on load. Empty state with "Browse Medicines" button.

---

#### `pages/NotificationsPage.tsx` (139 lines)
Builds notifications from order data: payment status updates (PAYMENT type) and delivery status changes (DELIVERY type). Each notification card shows icon (CreditCard/Truck), type badge, title, message, timestamp, status indicator. Unread count in header. Clicking navigates to order details.

---

#### `pages/ProfilePage.tsx` (202 lines)
User profile display: avatar with initials, name, email, mobile. Quick stats card: total orders, total spent, wishlist count, member since date. Quick action links to orders, addresses, wishlist, edit profile. Fetches order stats from orders API on mount.

---

#### `pages/EditProfilePage.tsx` (191 lines)
Edit profile form: name, email, mobile inputs with icons. Submit PUT `/api/auth/profile`. On success, updates localStorage and authStore, shows success message, navigates back to profile after 1.5s.

---

#### `pages/ForgotPasswordPage.tsx` (289 lines)
Three-step flow: email entry → OTP verification → new password entry. Email step sends reset OTP. OTP step verifies code. Password step sets new password with confirmation match check. Success screen with "Go to Login" button.

---

#### `pages/OrdersPage.tsx` (176 lines)
User order history list. Status-colored badges. Cancel order button for active orders (CHECKOUT_STARTED through PAID). Click to view details. Skeleton loading state. Empty state if no orders.

---

#### `pages/AdminDashboard.tsx` (347 lines)
Admin statistics dashboard:
- **Lines 53-120** (`fetchDashboardData`): Fetches orders and medicines in parallel. Computes: totalOrders, pendingOrders (CHECKOUT_STARTED through OUT_FOR_DELIVERY), completedOrders (DELIVERED), totalRevenue (from DELIVERED orders), lowStockItems (stock < 20), statusBuckets (Pending/Completed/Cancelled), revenueSeries (6-month monthly revenue).
- **Lines 174-246**: 5 gradient stat cards: Total Orders (blue), Pending (amber), Revenue (green), Medicines (purple), Low Stock (red if items exist, gray if none).
- **Lines 248-297**: Two charts: Revenue Trend (bar chart for last 6 months), Order Status Mix (bar chart with color-coded bars).
- **Lines 300-344**: Quick action cards: Manage Medicines, Process Orders, Add New Medicine.

---

#### `pages/AdminMedicinesPage.tsx` (281 lines)
Admin medicine management table/list. Search by name/manufacturer. Filter by category, stock status (in-stock/low-stock/out-of-stock). Sort by name, price, stock (ascending/descending). Edit and Delete buttons per medicine. Filter toggle panel. Clear filters button. Add Medicine button.

---

#### `pages/AddMedicinePage.tsx` (375 lines)
Add/Edit medicine form. Fields: name, description, category (dropdown), price, MRP, stock, requires prescription (checkbox), dosage form, strength, manufacturer, expiry date, batch number. On edit mode, fetches existing medicine data. On submit, POST (add) or PUT (edit) to catalog API. Success message + redirect to admin dashboard after 1.5s.

---

#### `pages/AdminOrdersPage.tsx` (396 lines)
Admin order management table. Search by order ID, user email, status. Status filter tabs: All, Active, Completed, Cancelled. Fetches user emails via `/internal/users/{userId}`. Payment decision workflow for PAYMENT_PENDING orders: dropdown (SUCCESS/FAILED/CANCELLED/REFUNDED) + Apply button. Cancel order button. View details button. Mobile-responsive card layout.

---

#### `layouts/Layout.tsx` (200 lines)
Main layout wrapper:
- **Line 38**: `<Navbar />` at top
- **Lines 39-43**: `<main>` with `<Outlet />` for page content
- **Lines 46-96**: Mobile bottom navigation (Home, Search, Cart, Orders, Profile) - only for authenticated non-admin users
- **Lines 98-197**: Footer with 4 columns: brand info, quick links, contact details, why-choose-us features. Copyright bar at bottom.

---

#### `layouts/AdminLayout.tsx` (189 lines)
Admin-specific layout with collapsible sidebar:
- **Lines 32-48**: Navigation items: Dashboard, Medicines, Orders (with icons)
- **Lines 68-160**: Sidebar with logo, nav links, "View Store" quick link, user profile with logout button
- **Lines 162-187**: Main content area with mobile header (hamburger + title) and page content
- **Line 3**: Wraps main Layout (includes Navbar + Footer)

---

## BACKEND - REMAINING FILES (DTOs, Repositories, Configs, Health Indicators)

---

### pharmacy-common

#### `dto/notification/CreateNotificationDispatchRequest.java` (35 lines)
**Lines 1-8**: Package declaration, imports Jakarta validation annotations (`@NotBlank`, `@NotNull`), and Lombok annotations (`@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`).
**Lines 10-12**: Javadoc: Internal contract used when the notification service asks the identity service to persist an in-app notification row and return the user's email for delivery.
**Lines 13-17**: Class declaration with Lombok annotations for auto-generated getters, setters, builder, and constructors.
**Lines 19-20**: `@NotNull Long userId` - Target user ID for the notification.
**Lines 22-26**: `@NotBlank String type` - Must match `Notification.NotificationType` enum name in identity service (e.g., ORDER_PLACED).
**Lines 28-29**: `@NotBlank String title` - Notification title.
**Lines 31-32**: `@NotBlank String message` - Notification body text.
**Lines 34**: `String referenceId` - Optional external reference (e.g., order ID).

---

#### `dto/notification/NotificationDispatchResponse.java` (15 lines)
**Lines 1-6**: Package, Lombok annotations.
**Lines 8-12**: Simple response DTO with two fields: `Long notificationId` (the persisted notification's ID) and `String email` (the user's email address for dispatch). Used by identity service to return notification creation result to the calling service.

---

#### `feign/InventoryInfoDTO.java` (68 lines)
**Lines 1-4**: Package, imports `LocalDate`.
**Lines 5-14**: Plain DTO (no Lombok) with manual fields: `id`, `medicineId`, `medicineName`, `batchNumber`, `quantity`, `expiryDate`, `expired`, `expiringSoon`. Used for cross-service inventory data transfer via Feign.
**Lines 15-27**: No-arg constructor and all-args constructor.
**Lines 29-50**: Manual Builder pattern for fluent construction.
**Lines 52-67**: Manual getters and setters for all fields.

---

#### `feign/MedicineInfoDTO.java` (53 lines)
**Lines 1-10**: Plain DTO with fields: `id`, `name`, `price`, `requiresPrescription`, `stock`, `inStock`. Used for cross-service medicine data transfer via Feign.
**Lines 11-20**: Constructors (no-arg and all-args).
**Lines 22-39**: Manual Builder pattern.
**Lines 41-52**: Manual getters and setters.

---

#### `feign/OrderSummaryDTO.java` (93 lines)
**Lines 1-15**: DTO with fields: `id`, `userId`, `status`, `totalAmount`, `deliveryFee`, `discount`, `grandTotal`, `orderedAt`, `updatedAt`, and nested `PaymentSummary payment`. Used for cross-service order data transfer.
**Lines 17-30**: Constructor without payment.
**Lines 32-44**: Constructor with payment.
**Lines 46-71**: Manual Builder pattern with payment support.
**Lines 73-92**: Manual getters and setters.

---

#### `feign/PaymentSummary.java` (53 lines)
**Lines 1-9**: DTO with fields: `id`, `status`, `paymentMethod`, `transactionId`, `amount`, `paidAt` (LocalDateTime). Used as nested object in `OrderSummaryDTO`.
**Lines 11-20**: Constructors.
**Lines 22-39**: Manual Builder pattern.
**Lines 41-52**: Manual getters and setters.

---

#### `feign/PrescriptionCheckDTO.java` (51 lines)
**Lines 1-14**: DTO with fields: `hasValidPrescription` (Boolean), `prescriptionId` (Long), `status` (String). Used for cross-service prescription validation checks.
**Lines 16-43**: Manual Builder pattern.
**Lines 45-50**: Manual getters and setters.

---

#### `outbox/OutboxEventRepository.java` (32 lines)
**Lines 1-12**: Package, imports JPA annotations, `LocalDateTime`, `List`. Interface extends `JpaRepository<OutboxEvent, Long>`.
**Lines 13**: `@Repository` stereotype.
**Lines 15-16**: `findPendingEvents(maxRetries)` - Finds events with status PENDING or FAILED (with retries remaining), ordered by creation date ascending.
**Lines 18-19**: `findAllPending()` - Finds all PENDING events ordered by creation date.
**Lines 21**: `findByAggregateTypeAndAggregateId()` - Finds events for a specific aggregate (e.g., a specific order).
**Lines 23**: `existsByEventId()` - Checks for duplicate events by their unique event ID.
**Lines 25-27**: `deleteOldCompletedEvents(before)` - Deletes COMPLETED events older than the given timestamp (cleanup).
**Lines 29-31**: `resetStaleProcessingEvents(timeout)` - Resets PROCESSING events stuck beyond timeout back to PENDING (recovery from crashed publishers).

---

#### `outbox/ProcessedEventRepository.java` (19 lines)
**Lines 1-13**: Package, imports. Interface extends `JpaRepository<ProcessedEvent, Long>`.
**Lines 14**: `existsByConsumerAndEventId(consumer, eventId)` - Idempotency check: whether a specific consumer has already processed an event.
**Lines 16-18**: `deleteOldProcessedEvents(before)` - Deletes processed event records older than the given timestamp (cleanup).

---

#### `config/actuator/EurekaHealthIndicator.java` (37 lines)
**Lines 1-13**: Implements Spring Boot `HealthIndicator`. Injects `eureka.client.enabled` config (defaults to true).
**Lines 18-36**: `health()` method: if Eureka is disabled, returns `unknown` status. Otherwise returns `up` status. On exception, logs warning and returns `down` status with error detail.

---

#### `config/actuator/RabbitMQHealthIndicator.java` (38 lines)
**Lines 1-20**: Implements `HealthIndicator`. Conditionally activated only if `RabbitTemplate` bean exists (`@ConditionalOnBean`). Constructor-injected `RabbitTemplate`.
**Lines 22-37**: `health()` method: executes a no-op channel operation to test connectivity. Returns `up` on success, `down` with error on failure.

---

#### `config/actuator/RedisHealthIndicator.java` (37 lines)
**Lines 1-21**: Implements `HealthIndicator`. Conditionally activated if `RedisConnectionFactory` exists. Constructor-injected connection factory.
**Lines 23-36**: `health()` method: calls `getConnection().ping()` to test Redis connectivity. Returns `up` on success, `down` on failure.

---

#### `config/actuator/ServiceDependenciesHealthIndicator.java` (69 lines)
**Lines 1-16**: Implements `HealthIndicator`. Maintains a thread-safe `ConcurrentHashMap<String, HealthStatus>` tracking health of individual service dependencies.
**Lines 18-36**: `health()` method: aggregates all tracked services. Returns `up` if all are healthy, `down` otherwise. Includes per-service UP/DOWN details.
**Lines 38-46**: `updateServiceHealth(serviceName, isHealthy[, message])` - Called by other components to update the health status of a specific service dependency.
**Lines 48-68**: Inner `HealthStatus` class: immutable record with `healthy` boolean and optional `message` string.

---

### pharmacy-identity

#### `dto/AddressDTO.java` (117 lines)
**Lines 1-21**: Response DTO for addresses with fields: `id`, `addressLine`, `city`, `state`, `pincode`, `isDefault`. No-arg and all-args constructors.
**Lines 23-116**: Manual builder pattern (`AddressDTOBuilder`) and manual getters/setters for all fields. Used to return address data to clients.

---

#### `dto/AddressRequest.java` (57 lines)
**Lines 1-28**: Request DTO for creating/updating addresses. Fields: `addressLine` (@NotBlank), `city` (@NotBlank), `state` (optional), `pincode` (@NotBlank), `isDefault` (optional).
**Lines 30-56**: Manual getters/setters and builder pattern.

---

#### `dto/AuthResponse.java` (149 lines)
**Lines 1-25**: Response DTO returned after successful login/signup. Fields: `token` (JWT), `tokenType` (usually "Bearer"), `userId`, `email`, `name`, `mobile`, `role`, `otpRequired` (boolean flag for 2FA flow).
**Lines 27-148**: Manual builder (`AuthResponseBuilder`) and getters/setters.

---

#### `dto/LoginRequest.java` (61 lines)
**Lines 1-21**: Request DTO for login. Fields: `email` (@NotBlank, @Email), `password` (@NotBlank).
**Lines 23-60**: Manual builder and getters/setters.

---

#### `dto/NotificationDTO.java` (167 lines)
**Lines 1-29**: Response DTO for in-app notifications. Fields: `id`, `type` (ORDER/PRESCRIPTION/etc.), `title`, `message`, `referenceId`, `isRead`, `emailSent`, `createdAt`, `updatedAt`.
**Lines 31-166**: Manual builder and getters/setters.

---

#### `dto/OtpRequest.java` (67 lines)
**Lines 1-23**: Request DTO for sending OTP. Fields: `email` (@NotBlank, @Email), `otpType` (@NotNull, enum `OtpType` from entity).
**Lines 25-66**: Manual builder, getters/setters. Note: Contains an unused `OtpTypeEnum` (LOGIN, SIGNUP, PASSWORD_RESET) which appears to be a duplicate of the entity's `OtpType`.

---

#### `dto/OtpResponse.java` (102 lines)
**Lines 1-20**: Response DTO for OTP generation. Fields: `email`, `otpType` (string), `message` (user-friendly text), `expiresInMinutes`, `verified` (boolean).
**Lines 22-101**: Manual builder and getters/setters.

---

#### `dto/OtpVerificationRequest.java` (81 lines)
**Lines 1-27**: Request DTO for verifying an OTP code. Fields: `email` (@NotBlank, @Email), `otpCode` (@NotBlank), `otpType` (@NotNull).
**Lines 29-80**: Manual builder and getters/setters.

---

#### `dto/SignupRequest.java` (100 lines)
**Lines 1-32**: Request DTO for user registration. Fields: `name` (@NotBlank, @Size 2-100), `email` (@NotBlank, @Email), `password` (@NotBlank, @Size 6-100), `mobile` (@Size max 20, optional).
**Lines 34-99**: Manual builder and getters/setters.

---

#### `dto/TokenValidationResponse.java` (42 lines)
**Lines 1-16**: Minimal response DTO with single `boolean valid` field. Uses OpenAPI `@Schema` annotations for documentation. Used by gateway to validate JWT tokens via identity service.
**Lines 18-41**: Manual builder and getters/setters.

---

#### `dto/UpdateProfileRequest.java` (46 lines)
**Lines 1-21**: Request DTO for profile updates. Fields: `name` (optional), `email` (@Email if provided), `mobile` (optional). All fields are optional - only provided fields are updated.
**Lines 23-45**: Manual getters/setters (no builder).

---

#### `dto/UserDTO.java` (65 lines)
**Lines 1-23**: Response DTO for user data. Fields: `id`, `name`, `email`, `mobile`, `role`, `status`, `message` (optional success/error message).
**Lines 25-64**: Manual builder and getters/setters.

---

#### `repository/AddressRepository.java` (22 lines)
**Lines 1-13**: JPA repository for `Address` entity.
**Line 15**: `findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId)` - Returns user's addresses with default address first, then by creation date descending.
**Lines 17-19**: `clearDefaultForUser(userId)` - Bulk update setting all user's addresses to non-default (used before setting a new default).
**Line 21**: `countByUserId(userId)` - Count of addresses for a user.

---

#### `repository/NotificationRepository.java` (30 lines)
**Lines 1-15**: JPA repository for `Notification` entity.
**Line 17**: `findByUserIdOrderByCreatedAtDesc(userId, pageable)` - Paginated notification history for a user.
**Line 19**: `findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)` - Unread notifications for a user.
**Line 21**: `countByUserIdAndIsReadFalse(userId)` - Unread notification count (for badge display).
**Lines 23-25**: `markAllAsRead(userId)` - Bulk update marking all user's notifications as read.
**Lines 27-29**: `markEmailSent(id)` - Updates a single notification's `emailSent` flag.

---

#### `repository/OtpVerificationRepository.java` (27 lines)
**Lines 1-15**: JPA repository for `OtpVerification` entity.
**Lines 17-18**: `findTopByEmailAndOtpTypeAndStatusOrderByCreatedAtDesc(email, type, status)` - Finds the most recent OTP for a given email, type, and status (e.g., the latest PENDING OTP).
**Lines 20-22**: `deleteByEmailAndOtpType(email, type)` - Deletes all OTPs for a given email/type combination (cleanup on successful verification).
**Lines 24-26**: `expireAllOldOtps()` - Bulk update marking OTPs as EXPIRED where `expiresAt < CURRENT_TIMESTAMP`.

---

#### `repository/UserRepository.java` (15 lines)
**Lines 1-10**: JPA repository for `User` entity.
**Line 12**: `findByEmail(email)` - Finds user by email (used for login).
**Line 14**: `existsByEmail(email)` - Checks if email is already registered (used during signup).

---

#### `config/IdentityOpenApiConfig.java` (69 lines)
**Lines 1-14**: OpenAPI (Swagger) configuration for identity service. Injects URLs for all microservices from config.
**Lines 16-31**: Class declaration with `@Configuration("identityOpenApiConfig")`. Defines `SECURITY_SCHEME_NAME = "bearerAuth"`.
**Lines 33-68**: `identityOpenAPI()` bean: creates OpenAPI spec with title "Pharmacy API - Identity Service", description with Quick Start instructions, server URLs for all 4 services (identity, catalog, orders, admin), and JWT bearer auth security scheme.

---

#### `config/RedisConfig.java` (24 lines)
**Lines 1-11**: Configuration class for Redis serialization.
**Lines 13-23**: `redisTemplate()` bean: configures `RedisTemplate<String, Object>` with `StringRedisSerializer` for keys and `GenericJackson2JsonRedisSerializer` for values (both regular and hash keys/values). Enables storing Java objects as JSON in Redis.

---

### pharmacy-catalog

#### `dto/CategoryDTO.java` (17 lines)
**Lines 1-12**: Simple DTO using Lombok (`@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`). Fields: `id`, `name`, `description`, `imageUrl`.

---

#### `dto/InventoryDTO.java` (24 lines)
**Lines 1-14**: Lombok DTO for inventory data. Fields: `id`, `medicineId`, `medicineName`, `batchNumber`, `quantity`, `manufactureDate`, `expiryDate`, `expired`, `expiringSoon`.

---

#### `dto/InventoryRequest.java` (33 lines)
**Lines 1-17**: Request DTO for adding inventory. Fields: `medicineId` (@NotNull), `batchNumber` (@NotBlank), `quantity` (@NotNull, @Min 0), `manufactureDate` (optional), `expiryDate` (@NotNull).
**Lombok annotations**: @Data, @Builder, @NoArgsConstructor, @AllArgsConstructor.

---

#### `dto/MedicineDetailDTO.java` (32 lines)
**Lines 1-15**: Extended medicine DTO with full inventory details. Fields: `id`, `name`, `description`, `categoryId`, `categoryName`, `price`, `mrp`, `requiresPrescription`, `stock`, `inStock`, `expiryDate`, `expiringSoon`, `dosageForm`, `strength`, `manufacturer`, `inventoryList` (List<InventoryDTO>).

---

#### `dto/MedicineDTO.java` (30 lines)
**Lines 1-14**: Standard medicine DTO. Fields: `id`, `name`, `description`, `categoryId`, `categoryName`, `price`, `mrp`, `requiresPrescription`, `stock`, `inStock`, `expiringSoon`, `expiryDate`, `dosageForm`, `strength`, `manufacturer`.

---

#### `dto/MedicineRequest.java` (40 lines)
**Lines 1-14**: Request DTO for creating/updating medicines. Fields: `name` (@NotBlank), `description`, `categoryId`, `price` (@Positive), `mrp`, `requiresPrescription`, `stock` (@Positive), `expiryDate` (String), `dosageForm`, `strength`, `manufacturer`.

---

#### `dto/MedicineWithInventoryRequest.java` (49 lines)
**Lines 1-17**: Combined request DTO for creating a medicine with its initial inventory in one call. Fields: medicine fields (`name`, `description`, `categoryId`, `price`, `mrp`, `requiresPrescription`, `dosageForm`, `strength`, `manufacturer`) plus inventory fields (`batchNumber`, `initialStock` @NotNull @Positive, `manufactureDate`, `expiryDate` @NotNull).

---

#### `dto/PrescriptionCheckDTO.java` (16 lines)
**Lines 1-12**: Simple Lombok DTO for prescription validation results. Fields: `hasValidPrescription`, `prescriptionId`, `status`.

---

#### `dto/PrescriptionDTO.java` (27 lines)
**Lines 1-14**: Lombok DTO for prescription data. Fields: `id`, `userId`, `medicineId`, `medicineName`, `filePath`, `fileName`, `status`, `rejectionReason`, `reviewedBy`, `uploadedAt`, `reviewedAt`, `expiresAt`.

---

#### `dto/SearchRequest.java` (19 lines)
**Lines 1-12**: Lombok DTO for medicine search filters. Fields: `name`, `categoryId`, `minPrice`, `maxPrice`, `requiresPrescription`, `inStock`.

---

#### `repository/CategoryRepository.java` (13 lines)
**Lines 1-10**: JPA repository for `Category` entity.
**Line 11**: `findByName(name)` - Finds category by exact name.
**Line 12**: `existsByName(name)` - Checks if category name already exists.

---

#### `repository/InventoryRepository.java` (39 lines)
**Lines 1-17**: JPA repository for `Inventory` entity with pessimistic locking support.
**Line 19**: `findByMedicineId(medicineId)` - All inventory batches for a medicine.
**Lines 21-22**: `findActiveByMedicineId(medicineId, date)` - Non-expired batches ordered by expiry date (FIFO).
**Lines 24-26**: `findActiveByMedicineIdWithLock(medicineId, date)` - Same as above but with `PESSIMISTIC_WRITE` lock to prevent race conditions during checkout.
**Lines 28-29**: `findExpiringBefore(date)` - Batches expiring before a date with remaining stock.
**Lines 31-32**: `getTotalAvailableStock(medicineId, date)` - SUM of quantities for non-expired batches.
**Lines 34-36**: `decrementStock(id, quantity)` - Atomically reduces stock only if sufficient quantity exists (returns 0 if insufficient).
**Line 38**: `findFirstByMedicineIdAndExpiryDateAfterOrderByExpiryDateAsc` - Earliest-expiring non-expired batch for a medicine.

---

#### `repository/MedicineRepository.java` (29 lines)
**Lines 1-13**: JPA repository for `Medicine` entity, extends `JpaSpecificationExecutor<Medicine>` for dynamic query building (used with `MedicineSpecification`).
**Line 15**: `findByActiveTrue()` - All active medicines.
**Line 17**: `findByCategoryIdAndActiveTrue(categoryId)` - Active medicines in a category.
**Lines 19-20**: `searchByName(name)` - Case-insensitive LIKE search on medicine name.
**Lines 22-23**: `findAllRequiringPrescription()` - All active medicines requiring prescription.
**Lines 25-26**: `findLowStock(threshold)` - Active medicines with stock below threshold.
**Line 28**: `existsByName(name)` - Duplicate name check.

---

#### `repository/PrescriptionRepository.java` (38 lines)
**Lines 1-16**: JPA repository for `Prescription` entity.
**Line 18**: `findByUserIdOrderByUploadedAtDesc(userId)` - User's prescriptions sorted by upload date.
**Line 20**: `findByStatusOrderByUploadedAtDesc(status)` - Prescriptions by status (e.g., PENDING for admin review).
**Line 22**: `findByUserIdAndStatus(userId, status)` - User's prescriptions filtered by status.
**Line 24**: `findByUserIdAndMedicineIdAndStatus(userId, medicineId, status)` - Specific prescription for user+medicine+status.
**Lines 26-27**: `findApprovedForUserAndMedicine(userId, medicineId)` - Finds approved prescription for a specific medicine, ordered by review date descending.
**Lines 29-31**: `expireOldPrescriptions(now)` - Bulk update marking APPROVED prescriptions as EXPIRED where `expiresAt < now`.
**Line 33-34**: `countByStatus(status)` - Count prescriptions by status.
**Line 36-37**: `countPendingPrescriptions()` - Count of PENDING prescriptions (admin dashboard metric).

---

#### `config/OpenApiConfig.java` (72 lines)
**Lines 1-17**: OpenAPI configuration for catalog service. Identical pattern to identity's config.
**Lines 19-71**: `catalogOpenAPI()` bean: title "Pharmacy API - Catalog Service", description with Quick Start (browse, search, prescriptions), notes on public vs protected endpoints, server URLs for all 4 services, JWT bearer auth security scheme.

---

### pharmacy-orders

#### `dto/AddToCartRequest.java` (23 lines)
**Lines 1-14**: Request DTO for adding items to cart. Fields: `medicineId` (@NotNull), `quantity` (@NotNull, @Min 1), `prescriptionId` (optional, for prescription medicines).
**Lombok**: @Data, @Builder, @NoArgsConstructor, @AllArgsConstructor.

---

#### `dto/CartDTO.java` (22 lines)
**Lines 1-15**: Response DTO for shopping cart. Fields: `id`, `userId`, `items` (List<CartItemDTO>), `subtotal`, `totalItems`, `updatedAt`.

---

#### `dto/CartItemDTO.java` (23 lines)
**Lines 1-14**: Response DTO for a cart line item. Fields: `id`, `medicineId`, `medicineName`, `quantity`, `unitPrice`, `subtotal`, `prescriptionId`, `addedAt`.

---

#### `dto/CheckoutRequest.java` (22 lines)
**Lines 1-13**: Request DTO for starting checkout. Fields: `address` (@NotBlank), `pincode` (optional), `deliverySlot` (optional), `notes` (optional).

---

#### `dto/OrderDTO.java` (31 lines)
**Lines 1-15**: Response DTO for a complete order. Fields: `id`, `userId`, `status`, `totalAmount`, `deliveryFee`, `discount`, `grandTotal`, `addressSnapshot`, `addressPincode`, `deliverySlot`, `notes`, `items` (List<OrderItemDTO>), `payment` (PaymentDTO), `orderedAt`, `updatedAt`.

---

#### `dto/OrderItemDTO.java` (20 lines)
**Lines 1-12**: Response DTO for an order line item. Fields: `id`, `medicineId`, `medicineName`, `quantity`, `unitPrice`, `subtotal`, `prescriptionId`.

---

#### `dto/PaymentDTO.java` (21 lines)
**Lines 1-14**: Response DTO for payment data. Fields: `id`, `status`, `paymentMethod`, `transactionId`, `amount`, `paidAt`.

---

#### `dto/PaymentRequest.java` (14 lines)
**Lines 1-12**: Minimal request DTO for processing payment. Single field: `paymentMethod` (e.g., "COD", "UPI").

---

#### `repository/CartItemRepository.java` (15 lines)
**Lines 1-11**: JPA repository for `CartItem` entity.
**Line 12**: `findByCartId(cartId)` - All items in a cart.
**Line 13**: `findByCartIdAndMedicineId(cartId, medicineId)` - Specific item in a cart (for updating quantity).
**Line 14**: `deleteByCartId(cartId)` - Deletes all items in a cart (used during checkout).

---

#### `repository/CartRepository.java` (12 lines)
**Lines 1-11**: JPA repository for `Cart` entity.
**Line 11**: `findByUserId(userId)` - Finds a user's cart (one cart per user).

---

#### `repository/OrderItemRepository.java` (12 lines)
**Lines 1-11**: JPA repository for `OrderItem` entity.
**Line 11**: `findByOrderId(orderId)` - All line items for an order.

---

#### `repository/OrderRepository.java` (39 lines)
**Lines 1-16**: JPA repository for `Order` entity. All queries use `LEFT JOIN FETCH o.payment` to eagerly load payment data and avoid N+1 queries.
**Line 18**: `findByUserIdOrderByOrderedAtDesc(userId)` - User's order history.
**Line 21**: Paginated version of above.
**Line 24**: `findByStatus(status)` - All orders with a specific status.
**Line 27**: Paginated version.
**Lines 29-30**: `findAll()` - All orders (admin).
**Line 33**: Paginated version.
**Lines 35-36**: `findByIdWithPayment(id)` - Single order with payment eagerly loaded.
**Line 38**: `countByStatus(status)` - Count orders by status.

---

#### `repository/PaymentRepository.java` (12 lines)
**Lines 1-11**: JPA repository for `Payment` entity.
**Line 11**: `findByOrderId(orderId)` - Payment for a specific order.

---

#### `config/OpenApiConfig.java` (72 lines)
**Lines 1-17**: OpenAPI configuration for orders service.
**Lines 19-71**: `ordersOpenAPI()` bean: title "Pharmacy API - Orders Service", description with checkout flow steps (cart → checkout → payment → confirm), notes that all endpoints require auth, server URLs for all 4 services, JWT bearer auth.

---

### pharmacy-admin

#### `dto/DashboardDTO.java` (20 lines)
**Lines 1-12**: Lombok DTO for admin dashboard metrics. Fields: `totalOrders`, `pendingOrders`, `completedOrders`, `totalRevenue`, `pendingPrescriptions`, `lowStockItems`, `expiringBatches`. All `long` type for aggregate counts.

---

#### `config/OpenApiConfig.java` (76 lines)
**Lines 1-17**: OpenAPI configuration for admin service.
**Lines 19-75**: `adminOpenAPI()` bean: title "Pharmacy API - Admin Service", description with admin features (dashboard KPIs, medicine CRUD, prescription review, order management, user management, inventory), IMPORTANT note about requiring ADMIN role, server URLs for all 4 services, JWT bearer auth with ADMIN role note.

---

### pharmacy-notifications

#### `config/NotificationsSecurityConfig.java` (28 lines)
**Lines 1-13**: Security configuration for the notifications service. Uses `@EnableWebSecurity`.
**Lines 15-27**: `securityFilterChain()` bean configures:
- **Line 18**: Stateless session management (no HTTP sessions, JWT-based).
- **Lines 19-21**: CSRF protection with cookie-based token repository, but exempts `/api/emails/**` endpoints (since this service only receives internal requests, not browser requests).
- **Lines 22-25**: Authorization rules: actuator health/info/prometheus endpoints are public, `/api/emails/**` endpoints are public (called by other services internally), all other requests are denied.
- This is intentionally permissive because the notifications service is an internal-only service called by other microservices, not exposed to end users.

---

## REMAINING MAIN SOURCE FILES

### pharmacy-eureka

#### `EurekaServerApplication.java` (13 lines)
**Lines 1-5**: Package declaration, imports `SpringApplication`, `@SpringBootApplication`, and `@EnableEurekaServer` from Spring Cloud Netflix.
**Lines 7-12**: Standard Spring Boot main application class. `@EnableEurekaServer` activates the Eureka server (service registry). The `main()` method bootstraps the application.

---

### pharmacy-common (remaining)

#### `PharmacyCommonApplication.java` (9 lines)
**Lines 1-8**: Minimal Spring Boot application class for the shared `pharmacy-common` library. Has an empty `main()` method -- this module is a library, not a standalone service. The `@SpringBootApplication` annotation enables component scanning within `com.pharmacy.common`.

---

#### `exception/InvalidFileException.java` (7 lines)
**Lines 1-6**: Simple custom runtime exception for invalid file uploads (e.g., wrong format, corrupted image). Extends `RuntimeException`, takes a single `message` parameter passed to the superclass.

---

#### `feign/CatalogFeignClientFallbackFactory.java` (71 lines)
**Lines 1-13**: Implements `FallbackFactory<CatalogFeignClient>` for Resilience4j/OpenFeign circuit breaker pattern. Logs the error that triggered the fallback.
**Lines 16-69**: Returns a fallback implementation of `CatalogFeignClient` where each method returns safe defaults:
- `getMedicineInfo()` → `null` (medicine unavailable)
- `checkPrescription()` → `hasValidPrescription: false` (conservative: deny without catalog)
- `countPendingPrescriptions()` → `0`
- `getLowStockItems()` / `getExpiringBatches()` → empty list
- `getAvailableStock()` → `0`
- `reserveStock()` / `releaseStock()` → `false` (cannot modify stock when catalog is down)

---

#### `feign/OrdersFeignClientFallbackFactory.java` (28 lines)
**Lines 1-14**: Implements `FallbackFactory<OrdersFeignClient>`. Logs the trigger error.
**Lines 16-27**: Fallback returns `Collections.emptyList()` for `getAllOrders()` when the orders service is unreachable.

---

### pharmacy-catalog (remaining)

#### `config/SecurityConfig.java` (73 lines)
**Lines 1-24**: Spring Security configuration with `@EnableWebSecurity` and `@EnableMethodSecurity`. Injects `JwtHeaderAuthenticationFilter` and CORS allowed origins from config (defaults to localhost:3000, 5173, 8080).
**Lines 26-33**: Constructor injection for the JWT filter.
**Lines 35-55**: `securityFilterChain()` configures:
- CSRF disabled (stateless API)
- CORS with configured source
- Stateless session management
- JWT filter added before `UsernamePasswordAuthenticationFilter`
- Authorization rules: GET `/api/catalog/medicines/**`, `/categories/**`, `/inventory/**` are public; Swagger, actuator, and `/internal/**` endpoints are public; prescription endpoints require auth; everything else requires auth.
**Lines 57-72**: `corsConfigurationSource()` bean: configures allowed origins, methods (GET/POST/PUT/PATCH/DELETE/OPTIONS), headers (Authorization, Content-Type, X-Requested-With), exposed headers (Authorization, X-User-Id, X-User-Email, X-User-Role), allows credentials, 1-hour preflight cache.

---

#### `security/JwtUserPrincipal.java` (12 lines)
**Lines 1-12**: Lombok `@Getter` and `@AllArgsConstructor` class representing the authenticated user principal. Contains `userId` (Long), `email` (String), and `role` (String). Used by `SecurityContextHolder` after the JWT filter authenticates a request.

---

#### `config/JwtHeaderAuthenticationFilter.java` (56 lines)
**Lines 1-21**: Extends `OncePerRequestFilter`. Reads `X-User-Id`, `X-User-Email`, `X-User-Role` headers set by the API gateway.
**Lines 23-55**: `doFilterInternal()`: extracts the three headers. If userId and email are present, creates a `JwtUserPrincipal`, wraps it in a `SimpleGrantedAuthority` with `ROLE_` prefix, creates a `UsernamePasswordAuthenticationToken`, sets it in `SecurityContextHolder`, and continues the filter chain. This is a **header-based authentication** pattern -- the gateway validates the JWT, then forwards user identity via headers to downstream services.

---

#### `PharmacyCatalogApplication.java` (22 lines)
**Lines 1-17**: Main application class for the catalog service. Scans both `com.pharmacy.catalog` and `com.pharmacy.common` packages. Excludes Redis autoconfiguration (not needed for this service). Enables scheduling (`@EnableScheduling`) for periodic tasks (e.g., expiry checks) and RabbitMQ listeners (`@EnableRabbit`). `@ComponentScan` explicitly specifies packages.

---

### pharmacy-identity (remaining)

#### `event/IdentityEventPublisher.java` (50 lines)
**Lines 1-23**: Component that publishes domain events to RabbitMQ. Constructor-injected `RabbitTemplate`.
**Lines 25-36**: `publishUserRegistered(event)`: assigns UUID event ID, sets event type to "USER_REGISTERED", sets timestamp, and sends to `RabbitMQConfig.USER_EXCHANGE` with the appropriate routing key.
**Lines 38-49**: `publishUserLoggedIn(event)`: same pattern but for "USER_LOGGED_IN" event type.

---

#### `PharmacyIdentityApplication.java` (15 lines)
**Lines 1-14**: Main application class. Scans `com.pharmacy.identity` and `com.pharmacy.common`. Enables RabbitMQ listeners (`@EnableRabbit`) for processing async events.

---

### pharmacy-orders (remaining)

#### `converter/OrderStatusConverter.java` (25 lines)
**Lines 1-8**: JPA `AttributeConverter` that converts `OrderStatus` enum to/from String in the database. `@Converter` annotation.
**Lines 10-16**: `convertToDatabaseColumn()`: converts enum to its `name()`. Defaults to "CHECKOUT_STARTED" if null.
**Lines 18-24**: `convertToEntityAttribute()`: converts String back to enum via `valueOf()`. Defaults to `CHECKOUT_STARTED` if null.

---

#### `config/JwtHeaderAuthenticationFilter.java` (109 lines)
**Lines 1-34**: Extends `OncePerRequestFilter`. Similar to catalog's filter but with **dual authentication**: supports both gateway headers (`X-User-Id`, etc.) AND direct Bearer token validation. Has `JwtUtil` dependency.
**Lines 36-61**: `doFilterInternal()`: if not already authenticated, tries `principalFromGatewayHeaders()` first, then falls back to `principalFromBearerToken()`. Sets the principal in `SecurityContextHolder`.
**Lines 63-82**: `principalFromGatewayHeaders()`: extracts headers, creates `JwtUserPrincipal`. Returns `Optional.empty()` if headers missing or userId is not a valid number.
**Lines 84-108**: `principalFromBearerToken()`: extracts `Authorization: Bearer <token>` header, validates token via `JwtUtil`, extracts userId/email/role claims, creates principal. This allows the orders service to be called directly (not just through the gateway).

---

#### `security/JwtUserPrincipal.java` (12 lines)
**Lines 1-12**: Identical to catalog's version. Lombok `@Getter` and `@AllArgsConstructor` with `userId`, `email`, `role`.

---

#### `PharmacyOrdersApplication.java` (24 lines)
**Lines 1-20**: Main application class. Scans `com.pharmacy.orders` and `com.pharmacy.common`. Excludes Redis autoconfiguration. Enables Feign clients (`@EnableFeignClients`) for inter-service calls, RabbitMQ listeners, and scheduling.

---

### pharmacy-notifications (remaining)

#### `PharmacyNotificationsApplication.java` (38 lines)
**Lines 1-15**: Package, imports. Javadoc explains this service is stateless (Feign + Rabbit + mail only, no database). Excludes DataSource, Hibernate, JPA, Redis autoconfigurations. Imports only `RabbitMQConfig` and `GlobalExceptionHandler` from `pharmacy-common`. Enables only `IdentityNotificationFeignClient` (not catalog/orders Feign clients).
**Lines 17-22**: Javadoc explains the selective import strategy.
**Lines 23-37**: `@SpringBootApplication` with extensive exclusions, `@Import` for shared configs, `@EnableFeignClients` with only the identity notification client, `@EnableRabbit` for message listeners.

---

### pharmacy-admin (remaining)

#### `PharmacyAdminApplication.java` (22 lines)
**Lines 1-21**: Main application class. Scans `com.pharmacy.admin` and `com.pharmacy.common`. Excludes Redis and RabbitMQ autoconfiguration (admin service doesn't produce/consume messages directly -- it aggregates via Feign clients). Enables Feign clients for calling other services.

---

## TEST FILES

### pharmacy-eureka

#### `EurekaServerApplicationTest.java` (14 lines)
**Lines 1-13**: Standard `@SpringBootTest` with "test" profile. Empty `contextLoads()` test verifies the application context starts successfully.

---

### pharmacy-config

#### `ConfigServerApplicationTest.java` (14 lines)
**Lines 1-13**: `@SpringBootTest` with "test" and "native" profiles. Empty `contextLoads()` test for the Spring Cloud Config server.

---

### pharmacy-common (tests)

#### `exception/GlobalExceptionHandlerTest.java` (134 lines)
**Lines 1-16**: Imports for MockMvc testing, Spring exception types, and HTTP status assertions.
**Lines 17-67**: `ProbeController` -- a test controller that throws various exceptions for each endpoint (ResourceNotFoundException, BadRequestException, UnauthorizedException, IllegalArgumentException, InsufficientStockException, InvalidFileException, MaxUploadSizeExceededException, DataIntegrityViolationException, RuntimeException).
**Lines 69-74**: `setUp()` builds MockMvc with `GlobalExceptionHandler` as `@ControllerAdvice`.
**Lines 76-133**: Nine test methods verify correct HTTP status and JSON response for each exception type: 404 for not found, 400 for bad request/illegal argument/insufficient stock/invalid file/file too large, 401 for unauthorized, 409 for data integrity violation, 500 for generic runtime exceptions.

---

#### `events/EventTest.java` (185 lines)
**Lines 1-41**: Tests `OrderPlacedEvent` creation with builder pattern, verifies all fields (orderId, userId, grandTotal, items with medicine name/quantity/price), plus base event fields (eventId, eventType, timestamp, correlationId).
**Lines 43-61**: Tests `OrderCancelledEvent` with orderId, userId, reason.
**Lines 63-88**: Tests `InventoryReservedEvent` with reservation items (medicineId, quantity, batchNumber).
**Lines 90-109**: Tests `InventoryReleasedEvent` with release items.
**Lines 111-130**: Tests `PrescriptionApprovedEvent` with prescriptionId, userId, medicineId, medicineName.
**Lines 132-149**: Tests `PrescriptionRejectedEvent` with reason field.
**Lines 151-170**: Tests `UserRegisteredEvent` with userId, email, firstName, lastName.
**Lines 172-184**: Tests `BaseEvent` abstract class field setters/getters.

---

#### `feign/CatalogFeignClientTest.java` (108 lines)
**Lines 1-29**: Tests `MedicineInfoDTO.builder()` with all fields.
**Lines 31-42**: Tests `PrescriptionCheckDTO.builder()`.
**Lines 44-63**: Tests `InventoryInfoDTO.builder()`.
**Lines 65-84**: Tests `OrderSummaryDTO.builder()` with financial fields.
**Lines 86-96**: Tests `MedicineInfoDTO` nullability (no-arg constructor produces null fields).
**Lines 98-107**: Tests `PrescriptionCheckDTO` with only `hasValidPrescription` set (other fields null).

---

#### `feign/FeignFallbackFactoriesTest.java` (33 lines)
**Lines 1-22**: Tests `CatalogFeignClientFallbackFactory.create()` returns safe defaults: `getMedicineInfo(1L)` returns null, `checkPrescription()` returns false, `countPendingPrescriptions()` returns 0, list methods return empty, `getAvailableStock()` returns 0.
**Lines 24-32**: Tests `OrdersFeignClientFallbackFactory.create()` returns empty list for `getAllOrders()`.

---

#### `outbox/OutboxServiceTest.java` (107 lines)
**Lines 1-28**: `@ExtendWith(MockitoExtension.class)`, mocks `OutboxEventRepository`, uses `@InjectMocks` for `OutboxService`.
**Lines 30-33**: `wireMapper()` injects real `ObjectMapper` into service via reflection.
**Lines 35-50**: `saveEvent_serializesAndPersists()` -- verifies save() serializes payload to JSON, sets aggregate type/status to PENDING.
**Lines 52-63**: `saveEvent_invalidPayloadThrows()` -- verifies exception when payload serialization fails.
**Lines 65-74**: `markCompleted_updatesWhenPresent()` -- verifies event status transitions to COMPLETED.
**Lines 76-81**: `markCompleted_noopWhenMissing()` -- no save call when event not found.
**Lines 83-97**: `markFailed_updatesWhenPresent()` -- verifies status transitions to FAILED with error message and retry count increment.
**Lines 99-106**: `cleanupOldEvents_deletes()` -- verifies repository delete call.

---

#### `dto/ApiResponseTest.java` (48 lines)
**Lines 1-17**: Tests `ApiResponse.success("x")` returns success=true, message="Success", data="x".
**Lines 19-25**: Tests `ApiResponse.success("ok", data)` with custom message.
**Lines 27-33**: Tests `ApiResponse.error("bad")` returns success=false, message="bad", data=null.
**Lines 35-47**: Tests builder pattern and setters.

---

#### `util/JwtUtilTest.java` (41 lines)
**Lines 1-14**: `@SpringBootTest` with test JWT secret and expiration properties.
**Lines 16-29**: `generateAndValidateToken()` -- generates token, verifies email/userId/role extraction, validates token, validates with correct email, rejects wrong email, checks expiration time.
**Lines 31-35**: `validateToken_invalidReturnsFalse()` -- rejects non-JWT string.
**Lines 37-40**: `getExpirationTime_invalidReturnsZero()` -- returns 0 for invalid tokens.

---

#### `config/actuator/CommonHealthIndicatorsTest.java` (67 lines)
**Lines 1-21**: Tests `EurekaHealthIndicator` returns UNKNOWN when disabled, UP when enabled.
**Lines 23-36**: Tests `RabbitMQHealthIndicator` returns UP when template.execute succeeds.
**Lines 38-44**: Tests `RabbitMQHealthIndicator` returns DOWN when template.execute throws.
**Lines 46-53**: Tests `ServiceDependenciesHealthIndicator` returns UP when all services healthy, DOWN when any unhealthy.
**Lines 55-66**: Tests `RedisHealthIndicator` returns UP on PONG, DOWN on exception.

---

#### `config/Resilience4jConfigTest.java` (20 lines)
**Lines 1-19**: Creates a default `CircuitBreakerRegistry`, instantiates `Resilience4jConfig`, calls `initCircuitBreakerEventListeners()`. Verifies event publishers are non-null for catalogService and ordersService circuit breakers.

---

#### `dto/PageResponseErrorResponseTest.java` (62 lines)
**Lines 1-27**: Tests `PageResponse` builder with content, page, size, totalElements, totalPages, first/last flags.
**Lines 29-41**: Tests `PageResponse` setters.
**Lines 43-53**: Tests `ErrorResponse.builder()` with statusCode, message, path, errors list.
**Lines 55-61**: Tests `ErrorResponse.of()` static factory method.

---

### pharmacy-catalog (tests)

#### `controller/MedicineControllerTest.java` (49 lines)
**Lines 1-23**: Imports for MockMvc, Mockito, pagination.
**Lines 25-38**: Sets up MockMvc with `MedicineController` and `PageableHandlerMethodArgumentResolver`.
**Lines 40-48**: Tests `GET /api/catalog/medicines` returns 200 OK when service returns empty page.

---

### pharmacy-identity (tests)

#### `service/OtpServiceTest.java` (302 lines)
**Lines 1-46**: Mockito setup with mocks for `OtpVerificationRepository`, `UserRepository`, `NotificationService`. Sets expiryMinutes=5, maxAttempts=3.
**Lines 63-91**: `generateOtp_createsOtpAndSavesToRepository()` -- verifies OTP is generated, saved with 6-digit code, expiry set, and email notification sent.
**Lines 93-103**: `generateOtp_deletesExistingOtpBeforeCreatingNew()` -- verifies old OTPs deleted before new one.
**Lines 105-111**: `generateOtp_throwsWhenUserNotFound()` -- throws `ResourceNotFoundException` for non-existent user (login OTP).
**Lines 113-123**: `generateOtp_signupDoesNotRequireExistingUser()` -- signup OTP doesn't need existing user.
**Lines 125-149**: `verifyOtp_success()` -- verifies correct OTP code transitions status to VERIFIED, sets verifiedAt.
**Lines 151-158**: `verifyOtp_throwsWhenOtpNotFound()` -- throws `BadRequestException`.
**Lines 160-177**: `verifyOtp_throwsWhenOtpExpired()` -- throws `BadRequestException` for expired OTP.
**Lines 179-196**: `verifyOtp_throwsWhenMaxAttemptsExceeded()` -- throws `BadRequestException` after 3 failed attempts.
**Lines 198-215**: `verifyOtp_throwsWhenOtpCodeInvalid()` -- throws `BadRequestException` for wrong code.
**Lines 217-239**: `verifyOtp_incrementsAttemptsOnInvalidCode()` -- increments attempts counter on wrong code.
**Lines 241-257**: `isOtpVerified_returnsTrueWhenVerifiedAndNotExpired()`.
**Lines 259-265**: `isOtpVerified_returnsFalseWhenNotVerified()`.
**Lines 267-283**: `isOtpVerified_returnsFalseWhenExpired()` -- verified but expired returns false.
**Lines 285-301**: `generateSecureOtp_returnsSixDigitCode()` -- verifies OTP is 6 digits, all numeric.

---

#### `controller/InternalIdentityControllerTest.java` (107 lines)
**Lines 1-30**: Imports and Mockito setup with mocks for `AuthService`, `NotificationService`, `UserRepository`.
**Lines 54-60**: `validateToken_returnsValidity()` -- GET `/internal/token/validate?token=abc` returns `{"valid": true}`.
**Lines 64-98**: `dispatchNotification_returnsIdAndEmail()` -- POST `/internal/notifications/dispatch` creates notification, looks up user email, returns `{"notificationId": 50, "email": "user@test.com"}`.
**Lines 100-106**: `markNotificationEmailSent_returns204()` -- PATCH `/internal/notifications/9/email-sent` returns 204 No Content.

---

#### `config/SecurityConfigContextTest.java` (29 lines)
**Lines 1-28**: Uses `ApplicationContextRunner` to verify `SecurityConfig` registers `SecurityFilterChain`, `passwordEncoder`, and `authenticationManager` beans. Smoke test for context configuration.

---

#### `service/AuthServiceTest.java` (321 lines)
**Lines 1-59**: Mockito setup with mocks for `UserRepository`, `PasswordEncoder`, `JwtUtil`, `AuthenticationManager`, `JwtBlacklistService`, `IdentityEventPublisher`.
**Lines 76-82**: `signup_throwsWhenEmailExists()` -- throws `BadRequestException` for duplicate email.
**Lines 85-115**: `signup_savesUser_publishesEvent_firstNameFromFullName()` -- verifies user saved, password encoded, `UserRegisteredEvent` published with extracted first name "John" from "John Smith".
**Lines 117-140**: `signup_publishFailureStillReturnsUser()` -- event publisher failure doesn't prevent signup.
**Lines 142-165**: `signup_blankName_mapsFirstNameToThere()` -- blank name defaults firstName to "there" in event.
**Lines 167-188**: `login_success()` -- authenticates, generates JWT, publishes `UserLoggedInEvent`.
**Lines 190-203**: `login_publishLoggedInFailureStillReturnsToken()` -- event failure doesn't prevent login.
**Lines 205-214**: `login_badCredentials_wrapped()` -- `BadCredentialsException` propagated.
**Lines 216-223**: `login_authThrowsGeneric_wrappedAsBadCredentials()` -- generic exception wrapped.
**Lines 225-234**: `login_userMissingAfterAuth()` -- throws `ResourceNotFoundException`.
**Lines 236-253**: `login_inactiveAccount()` -- throws `UnauthorizedException` for inactive user.
**Lines 255-262**: `logout_stripsBearerAndBlacklists()` -- strips "Bearer " prefix, blacklists token with expiration TTL.
**Lines 264-271**: `logout_rawTokenWithoutPrefix()` -- handles raw token without prefix.
**Lines 273-279**: `validateToken_falseWhenBlacklisted()` -- short-circuits to false without calling JwtUtil.
**Lines 281-287**: `validateToken_stripsBearer_delegatesToJwtUtil()` -- strips prefix, checks blacklist, delegates to JwtUtil.
**Lines 289-320**: `getUserById`/`getUserByEmail` tests for found/not-found scenarios.

---

#### `service/JwtBlacklistServiceTest.java` (123 lines)
**Lines 1-34**: Mockito setup with `RedisTemplate` and `ValueOperations` mocks.
**Lines 41-55**: `blacklistToken_shouldAddTokenToRedis()` -- verifies Redis SET with key `jwt:blacklist:<token>`, value "blacklisted", TTL in milliseconds.
**Lines 57-65**: `blacklistToken_shouldNotAddExpiredToken()` -- no Redis call for already-expired tokens.
**Lines 67-87**: `isTokenBlacklisted_shouldReturnTrue/False` -- verifies Redis `hasKey()` check.
**Lines 89-97**: `isTokenBlacklisted_shouldReturnFalseOnNullKey()` -- null key treated as not blacklisted.
**Lines 99-106**: `removeFromBlacklist_shouldDeleteTokenFromRedis()` -- verifies Redis DELETE.
**Lines 108-122**: `blacklistToken_withBearerPrefix_shouldExtractToken()` -- note: this test shows the service does NOT strip "Bearer " prefix, it stores the full string including prefix.

---

### pharmacy-orders (tests)

#### `service/CatalogClientTest.java` (179 lines)
**Lines 1-25**: Mockito setup with `CatalogFeignClient` mock.
**Lines 27-47**: `getMedicineInfo_shouldReturnMedicineInfo()` -- delegates to Feign client.
**Lines 49-56**: `getMedicineInfo_shouldReturnNullOnException()` -- catches exception, returns null.
**Lines 58-84**: `requiresPrescription_shouldReturnTrue/False` -- checks medicine's requiresPrescription flag.
**Lines 86-93**: `requiresPrescription_shouldReturnFalseOnNullMedicine()` -- null medicine = no prescription needed.
**Lines 95-123**: `isInStock_shouldReturnTrue/False` -- checks stock >= requested quantity and inStock flag.
**Lines 140-178**: `hasValidPrescription_shouldReturnTrue/False/OnException()` -- delegates to Feign client's checkPrescription, returns false on error.

---

### pharmacy-notifications (tests)

#### `service/EmailChannelServiceTest.java` (46 lines)
**Lines 1-22**: `deliver_returnsFalseWhenNoMailSender()` -- returns false when JavaMailSender is unavailable.
**Lines 24-34**: `deliver_sendsAndReturnsTrue()` -- sends email via JavaMailSender, returns true.
**Lines 36-45**: `deliver_returnsFalseOnSendFailure()` -- catches send exception, returns false.

---

#### `service/NotificationDispatchCoordinatorTest.java` (80 lines)
**Lines 1-25**: Mockito setup with `IdentityNotificationFeignClient` and `EmailChannelService` mocks.
**Lines 27-41**: `dispatchInAppAndEmail_sendsEmailAndMarksSent()` -- creates notification via identity client, sends email, marks email_sent on success.
**Lines 44-61**: `dispatchInAppAndEmail_usesEmailOverride()` -- uses override email instead of identity-returned email.
**Lines 63-79**: `dispatchInAppAndEmail_skipsMarkWhenEmailFails()` -- doesn't mark email_sent when email delivery fails.

---

#### `PharmacyNotificationsApplicationMainTest.java` (25 lines)
**Lines 1-24**: Uses `MockedStatic<SpringApplication>` to verify `main()` delegates to `SpringApplication.run()` with correct class.

---

#### `listener/NotificationDomainEventListenerTest.java` (193 lines)
**Lines 1-45**: Mockito setup with `NotificationDispatchCoordinator` mock. Creates test `OrderPlacedEvent`.
**Lines 47-51**: `onOrderPlaced()` -- delegates to coordinator.
**Lines 53-66**: `onOrderPlaced_nullItemsHandled()` -- null items replaced with "N/A" in message.
**Lines 68-76**: `onOrderCancelled()` -- dispatches cancellation notification.
**Lines 78-86**: `onPrescriptionApproved()` -- dispatches approval notification.
**Lines 88-96**: `onPrescriptionRejected()` -- dispatches rejection notification.
**Lines 98-110**: `onUserLoggedIn()` -- dispatches sign-in notification with email override.
**Lines 112-120**: `onUserLoggedIn_coordinatorThrows_isLoggedNotPropagated()` -- exception caught, not rethrown.
**Lines 122-192**: Similar tests for `onUserRegistered` (null firstName defaults to "there") and coordinator exception handling for all event types (all exceptions caught silently).

---

#### `PharmacyNotificationsApplicationTest.java` (35 lines)
**Lines 1-34**: `@SpringBootTest` with extensive property overrides to disable cloud config, discovery, Eureka, RabbitMQ listeners, tracing. Mocks `IdentityNotificationFeignClient`. Verifies `NotificationDomainEventListener` and application beans load in context.

---

### pharmacy-admin (tests)

#### `service/OrdersClientTest.java` (63 lines)
**Lines 1-23**: Mockito setup with `OrdersFeignClient` mock.
**Lines 25-28**: `getAllOrders_returnsEmptyOnNull()` -- null response converted to empty list.
**Lines 30-35**: `getAllOrders_returnsEmptyOnException()` -- exception returns empty list.
**Lines 37-53**: `countsAndRevenue()` -- with 6 orders (1 DELIVERED, 1 PAID, 4 pending states), verifies: totalOrders=6, pendingOrders=4 (PAID + CHECKOUT_STARTED + PAYMENT_PENDING + PRESCRIPTION_PENDING), completedOrders=1 (DELIVERED), totalRevenue=20.0 (only from DELIVERED).

---

#### `service/CatalogClientTest.java` (71 lines)
**Lines 1-25**: Mockito setup with `CatalogFeignClient` mock.
**Lines 27-34**: `countPendingPrescriptions_successAndErrors()` -- returns count on success, 0 on exception.
**Lines 36-54**: `getLowStockItems_mapsRows()` -- maps `InventoryInfoDTO` list to `List<Map<String, Object>>` rows.
**Lines 56-63**: `getLowStockItems_nullAndException()` -- returns empty list on null or exception.
**Lines 65-70**: `getExpiringBatches_mapsAndHandlesNull()` -- returns empty list on null.

---

#### `service/DashboardServiceTest.java` (47 lines)
**Lines 1-46**: Mockito setup with `CatalogClient` and `OrdersClient` mocks. `getDashboard_aggregates()` -- verifies DashboardDTO aggregates all metrics from both clients (totalOrders=10, pendingOrders=2, completedOrders=7, totalRevenue=99, pendingPrescriptions=3, lowStockItems=4, expiringBatches=1). Note: revenue is truncated to long (99.5 → 99).

---

#### `config/JwtHeaderAuthenticationFilterTest.java` (50 lines)
**Lines 1-17**: Tests admin's JWT header filter with mocked `JwtUtil`.
**Lines 24-38**: `setsAuthenticationWhenHeadersPresent()` -- verifies `X-User-Id`, `X-User-Email`, `X-User-Role` headers create `AdminUserPrincipal` in SecurityContext.
**Lines 40-49**: `noAuthWhenHeadersMissing()` -- no authentication set when headers absent.

---

#### `controller/AdminControllerTest.java` (37 lines)
**Lines 1-27**: Mockito setup with `DashboardService` mock.
**Lines 30-36**: `getDashboard_returnsOk()` -- GET `/api/admin/dashboard` returns 200 OK with empty DashboardDTO.

---

### pharmacy-gateway (tests)

#### `PharmacyGatewayApplicationTest.java` (14 lines)
**Lines 1-13**: Standard `@SpringBootTest` with "test" profile. Empty `contextLoads()` test.

---

#### `config/JwtAuthenticationFilterTest.java` (89 lines)
**Lines 1-24**: Imports for JWT (jjwt), Gateway filter, MockServerHttpRequest, StepVerifier (reactor test).
**Lines 26-35**: Sets up filter with test secret, calls `init()` to initialize JWT key parser.
**Lines 37-45**: `publicPathPassesWithoutToken()` -- `/actuator/health` passes without Authorization header.
**Lines 47-55**: `authLoginWithoutApiPrefixPassesWithoutToken()` -- `/auth/login` passes (no auth required).
**Lines 57-64**: `missingTokenReturns401()` -- protected path without token returns 401.
**Lines 66-83**: `validTokenAddsHeaders()` -- valid JWT token passes through, chain.filter called.
**Lines 85-88**: `getOrderIsMinus100()` -- filter order is -100 (runs early in the filter chain).

---

#### `config/RateLimitingFilterTest.java` (75 lines)
**Lines 1-27**: Sets up filter with test rate limits (100 auth/general requests per minute, burst capacity 50).
**Lines 29-38**: `allowsRequestThroughChain()` -- first request passes through.
**Lines 40-51**: `usesXForwardedForClientIp()` -- extracts client IP from X-Forwarded-For header (first IP in chain).
**Lines 53-74**: `authEndpointEventuallyReturns429()` -- sends 20 requests with rate limit of 1/min, verifies 429 Too Many Requests returned after limit exceeded.
