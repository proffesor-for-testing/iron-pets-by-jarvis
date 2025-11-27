/**
 * CATALOG CONTROLLER
 * Request/Response handling for catalog module
 * London School: Focus on collaborations with service layer
 */

import type { Request, Response } from 'express';
import { CatalogService } from './catalog.service';
import type { PrismaClient } from '@prisma/client';
import type { SearchClient } from 'algoliasearch';

export class CatalogController {
  private catalogService: CatalogService;
  private algoliaClient: SearchClient;

  constructor(prismaClient: PrismaClient, algoliaClient: SearchClient) {
    this.catalogService = new CatalogService(prismaClient);
    this.algoliaClient = algoliaClient;
  }

  /**
   * GET /categories - Hierarchical category tree
   * REQ-CAT-001: Hierarchical categories
   */
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await this.catalogService.getAllCategories();
      const tree = this.catalogService.buildCategoryTree(categories);

      res.json({
        success: true,
        data: tree,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch categories',
      });
    }
  }

  /**
   * GET /categories/:slug - Category detail with products
   */
  async getCategoryBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const category = await this.catalogService.getCategoryBySlug(slug);

      if (!category) {
        res.status(404).json({
          success: false,
          error: 'Category not found',
        });
        return;
      }

      const products = await this.catalogService.getProductsByCategory(
        category.id,
        req.query as any
      );

      res.json({
        success: true,
        data: {
          category,
          products,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch category',
      });
    }
  }

  /**
   * GET /brands - All brands with product count
   */
  async getBrands(req: Request, res: Response): Promise<void> {
    try {
      const brands = await this.catalogService.getAllBrands();

      res.json({
        success: true,
        data: brands,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch brands',
      });
    }
  }

  /**
   * GET /brands/:slug - Brand detail with products
   */
  async getBrandBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const brand = await this.catalogService.getBrandBySlug(slug);

      if (!brand) {
        res.status(404).json({
          success: false,
          error: 'Brand not found',
        });
        return;
      }

      const products = await this.catalogService.getProductsByBrand(
        brand.id,
        req.query as any
      );

      res.json({
        success: true,
        data: {
          brand,
          products,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch brand',
      });
    }
  }

  /**
   * GET /products - Paginated product listing
   * REQ-CAT-002: 24 items per page
   * REQ-SRCH-003: Filtering
   * REQ-SRCH-004: Sorting
   */
  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.catalogService.getProducts(req.query as any);

      res.json({
        success: true,
        data: result.products,
        pagination: result.pagination,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch products',
      });
    }
  }

  /**
   * GET /products/:slug - Product detail
   * REQ-CAT-003: Product detail with images, specs, related
   */
  async getProductBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const product = await this.catalogService.getProductBySlug(slug);

      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found',
        });
        return;
      }

      const relatedProducts = await this.catalogService.getRelatedProducts(product);
      const stockStatus = this.catalogService.calculateStockStatus(product.stock);

      res.json({
        success: true,
        data: {
          product,
          relatedProducts,
          stockStatus,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product',
      });
    }
  }

  /**
   * GET /products/search - Full-text search
   * REQ-SRCH-001: Algolia integration
   */
  async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      const { q, category, brand, minPrice, maxPrice, page = 1 } = req.query as any;

      const index = this.algoliaClient.initIndex('products');

      // Build Algolia filters
      const filters: string[] = [];
      if (category) filters.push(`category.slug:${category}`);
      if (brand) filters.push(`brand.slug:${brand}`);
      if (minPrice || maxPrice) {
        const priceFilter = [];
        if (minPrice) priceFilter.push(`price >= ${minPrice}`);
        if (maxPrice) priceFilter.push(`price <= ${maxPrice}`);
        filters.push(`(${priceFilter.join(' AND ')})`);
      }

      const searchResults = await index.search(q || '', {
        filters: filters.join(' AND '),
        page: parseInt(page) - 1,
        hitsPerPage: 24,
      });

      res.json({
        success: true,
        data: searchResults.hits,
        pagination: {
          page: parseInt(page),
          totalItems: searchResults.nbHits,
          totalPages: searchResults.nbPages,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Search failed',
      });
    }
  }
}
