/**
 * CATALOG SERVICE
 * Business logic for catalog operations
 * London School: Defines contracts through interactions
 */

import type { PrismaClient } from '@prisma/client';

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  icon?: string;
  order: number;
  children?: Category[];
  _count?: {
    products: number;
  };
}

interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
  inStock?: string;
  sort?: string;
  page?: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class CatalogService {
  private readonly PAGE_SIZE = 24; // REQ-CAT-002
  private readonly LOW_STOCK_THRESHOLD = 10;

  constructor(private prisma: PrismaClient) {}

  /**
   * Get all categories with product counts
   */
  async getAllCategories(): Promise<Category[]> {
    return this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { products: true },
        },
      },
    }) as any;
  }

  /**
   * Build hierarchical category tree
   */
  buildCategoryTree(flatCategories: Category[]): Category[] {
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];

    // Initialize all categories with empty children array
    flatCategories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Build the tree
    flatCategories.forEach(cat => {
      const category = categoryMap.get(cat.id)!;

      if (cat.parentId === null) {
        rootCategories.push(category);
      } else {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children!.push(category);
        }
      }
    });

    return rootCategories;
  }

  /**
   * Get category by slug with relations
   */
  async getCategoryBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
      include: {
        children: true,
        parent: true,
      },
    });
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId: string, filters: ProductFilters) {
    return this.prisma.product.findMany({
      where: { categoryId },
      ...this.buildProductQuery(filters),
    });
  }

  /**
   * Get all brands with product counts
   */
  async getAllBrands() {
    return this.prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  /**
   * Get brand by slug
   */
  async getBrandBySlug(slug: string) {
    return this.prisma.brand.findUnique({
      where: { slug },
    });
  }

  /**
   * Get products by brand
   */
  async getProductsByBrand(brandId: string, filters: ProductFilters) {
    return this.prisma.product.findMany({
      where: { brandId },
      ...this.buildProductQuery(filters),
    });
  }

  /**
   * Get paginated products with filters and sorting
   * REQ-CAT-002, REQ-SRCH-003, REQ-SRCH-004
   */
  async getProducts(filters: ProductFilters) {
    const page = parseInt(filters.page || '1');
    const skip = (page - 1) * this.PAGE_SIZE;

    const where = this.buildWhereClause(filters);
    const orderBy = this.buildOrderByClause(filters.sort);

    const [products, totalItems] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        take: this.PAGE_SIZE,
        skip,
        include: {
          brand: true,
          category: true,
          images: {
            orderBy: { sortOrder: 'asc' },
            take: 1,
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const pagination = this.calculatePagination(page, this.PAGE_SIZE, totalItems);

    return { products, pagination };
  }

  /**
   * Get product by slug with all details
   */
  async getProductBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  /**
   * Get related products
   * REQ-CAT-003: Related products
   */
  async getRelatedProducts(product: any) {
    return this.prisma.product.findMany({
      where: {
        OR: [
          { categoryId: product.categoryId },
          { brandId: product.brandId },
        ],
        id: { not: product.id },
      },
      take: 6,
      include: {
        brand: true,
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
    });
  }

  /**
   * Calculate stock status
   */
  calculateStockStatus(stock: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
    if (stock === 0) return 'out_of_stock';
    if (stock <= this.LOW_STOCK_THRESHOLD) return 'low_stock';
    return 'in_stock';
  }

  /**
   * Calculate pagination metadata
   */
  calculatePagination(page: number, pageSize: number, totalItems: number): Pagination {
    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Build WHERE clause for product filtering
   * REQ-SRCH-003: Multiple filters
   */
  private buildWhereClause(filters: ProductFilters) {
    const where: any = {};

    if (filters.category) {
      where.category = { slug: filters.category };
    }

    if (filters.brand) {
      where.brand = { slug: filters.brand };
    }

    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = parseFloat(filters.minPrice);
      if (filters.maxPrice) where.price.lte = parseFloat(filters.maxPrice);
    }

    if (filters.minRating) {
      where.rating = { gte: parseFloat(filters.minRating) };
    }

    if (filters.inStock === 'true') {
      where.stock = { gt: 0 };
    }

    return where;
  }

  /**
   * Build ORDER BY clause for sorting
   * REQ-SRCH-004: Multiple sort options
   */
  private buildOrderByClause(sort?: string) {
    switch (sort) {
      case 'price_asc':
        return { price: 'asc' as const };
      case 'price_desc':
        return { price: 'desc' as const };
      case 'rating':
        return { rating: 'desc' as const };
      case 'newest':
        return { createdAt: 'desc' as const };
      default:
        return { createdAt: 'desc' as const }; // Default: newest first
    }
  }

  /**
   * Build common product query options
   */
  private buildProductQuery(_filters: ProductFilters) {
    return {
      include: {
        brand: true,
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' as const },
          take: 1,
        },
      },
      take: this.PAGE_SIZE,
    };
  }
}
