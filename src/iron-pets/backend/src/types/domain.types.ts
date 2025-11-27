/**
 * Iron Pets Domain Types
 *
 * Complete TypeScript domain models extracted from SRS v1.0
 * Sections: 5.2 Data Dictionary
 *
 * @module domain.types
 * @version 1.0.0
 */

// ============================================================================
// ENUMS & TYPE UNIONS
// ============================================================================

/**
 * Order status values (REQ-ORD-002)
 * @see SRS Section 3.6
 */
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

/**
 * Stock status indicators
 * @see SRS Section 3.2 - REQ-CAT-002
 */
export enum StockStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
}

/**
 * Pet species options
 * @see SRS Section 5.2.4 - Pets Table
 */
export enum PetSpecies {
  DOG = 'dog',
  CAT = 'cat',
  SMALL_PET = 'small_pet',
}

/**
 * Weight units for pets and products
 */
export enum WeightUnit {
  LBS = 'lbs',
  KG = 'kg',
}

/**
 * Address type classification
 * @see SRS Section 5.2.3 - Addresses Table
 */
export enum AddressType {
  SHIPPING = 'shipping',
  BILLING = 'billing',
}

/**
 * Promo code discount types
 * @see SRS Section 5.2.13 - Promo Codes Table
 */
export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

/**
 * Shipping method options
 * @see SRS Section 3.5 - REQ-CHK-003
 */
export enum ShippingMethod {
  STANDARD = 'standard',
  EXPEDITED = 'expedited',
}

// ============================================================================
// USER DOMAIN
// ============================================================================

/**
 * User entity (core authentication)
 * @see SRS Section 5.2.1 - Users Table
 */
export interface User {
  /** UUID primary key */
  id: string;

  /** Unique email address (RFC 5322 compliant) */
  email: string;

  /** Bcrypt hashed password (cost factor 12) */
  passwordHash: string;

  /** Email verification status */
  emailVerified: boolean;

  /** Timestamp of email verification */
  emailVerifiedAt: Date | null;

  /** Account creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * User profile (extended user information)
 * @see SRS Section 5.2.2 - User Profiles Table
 */
export interface UserProfile {
  /** UUID primary key */
  id: string;

  /** Foreign key to User */
  userId: string;

  /** User's first name */
  firstName: string | null;

  /** User's last name */
  lastName: string | null;

  /** Contact phone number (E.164 or US format) */
  phone: string | null;

  /** Marketing email consent (REQ-USR-003) */
  marketingOptIn: boolean;

  /** Profile creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * User address (shipping/billing)
 * @see SRS Section 5.2.3 - Addresses Table
 */
export interface Address {
  /** UUID primary key */
  id: string;

  /** Foreign key to User */
  userId: string;

  /** Address type: shipping or billing */
  type: AddressType;

  /** Recipient first name */
  firstName: string;

  /** Recipient last name */
  lastName: string;

  /** Street address line 1 */
  addressLine1: string;

  /** Street address line 2 (apartment, suite, etc.) */
  addressLine2: string | null;

  /** City name */
  city: string;

  /** State name or abbreviation */
  state: string;

  /** ZIP/Postal code (US format: 12345 or 12345-6789) */
  zipCode: string;

  /** Contact phone number */
  phone: string;

  /** Default address flag */
  isDefault: boolean;

  /** Address creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Shipping address schema for checkout
 * @see SRS Section 3.5 - REQ-CHK-002
 */
export interface ShippingAddress {
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

// ============================================================================
// PET DOMAIN
// ============================================================================

/**
 * Pet profile entity
 * @see SRS Section 5.2.4 - Pets Table
 * @see SRS Section 3.8 - Pet Profile Module
 */
export interface Pet {
  /** UUID primary key */
  id: string;

  /** Foreign key to User */
  userId: string;

  /** Pet name (required) */
  name: string;

  /** Pet species: dog, cat, or small_pet */
  species: PetSpecies;

  /** Pet breed (optional) */
  breed: string | null;

  /** Pet birth date (optional) */
  birthDate: Date | null;

  /** Pet weight (optional) */
  weight: number | null;

  /** Weight unit (lbs or kg) */
  weightUnit: WeightUnit;

  /** Photo URL (optional) */
  photoUrl: string | null;

  /** Pet profile creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}

// ============================================================================
// PRODUCT CATALOG DOMAIN
// ============================================================================

/**
 * Product category (hierarchical)
 * @see SRS Section 5.2.5 - Categories Table
 */
export interface Category {
  /** UUID primary key */
  id: string;

  /** Category name */
  name: string;

  /** URL-friendly slug */
  slug: string;

  /** Parent category ID (null for top-level) */
  parentId: string | null;

  /** Category description */
  description: string | null;

  /** Category image URL */
  imageUrl: string | null;

  /** Display sort order */
  sortOrder: number;

  /** Active status */
  isActive: boolean;

  /** Category creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Product brand
 * @see SRS Section 5.2.6 - Brands Table
 */
export interface Brand {
  /** UUID primary key */
  id: string;

  /** Brand name */
  name: string;

  /** URL-friendly slug */
  slug: string;

  /** Brand description */
  description: string | null;

  /** Brand logo URL */
  logoUrl: string | null;

  /** Active status */
  isActive: boolean;

  /** Brand creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Product entity (core catalog item)
 * @see SRS Section 5.2.7 - Products Table
 */
export interface Product {
  /** UUID primary key */
  id: string;

  /** Stock keeping unit (unique identifier) */
  sku: string;

  /** Product name */
  name: string;

  /** URL-friendly slug */
  slug: string;

  /** Brief description (max 500 chars) */
  shortDescription: string | null;

  /** Full product description */
  description: string | null;

  /** Current selling price */
  price: number;

  /** Original price for sale comparison */
  comparePrice: number | null;

  /** Product cost (internal) */
  cost: number | null;

  /** Foreign key to Category */
  categoryId: string;

  /** Foreign key to Brand */
  brandId: string;

  /** Available stock quantity */
  stockQuantity: number;

  /** Low stock alert threshold */
  lowStockThreshold: number;

  /** Product weight in ounces */
  weight: number | null;

  /** Product specifications (JSONB) */
  specifications: Record<string, string> | null;

  /** Active status */
  isActive: boolean;

  /** Product creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Product image
 * @see SRS Section 5.2.8 - Product Images Table
 */
export interface ProductImage {
  /** UUID primary key */
  id: string;

  /** Foreign key to Product */
  productId: string;

  /** Image URL */
  url: string;

  /** Image alt text for accessibility */
  altText: string | null;

  /** Display sort order */
  sortOrder: number;

  /** Primary image flag */
  isPrimary: boolean;

  /** Image creation timestamp */
  createdAt: Date;
}

/**
 * Product card data (for listings)
 * @see SRS Section 3.2 - REQ-CAT-002
 */
export interface ProductCard {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  comparePrice?: number;
  averageRating: number;
  reviewCount: number;
  stockStatus: StockStatus;
  brand: string;
}

/**
 * Product detail data (for PDP)
 * @see SRS Section 3.2 - REQ-CAT-003
 */
export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  comparePrice?: number;
  sku: string;
  stockQuantity: number;
  stockStatus: StockStatus;
  images: ProductImage[];
  specifications: Record<string, string>;
  brand: Brand;
  category: Category;
  averageRating: number;
  reviewCount: number;
  relatedProducts: ProductCard[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// SHOPPING CART DOMAIN
// ============================================================================

/**
 * Shopping cart entity
 * @see SRS Section 5.2.9 - Carts Table
 */
export interface Cart {
  /** UUID primary key */
  id: string;

  /** Foreign key to User (null for guest) */
  userId: string | null;

  /** Guest session ID (null for registered users) */
  sessionId: string | null;

  /** Cart creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;

  /** Cart expiration timestamp */
  expiresAt: Date;
}

/**
 * Cart item entity
 * @see SRS Section 5.2.10 - Cart Items Table
 */
export interface CartItem {
  /** UUID primary key */
  id: string;

  /** Foreign key to Cart */
  cartId: string;

  /** Foreign key to Product */
  productId: string;

  /** Item quantity (must be > 0) */
  quantity: number;

  /** Price when item was added */
  priceAtAdd: number;

  /** Cart item creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Cart item with product details (for display)
 * @see SRS Section 3.4 - REQ-CART-002
 */
export interface CartItemDetail {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  lineTotal: number;
  stockAvailable: number;
}

/**
 * Cart summary (for display)
 * @see SRS Section 3.4 - REQ-CART-002
 */
export interface CartSummary {
  items: CartItemDetail[];
  subtotal: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// ORDER DOMAIN
// ============================================================================

/**
 * Order entity (core order record)
 * @see SRS Section 5.2.11 - Orders Table
 */
export interface Order {
  /** UUID primary key */
  id: string;

  /** Display order number (unique) */
  orderNumber: string;

  /** Foreign key to User (null for guest) */
  userId: string | null;

  /** Customer email address */
  email: string;

  /** Order status */
  status: OrderStatus;

  /** Items subtotal */
  subtotal: number;

  /** Shipping cost */
  shippingAmount: number;

  /** Tax amount */
  taxAmount: number;

  /** Discount applied */
  discountAmount: number;

  /** Order total */
  total: number;

  /** Shipping address (JSONB) */
  shippingAddress: ShippingAddress;

  /** Billing address (JSONB, optional) */
  billingAddress: ShippingAddress | null;

  /** Selected shipping method */
  shippingMethod: ShippingMethod;

  /** Shipment tracking number */
  trackingNumber: string | null;

  /** Carrier tracking URL */
  trackingUrl: string | null;

  /** Stripe payment intent ID */
  paymentIntentId: string | null;

  /** Applied promo code */
  promoCode: string | null;

  /** Order notes */
  notes: string | null;

  /** Order placement timestamp */
  placedAt: Date;

  /** Shipment timestamp */
  shippedAt: Date | null;

  /** Delivery timestamp */
  deliveredAt: Date | null;

  /** Cancellation timestamp */
  cancelledAt: Date | null;

  /** Order creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Order item entity
 * @see SRS Section 5.2.12 - Order Items Table
 */
export interface OrderItem {
  /** UUID primary key */
  id: string;

  /** Foreign key to Order */
  orderId: string;

  /** Foreign key to Product */
  productId: string;

  /** Product name snapshot */
  productName: string;

  /** SKU snapshot */
  productSku: string;

  /** Price at purchase */
  price: number;

  /** Quantity ordered */
  quantity: number;

  /** Line total */
  total: number;

  /** Order item creation timestamp */
  createdAt: Date;
}

// ============================================================================
// PROMO CODE DOMAIN
// ============================================================================

/**
 * Promotional code entity
 * @see SRS Section 5.2.13 - Promo Codes Table
 */
export interface PromoCode {
  /** UUID primary key */
  id: string;

  /** Promo code string (unique) */
  code: string;

  /** Code description */
  description: string | null;

  /** Discount type: percentage or fixed */
  discountType: DiscountType;

  /** Discount amount (percentage 0-100 or fixed dollar amount) */
  discountValue: number;

  /** Minimum order value required */
  minOrderValue: number | null;

  /** Maximum total uses allowed */
  maxUses: number | null;

  /** Current usage count */
  usesCount: number;

  /** Promo code start date */
  startsAt: Date;

  /** Promo code expiration date */
  expiresAt: Date;

  /** Active status */
  isActive: boolean;

  /** Promo code creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}

// ============================================================================
// SEARCH & FILTER DOMAIN
// ============================================================================

/**
 * Search filters interface
 * @see SRS Section 3.3 - REQ-SRCH-003
 */
export interface SearchFilters {
  /** Minimum price */
  priceMin?: number;

  /** Maximum price */
  priceMax?: number;

  /** Brand filter (array of brand IDs) */
  brands?: string[];

  /** Minimum rating filter */
  minRating?: number;

  /** In stock only flag */
  inStockOnly?: boolean;
}

/**
 * Shipping option configuration
 * @see SRS Section 3.5 - REQ-CHK-003
 */
export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  freeThreshold?: number;
  isFree?: boolean;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if order status is cancellable
 * @param status Order status to check
 */
export function isCancellableStatus(status: OrderStatus): boolean {
  return status === OrderStatus.PENDING || status === OrderStatus.PROCESSING;
}

/**
 * Type guard to check if stock status is available
 * @param status Stock status to check
 */
export function isInStock(status: StockStatus): boolean {
  return status === StockStatus.IN_STOCK || status === StockStatus.LOW_STOCK;
}

/**
 * Type guard to check if promo code is currently valid
 * @param promoCode Promo code to validate
 */
export function isPromoCodeValid(promoCode: PromoCode): boolean {
  const now = new Date();
  return (
    promoCode.isActive &&
    now >= promoCode.startsAt &&
    now <= promoCode.expiresAt &&
    (promoCode.maxUses === null || promoCode.usesCount < promoCode.maxUses)
  );
}

/**
 * Calculate stock status based on quantity
 * @param quantity Current stock quantity
 * @param lowStockThreshold Low stock threshold
 */
export function calculateStockStatus(
  quantity: number,
  lowStockThreshold: number = 10
): StockStatus {
  if (quantity === 0) return StockStatus.OUT_OF_STOCK;
  if (quantity <= lowStockThreshold) return StockStatus.LOW_STOCK;
  return StockStatus.IN_STOCK;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Shipping options configuration
 * @see SRS Section 3.5 - REQ-CHK-003
 */
export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'standard',
    name: 'Standard',
    description: '5-7 business days',
    price: 5.99,
    estimatedDays: '5-7',
    freeThreshold: 50,
    isFree: false,
  },
  {
    id: 'expedited',
    name: 'Expedited',
    description: '2-3 business days',
    price: 12.99,
    estimatedDays: '2-3',
    isFree: false,
  },
];

/**
 * Password validation requirements
 * @see SRS Section 3.1 - REQ-AUTH-001
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
} as const;

/**
 * Cart expiration periods (in days)
 * @see SRS Section 3.4 - REQ-CART-005
 */
export const CART_EXPIRATION = {
  guest: 7,
  registered: 30,
} as const;

/**
 * Token expiration periods
 * @see SRS Section 4.2 - Security Requirements
 */
export const TOKEN_EXPIRATION = {
  accessToken: 15 * 60, // 15 minutes in seconds
  refreshToken: 30 * 24 * 60 * 60, // 30 days in seconds
  verificationToken: 24 * 60 * 60, // 24 hours in seconds
  resetToken: 60 * 60, // 1 hour in seconds
} as const;
