/**
 * API Type Definitions for Iron Pets Backend
 * Auto-generated from OpenAPI specification
 * Version: 1.0.0
 */

// ========================================
// BASE TYPES
// ========================================

export interface SuccessResponse {
  success: true;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

// ========================================
// AUTHENTICATION TYPES
// ========================================

export interface RegisterRequest {
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface RegisterResponse {
  success: true;
  message: string;
  data: {
    userId: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: true;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  passwordConfirm: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: true;
  data: {
    accessToken: string;
  };
}

// ========================================
// USER TYPES
// ========================================

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  marketingOptIn: boolean;
}

export interface UserProfileResponse {
  success: true;
  data: UserProfile;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  marketingOptIn?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

export interface DeleteAccountRequest {
  password: string;
}

// ========================================
// ADDRESS TYPES
// ========================================

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressRequest {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isDefault?: boolean;
}

export interface AddressResponse {
  success: true;
  data: Address;
}

export interface AddressListResponse {
  success: true;
  data: Address[];
}

// ========================================
// PET TYPES
// ========================================

export type PetSpecies = 'dog' | 'cat' | 'small_pet';
export type WeightUnit = 'lbs' | 'kg';

export interface Pet {
  id: string;
  userId: string;
  name: string;
  species: PetSpecies;
  breed: string | null;
  birthDate: string | null;
  weight: number | null;
  weightUnit: WeightUnit;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PetRequest {
  name: string;
  species: PetSpecies;
  breed?: string;
  birthDate?: string;
  weight?: number;
  weightUnit?: WeightUnit;
  photoUrl?: string;
}

export interface PetResponse {
  success: true;
  data: Pet;
}

export interface PetListResponse {
  success: true;
  data: Pet[];
}

// ========================================
// PRODUCT TYPES
// ========================================

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type SortBy = 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';

export interface ProductImage {
  id: string;
  url: string;
  altText: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductBrand {
  id: string;
  name: string;
  slug: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ProductCard {
  id: string;
  sku: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  comparePrice: number | null;
  averageRating: number;
  reviewCount: number;
  stockStatus: StockStatus;
  brand: ProductBrand;
}

export interface ProductDetail extends ProductCard {
  shortDescription: string | null;
  description: string | null;
  stockQuantity: number;
  specifications: Record<string, unknown>;
  images: ProductImage[];
  category: ProductCategory;
  relatedProducts: ProductCard[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  success: true;
  data: ProductCard[];
  meta: PaginationMeta;
}

export interface ProductDetailResponse {
  success: true;
  data: ProductDetail;
}

export interface ProductSearchParams {
  q?: string;
  page?: number;
  limit?: number;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: SortBy;
  brands?: string[];
  minRating?: number;
}

// ========================================
// CATEGORY TYPES
// ========================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  productCount: number;
  children: Category[];
}

export interface CategoryListResponse {
  success: true;
  data: Category[];
}

export interface CategoryDetailResponse {
  success: true;
  data: Category & {
    products: ProductCard[];
  };
  meta: PaginationMeta;
}

// ========================================
// BRAND TYPES
// ========================================

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  productCount: number;
}

export interface BrandListResponse {
  success: true;
  data: Brand[];
}

export interface BrandDetailResponse {
  success: true;
  data: Brand & {
    products: ProductCard[];
  };
  meta: PaginationMeta;
}

// ========================================
// CART TYPES
// ========================================

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productSlug: string;
  price: number;
  quantity: number;
  lineTotal: number;
  stockAvailable: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartResponse {
  success: true;
  data: Cart;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface MergeCartRequest {
  guestCartId: string;
}

// ========================================
// CHECKOUT TYPES
// ========================================

export type ShippingMethodId = 'standard' | 'expedited';

export interface ShippingOption {
  id: ShippingMethodId;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  isFree: boolean;
}

export interface ShippingRatesRequest {
  address: AddressRequest;
}

export interface ShippingRatesResponse {
  success: true;
  data: ShippingOption[];
}

export interface ValidateCheckoutRequest {
  shippingAddress: AddressRequest;
  billingAddress?: AddressRequest;
}

export interface StockIssue {
  productId: string;
  requestedQuantity: number;
  availableQuantity: number;
}

export interface ValidateCheckoutResponse {
  success: true;
  data: {
    valid: boolean;
    stockIssues: StockIssue[];
  };
}

export interface CreatePaymentRequest {
  shippingAddress: AddressRequest;
  billingAddress?: AddressRequest;
  shippingMethodId: ShippingMethodId;
  promoCode?: string;
}

export interface CreatePaymentResponse {
  success: true;
  data: {
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
  };
}

export interface ConfirmOrderRequest {
  paymentIntentId: string;
  shippingAddress: AddressRequest;
  billingAddress?: AddressRequest;
  shippingMethodId: ShippingMethodId;
  promoCode?: string;
  notes?: string;
}

export interface ApplyPromoRequest {
  code: string;
}

export type DiscountType = 'percentage' | 'fixed';

export interface ApplyPromoResponse {
  success: true;
  data: {
    code: string;
    discountType: DiscountType;
    discountValue: number;
    discountAmount: number;
  };
}

// ========================================
// ORDER TYPES
// ========================================

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  email: string;
  status: OrderStatus;
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  shippingAddress: Address;
  shippingMethod: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  promoCode: string | null;
  notes: string | null;
  placedAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface OrderListResponse {
  success: true;
  data: Order[];
  meta: PaginationMeta;
}

export interface OrderDetailResponse {
  success: true;
  data: OrderWithItems;
}

export interface OrderResponse {
  success: true;
  data: Order;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

// ========================================
// VALIDATION ERROR TYPES
// ========================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationErrorResponse extends ErrorResponse {
  error: {
    code: 'VALIDATION_ERROR';
    message: string;
    details: ValidationError[];
  };
}

// ========================================
// ERROR CODES
// ========================================

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  INVALID_PROMO_CODE = 'INVALID_PROMO_CODE',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  EXPIRED_TOKEN = 'EXPIRED_TOKEN',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

// ========================================
// JWT PAYLOAD TYPES
// ========================================

export interface JWTAccessPayload {
  userId: string;
  email: string;
  type: 'access';
  iat: number;
  exp: number;
}

export interface JWTRefreshPayload {
  userId: string;
  type: 'refresh';
  iat: number;
  exp: number;
}

// ========================================
// REQUEST CONTEXT TYPES
// ========================================

export interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
  };
}

export interface GuestRequest {
  sessionId: string;
}

// ========================================
// DATABASE ENTITY TYPES
// ========================================

export interface UserEntity {
  id: string;
  email: string;
  password_hash: string;
  email_verified: boolean;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfileEntity {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  marketing_opt_in: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductEntity {
  id: string;
  sku: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number;
  compare_price: number | null;
  cost: number | null;
  category_id: string;
  brand_id: string;
  stock_quantity: number;
  low_stock_threshold: number;
  weight: number | null;
  specifications: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartEntity {
  id: string;
  user_id: string | null;
  session_id: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface CartItemEntity {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  price_at_add: number;
  created_at: string;
  updated_at: string;
}

export interface OrderEntity {
  id: string;
  order_number: string;
  user_id: string | null;
  email: string;
  status: OrderStatus;
  subtotal: number;
  shipping_amount: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  shipping_address: Record<string, unknown>;
  billing_address: Record<string, unknown> | null;
  shipping_method: string;
  tracking_number: string | null;
  tracking_url: string | null;
  payment_intent_id: string | null;
  promo_code: string | null;
  notes: string | null;
  placed_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItemEntity {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  price: number;
  quantity: number;
  total: number;
  created_at: string;
}

// ========================================
// PROMO CODE TYPES
// ========================================

export interface PromoCodeEntity {
  id: string;
  code: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  min_order_value: number | null;
  max_uses: number | null;
  uses_count: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ========================================
// STRIPE TYPES
// ========================================

export interface StripePaymentIntentMetadata {
  userId?: string;
  cartId: string;
  orderNumber: string;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: unknown;
  };
}

// ========================================
// EMAIL TYPES
// ========================================

export interface EmailTemplate {
  to: string;
  subject: string;
  templateId: string;
  dynamicTemplateData: Record<string, unknown>;
}

export interface OrderConfirmationEmail {
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  total: number;
  shippingAddress: Address;
  estimatedDelivery: string;
}

export interface ShippingNotificationEmail {
  orderNumber: string;
  customerName: string;
  trackingNumber: string;
  trackingUrl: string;
  carrier: string;
  estimatedDelivery: string;
}

// ========================================
// SERVICE RESPONSE TYPES
// ========================================

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: ErrorCode; message: string } };

// ========================================
// UTILITY TYPES
// ========================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];
