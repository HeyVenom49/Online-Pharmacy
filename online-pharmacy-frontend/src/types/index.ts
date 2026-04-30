// ==================== AUTH TYPES ====================

export interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: 'CUSTOMER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface AuthResponse {
  token: string | null;
  tokenType: string | null;
  expiresIn?: number | null;
  userId: number;
  email: string;
  name: string;
  mobile?: string;
  role: 'CUSTOMER' | 'ADMIN';
  otpRequired?: boolean;
}

// ==================== OTP TYPES ====================

export type OtpType = 'SIGNUP' | 'LOGIN' | 'PASSWORD_RESET';

export interface OtpRequest {
  email: string;
  otpType: OtpType;
}

export interface OtpVerificationRequest {
  email: string;
  otpCode: string;
  otpType: OtpType;
}

export interface OtpResponse {
  email: string;
  otpType?: string;
  message: string;
  expiresInMinutes?: number | null;
  verified?: boolean;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  mobile: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ==================== PAGINATION TYPES ====================

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ==================== PRODUCT TYPES ====================

export interface Medicine {
  id: number;
  name: string;
  description: string | null;
  categoryId: number | null;
  categoryName: string | null;
  price: number;
  mrp: number | null;
  requiresPrescription: boolean;
  stock: number;
  inStock: boolean;
  expiringSoon: boolean;
  expiryDate: string | null;
  dosageForm: string | null;
  strength: string | null;
  manufacturer: string | null;
}

export interface MedicineDetail extends Medicine {
  inventoryList: Inventory[];
}

export interface Inventory {
  id: number;
  medicineId: number;
  batchNumber: string;
  quantity: number;
  manufactureDate: string;
  expiryDate: string;
  expired: boolean;
  expiringSoon: boolean;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
}

// ==================== CART TYPES ====================

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  updatedAt: string;
}

export interface CartItem {
  id: number;
  medicineId: number;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  prescriptionId: number | null;
  addedAt: string;
}

export interface AddToCartRequest {
  medicineId: number;
  quantity: number;
  prescriptionId?: number;
}

// ==================== ORDER TYPES ====================

export type OrderStatus =
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
  | 'PAYMENT_FAILED'
  | 'RETURN_REQUESTED'
  | 'REFUND_INITIATED'
  | 'REFUND_COMPLETED';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export type PaymentMethod = 'CASH_ON_DELIVERY' | 'CARD' | 'UPI' | 'WALLET';

export interface Order {
  id: number;
  userId: number;
  status: OrderStatus;
  totalAmount: number;
  deliveryFee: number;
  discount: number;
  grandTotal: number;
  addressSnapshot: string;
  addressPincode: string;
  deliverySlot: string | null;
  notes: string | null;
  items: OrderItem[];
  payment: Payment | null;
  orderedAt: string | null;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  medicineId: number;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  prescriptionId: number | null;
}

export interface Payment {
  id: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionId: string | null;
  amount: number;
  paidAt: string | null;
}

export interface CheckoutRequest {
  address: string;
  pincode: string;
  deliverySlot?: string;
  notes?: string;
}

export interface PaymentRequest {
  paymentMethod: PaymentMethod;
}

// ==================== PRESCRIPTION TYPES ====================

export type PrescriptionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface Prescription {
  id: number;
  userId: number;
  medicineId: number;
  medicineName: string;
  status: PrescriptionStatus;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  reviewedBy: number | null;
  rejectionReason: string | null;
}

// ==================== ADDRESS TYPES ====================

export interface Address {
  id: number;
  userId: number;
  fullAddress: string;
  landmark: string | null;
  pincode: string;
  city: string;
  state: string;
  type: 'HOME' | 'WORK' | 'OTHER';
  isDefault: boolean;
  createdAt: string;
}

export interface AddressRequest {
  fullAddress: string;
  landmark?: string;
  pincode: string;
  city: string;
  state: string;
  type: 'HOME' | 'WORK' | 'OTHER';
  isDefault?: boolean;
}

// ==================== NOTIFICATION TYPES ====================

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'ORDER' | 'PRESCRIPTION' | 'PAYMENT' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

// ==================== ADMIN TYPES ====================

export interface Dashboard {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  pendingPrescriptions: number;
  lowStockItems: number;
  expiringBatches: number;
}

// ==================== SEARCH FILTERS ====================

export interface MedicineSearchFilters {
  name?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  requiresPrescription?: boolean;
}