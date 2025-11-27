// Core Product Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isOnSale?: boolean;
  categoryId: string;
  category?: Category;
  brand?: string;
  sku?: string;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  sku: string;
  inStock: boolean;
  options: Record<string, string>;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  productCount?: number;
}

// Pet Types
export type PetSpecies = 'DOG' | 'CAT' | 'BIRD' | 'FISH' | 'SMALL_ANIMAL' | 'REPTILE' | 'OTHER';
export type PetType = 'dog' | 'cat' | 'bird' | 'fish' | 'small-animal' | 'reptile' | 'other';

export interface Pet {
  id: string;
  name: string;
  type?: 'dog' | 'cat' | 'bird' | 'fish' | 'small-animal' | 'reptile' | 'other';
  species?: 'DOG' | 'CAT' | 'BIRD' | 'FISH' | 'SMALL_ANIMAL' | 'REPTILE' | 'OTHER';
  breed?: string;
  age?: number;
  ageUnit?: 'months' | 'years';
  weight?: number;
  weightUnit?: 'lb' | 'kg';
  birthday?: string;
  birthDate?: string;
  image?: string;
  imageUrl?: string;
  notes?: string;
  allergies?: string[];
  dietaryRestrictions?: string[];
  medications?: string[];
  veterinarian?: {
    name: string;
    phone?: string;
    clinic?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Address Types
export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

// Cart Types
export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
  price: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
  price: number;
}

// Review Types
export interface Review {
  id: string;
  productId: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  rating: number;
  title: string;
  content: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  images?: string[];
  createdAt: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

// Filter Types
export interface ProductFilters {
  category?: string;
  petType?: string;
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  inStock?: boolean;
  onSale?: boolean;
  rating?: number;
  sort?: 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'bestselling' | 'rating';
}

// Wishlist Types
export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'order' | 'promo' | 'restock' | 'reminder' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

// Subscription Types
export interface Subscription {
  id: string;
  productId: string;
  product: Product;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'bimonthly';
  quantity: number;
  nextDelivery: string;
  status: 'active' | 'paused' | 'cancelled';
  createdAt: string;
}
