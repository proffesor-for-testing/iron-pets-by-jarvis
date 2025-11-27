/**
 * CATALOG ROUTES
 * Express routing for catalog module
 */

import { Router } from 'express';
import { CatalogController } from './catalog.controller';
import { validateQuery } from '../../middleware/validation';
import {
  productListSchema,
  productSearchSchema,
  categorySlugSchema,
  brandSlugSchema
} from './catalog.validation';

export function createCatalogRoutes(catalogController: CatalogController): Router {
  const router = Router();

  // Categories
  router.get('/categories', catalogController.getCategories.bind(catalogController));
  router.get(
    '/categories/:slug',
    validateQuery(categorySlugSchema),
    catalogController.getCategoryBySlug.bind(catalogController)
  );

  // Brands
  router.get('/brands', catalogController.getBrands.bind(catalogController));
  router.get(
    '/brands/:slug',
    validateQuery(brandSlugSchema),
    catalogController.getBrandBySlug.bind(catalogController)
  );

  // Products
  router.get(
    '/products',
    validateQuery(productListSchema),
    catalogController.getProducts.bind(catalogController)
  );

  router.get(
    '/products/search',
    validateQuery(productSearchSchema),
    catalogController.searchProducts.bind(catalogController)
  );

  router.get(
    '/products/:slug',
    catalogController.getProductBySlug.bind(catalogController)
  );

  return router;
}
