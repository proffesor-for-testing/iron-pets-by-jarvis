/**
 * Cart Validation Schemas
 * Using Zod for runtime validation
 */

import { z } from 'zod';

/**
 * Add Item to Cart Schema
 */
export const addItemSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  }),
});

/**
 * Update Item Quantity Schema
 */
export const updateItemSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Item ID is required'),
  }),
  body: z.object({
    quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  }),
});

/**
 * Remove Item Schema
 */
export const removeItemSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Item ID is required'),
  }),
});

/**
 * Merge Cart Schema
 */
export const mergeCartSchema = z.object({
  body: z.object({
    guestSessionId: z.string().min(1, 'Guest session ID is required'),
  }),
});

// Type exports for TypeScript
export type AddItemInput = z.infer<typeof addItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type RemoveItemInput = z.infer<typeof removeItemSchema>;
export type MergeCartInput = z.infer<typeof mergeCartSchema>;
