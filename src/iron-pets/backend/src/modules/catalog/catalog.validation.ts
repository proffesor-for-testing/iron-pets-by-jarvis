/**
 * CATALOG VALIDATION
 * Zod schemas for request validation
 */

import { z } from 'zod';

/**
 * Product listing query parameters
 */
export const productListSchema = z.object({
  page: z.string().optional().default('1'),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  maxPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  minRating: z.string().regex(/^[0-5](\.\d)?$/).optional(),
  inStock: z.enum(['true', 'false']).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'rating', 'newest', 'relevance']).optional(),
});

/**
 * Product search query parameters
 */
export const productSearchSchema = z.object({
  q: z.string().min(1).max(200),
  page: z.string().optional().default('1'),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  maxPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
});

/**
 * Category slug parameter
 */
export const categorySlugSchema = z.object({
  slug: z.string().min(1).max(100),
});

/**
 * Brand slug parameter
 */
export const brandSlugSchema = z.object({
  slug: z.string().min(1).max(100),
});

export type ProductListQuery = z.infer<typeof productListSchema>;
export type ProductSearchQuery = z.infer<typeof productSearchSchema>;
export type CategorySlugParams = z.infer<typeof categorySlugSchema>;
export type BrandSlugParams = z.infer<typeof brandSlugSchema>;
