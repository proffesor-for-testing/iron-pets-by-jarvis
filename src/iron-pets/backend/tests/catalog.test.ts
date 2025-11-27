/**
 * CATALOG MODULE TEST SUITE
 * London School TDD - Outside-In Approach
 * Testing object collaborations and behaviors
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';

// Mock dependencies - define contracts first
const mockPrismaClient = {
  category: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  brand: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
  },
};

const mockAlgoliaClient = {
  search: jest.fn(),
  initIndex: jest.fn(() => ({
    search: jest.fn(),
  })),
};

// Import after mocking
let catalogController: any;
let catalogService: any;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Catalog Module - Categories', () => {
  describe('GET /categories - Hierarchical Category Tree', () => {
    it('should return hierarchical category tree with parent-child relationships', async () => {
      // Arrange - Mock the conversation
      const mockCategories = [
        { id: '1', name: 'Dogs', slug: 'dogs', parentId: null, icon: '🐕', order: 1 },
        { id: '2', name: 'Food', slug: 'dogs-food', parentId: '1', icon: '🍖', order: 1 },
        { id: '3', name: 'Treats', slug: 'dogs-treats', parentId: '1', icon: '🦴', order: 2 },
        { id: '4', name: 'Toys', slug: 'dogs-toys', parentId: '1', icon: '🎾', order: 3 },
        { id: '5', name: 'Cats', slug: 'cats', parentId: null, icon: '🐈', order: 2 },
      ];

      mockPrismaClient.category.findMany.mockResolvedValue(mockCategories);

      // Act - Execute the collaboration
      const req = { query: {} } as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      // Import and execute
      const { CatalogController } = await import('../src/modules/catalog/catalog.controller');
      const controller = new CatalogController(mockPrismaClient, mockAlgoliaClient);
      await controller.getCategories(req, res);

      // Assert - Verify the conversation
      expect(mockPrismaClient.category.findMany).toHaveBeenCalledWith({
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
        include: {
          _count: {
            select: { products: true },
          },
        },
      });

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({
              id: '1',
              name: 'Dogs',
              slug: 'dogs',
              children: expect.arrayContaining([
                expect.objectContaining({ name: 'Food' }),
                expect.objectContaining({ name: 'Treats' }),
                expect.objectContaining({ name: 'Toys' }),
              ]),
            }),
          ]),
        })
      );
    });

    it('should handle empty categories gracefully', async () => {
      mockPrismaClient.category.findMany.mockResolvedValue([]);

      const req = { query: {} } as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const { CatalogController } = await import('../src/modules/catalog/catalog.controller');
      const controller = new CatalogController(mockPrismaClient, mockAlgoliaClient);
      await controller.getCategories(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [],
      });
    });
  });

  describe('GET /categories/:slug - Category Detail', () => {
    it('should return category with products when slug is valid', async () => {
      const mockCategory = {
        id: '1',
        name: 'Dogs',
        slug: 'dogs',
        description: 'Products for dogs',
        icon: '🐕',
      };

      const mockProducts = [
        {
          id: 'p1',
          name: 'Premium Dog Food',
          slug: 'premium-dog-food',
          price: 49.99,
          compareAtPrice: 59.99,
          rating: 4.8,
          reviewCount: 234,
        },
      ];

      mockPrismaClient.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaClient.product.findMany.mockResolvedValue(mockProducts);

      const req = { params: { slug: 'dogs' } } as any;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const { CatalogController } = await import('../src/modules/catalog/catalog.controller');
      const controller = new CatalogController(mockPrismaClient, mockAlgoliaClient);
      await controller.getCategoryBySlug(req, res);

      expect(mockPrismaClient.category.findUnique).toHaveBeenCalledWith({
        where: { slug: 'dogs' },
        include: {
          children: true,
          parent: true,
        },
      });

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            category: mockCategory,
            products: mockProducts,
          }),
        })
      );
    });

    it('should return 404 when category slug not found', async () => {
      mockPrismaClient.category.findUnique.mockResolvedValue(null);

      const req = { params: { slug: 'invalid' } } as any;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const { CatalogController } = await import('../src/modules/catalog/catalog.controller');
      const controller = new CatalogController(mockPrismaClient, mockAlgoliaClient);
      await controller.getCategoryBySlug(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Category not found',
      });
    });
  });
});

describe('Catalog Module - Brands', () => {
  describe('GET /brands - All Brands', () => {
    it('should return all brands with product count', async () => {
      const mockBrands = [
        { id: 'b1', name: 'Royal Canin', slug: 'royal-canin', logo: '/logos/rc.png', _count: { products: 45 } },
        { id: 'b2', name: 'Hill\'s Science Diet', slug: 'hills-science-diet', logo: '/logos/hills.png', _count: { products: 32 } },
      ];

      mockPrismaClient.brand.findMany.mockResolvedValue(mockBrands);

      const req = { query: {} } as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const { CatalogController } = await import('../src/modules/catalog/catalog.controller');
      const controller = new CatalogController(mockPrismaClient, mockAlgoliaClient);
      await controller.getBrands(req, res);

      expect(mockPrismaClient.brand.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockBrands,
      });
    });
  });

  describe('GET /brands/:slug - Brand Detail', () => {
    it('should return brand with products', async () => {
      const mockBrand = {
        id: 'b1',
        name: 'Royal Canin',
        slug: 'royal-canin',
        description: 'Premium pet food brand',
        logo: '/logos/rc.png',
      };

      const mockProducts = [
        {
          id: 'p1',
          name: 'Royal Canin Adult Dog Food',
          price: 54.99,
          brandId: 'b1',
        },
      ];

      mockPrismaClient.brand.findUnique.mockResolvedValue(mockBrand);
      mockPrismaClient.product.findMany.mockResolvedValue(mockProducts);

      const req = { params: { slug: 'royal-canin' }, query: {} } as any;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const { CatalogController } = await import('../src/modules/catalog/catalog.controller');
      const controller = new CatalogController(mockPrismaClient, mockAlgoliaClient);
      await controller.getBrandBySlug(req, res);

      expect(mockPrismaClient.brand.findUnique).toHaveBeenCalledWith({
        where: { slug: 'royal-canin' },
      });

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            brand: mockBrand,
            products: mockProducts,
          }),
        })
      );
    });
  });
});

describe('Catalog Module - Products', () => {
  describe('GET /products - Product Listing', () => {
    it('should return paginated products (24 per page) - REQ-CAT-002', async () => {
      const mockProducts = Array(24).fill(null).map((_, i) => ({
        id: `p${i}`,
        name: `Product ${i}`,
        slug: `product-${i}`,
        price: 29.99 + i,
      }));

      mockPrismaClient.product.findMany.mockResolvedValue(mockProducts);
      mockPrismaClient.product.count.mockResolvedValue(100);

      const req = { query: { page: '1' } } as any;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const { CatalogController } = await import('../src/modules/catalog/catalog.controller');
      const controller = new CatalogController(mockPrismaClient, mockAlgoliaClient);
      await controller.getProducts(req, res);

      expect(mockPrismaClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 24,
          skip: 0,
        })
      );

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProducts,
        pagination: {
          page: 1,
          pageSize: 24,
          totalItems: 100,
          totalPages: 5,
          hasNext: true,
          hasPrev: false,
        },
      });
    });

    it('should filter by category - REQ-SRCH-003', async () => {
      mockPrismaClient.product.findMany.mockResolvedValue([]);
      mockPrismaClient.product.count.mockResolvedValue(0);

      const req = { query: { category: 'dogs-food' } } as any;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const { CatalogController } = await import('../src/modules/catalog/catalog.controller');
      const controller = new CatalogController(mockPrismaClient, mockAlgoliaClient);
      await controller.getProducts(req, res);

      expect(mockPrismaClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: { slug: 'dogs-food' },
          }),
        })
      );
    });

    it('should filter by brand - REQ-SRCH-003', async () => {
      mockPrismaClient.product.findMany.mockResolvedValue([]);
      mockPrismaClient.product.count.mockResolvedValue(0);

      const req = { query: { brand: 'royal-canin' } } as any;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const { CatalogController } = await import('../src/modules/catalog/catalog.controller');
      const controller = new CatalogController(mockPrismaClient, mockAlgoliaClient);
      await controller.getProducts(req, res);

      expect(mockPrismaClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            brand: { slug: 'royal-canin' },
          }),
        })
      );
    });

    it('should filter by price range - REQ-SRCH-003', async () => {
      mockPrismaClient.product.findMany.mockResolvedValue([]);
      mockPrismaClient.product.count.mockResolvedValue(0);

      const req = { query: { minPrice: '20', maxPrice: '50' } } as any;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const { CatalogController } = await import('../src/modules/catalog/catalog.controller');
      const controller = new CatalogController(mockPrismaClient, mockAlgoliaClient);
      await controller.getProducts(req, res);

      expect(mockPrismaClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: { gte: 20, lte: 50 },
          }),
        })
      );
    });

    it('should filter by rating - REQ-SRCH-003', async () => {
      mockPrismaClient.product.findMany.mockResolvedValue([]);
      mockPrismaClient.product.count.mockResolvedValue(0);

      const req = { query: { minRating: '4' } } as any;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const { CatalogController } = await import('../src/modules/catalog/catalog.controller');
      const controller = new CatalogController(mockPrismaClient, mockAlgoliaClient);
      await controller.getProducts(req, res);

      expect(mockPrismaClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            rating: { gte: 4 },
          }),
        })
      );
    });

    it('should filter by stock status - REQ-SRCH-003', async () => {
      mockPrismaClient.product.findMany.mockResolvedValue([]);
      mockPrismaClient.product.count.mockResolvedValue(0);

      const req = { query: { inStock: 'true' } } as any;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const { CatalogController } = await import('../src/modules/catalog/catalog.controller');
      const controller = new CatalogController(mockPrismaClient, mockAlgoliaClient);
      await controller.getProducts(req, res);

      expect(mockPrismaClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            stock: { gt: 0 },
          }),
        })
      );
    });

    it('should sort by price ascending - REQ-SRCH-004', async () => {
      mockPrismaClient.product.findMany.mockResolvedValue([]);
      mockPrismaClient.product.count.mockResolvedValue(0);

      const req = { query: { sort: 'price_asc' } } as any;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const { CatalogController } = await import('../src/modules/catalog/catalog.controller');
      const controller = new CatalogController(mockPrismaClient, mockAlgoliaClient);
      await controller.getProducts(req, res);

      expect(mockPrismaClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { price: 'asc' },
        })
      );
    });

    it('should sort by price descending - REQ-SRCH-004', async () => {
      mockPrismaClient.product.findMany.mockResolvedValue([]);
      mockPrismaClient.product.count.mockResolvedValue(0);

      const req = { query: { sort: 'price_desc' } } as any;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const { CatalogController } = await import('../src/modules/catalog/catalog.controller');
      const controller = new CatalogController(mockPrismaClient, mockAlgoliaClient);
      await controller.getProducts(req, res);

      expect(mockPrismaClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { price: 'desc' },
        })
      );
    });

    it('should sort by rating - REQ-SRCH-004', async () => {
      mockPrismaClient.product.findMany.mockResolvedValue([]);
      mockPrismaClient.product.count.mockResolvedValue(0);

      const req = { query: { sort: 'rating' } } as any;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const { CatalogController } = await import('../src/modules/catalog/catalog.controller');
      const controller = new CatalogController(mockPrismaClient, mockAlgoliaClient);
      await controller.getProducts(req, res);

      expect(mockPrismaClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { rating: 'desc' },
        })
      );
    });

    it('should sort by newest - REQ-SRCH-004', async () => {
      mockPrismaClient.product.findMany.mockResolvedValue([]);
      mockPrismaClient.product.count.mockResolvedValue(0);

      const req = { query: { sort: 'newest' } } as any;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const { CatalogController } = await import('../src/modules/catalog/catalog.controller');
      const controller = new CatalogController(mockPrismaClient, mockAlgoliaClient);
      await controller.getProducts(req, res);

      expect(mockPrismaClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });
  });

  describe('GET /products/:slug - Product Detail', () => {
    it('should return product detail with images and specs - REQ-CAT-003', async () => {
      const mockProduct = {
        id: 'p1',
        name: 'Premium Dog Food',
        slug: 'premium-dog-food',
        description: 'High-quality nutrition',
        price: 49.99,
        compareAtPrice: 59.99,
        rating: 4.8,
        reviewCount: 234,
        stock: 50,
        images: [
          { id: 'i1', url: '/images/product1.jpg', alt: 'Front view', order: 1 },
          { id: 'i2', url: '/images/product2.jpg', alt: 'Side view', order: 2 },
        ],
        specifications: {
          weight: '15kg',
          ingredients: 'Chicken, Rice, Vegetables',
          protein: '28%',
        },
        brand: { id: 'b1', name: 'Royal Canin', slug: 'royal-canin' },
        category: { id: 'c1', name: 'Dog Food', slug: 'dogs-food' },
      };

      mockPrismaClient.product.findUnique.mockResolvedValue(mockProduct);

      const req = { params: { slug: 'premium-dog-food' } } as any;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const { CatalogController } = await import('../src/modules/catalog/catalog.controller');
      const controller = new CatalogController(mockPrismaClient, mockAlgoliaClient);
      await controller.getProductBySlug(req, res);

      expect(mockPrismaClient.product.findUnique).toHaveBeenCalledWith({
        where: { slug: 'premium-dog-food' },
        include: {
          brand: true,
          category: true,
          images: { orderBy: { order: 'asc' } },
        },
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          product: mockProduct,
          stockStatus: 'in_stock',
        }),
      });
    });

    it('should return related products - REQ-CAT-003', async () => {
      const mockProduct = {
        id: 'p1',
        categoryId: 'c1',
        brandId: 'b1',
      };

      const mockRelatedProducts = [
        { id: 'p2', name: 'Related Product 1' },
        { id: 'p3', name: 'Related Product 2' },
      ];

      mockPrismaClient.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaClient.product.findMany.mockResolvedValue(mockRelatedProducts);

      const req = { params: { slug: 'premium-dog-food' } } as any;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const { CatalogController } = await import('../src/modules/catalog/catalog.controller');
      const controller = new CatalogController(mockPrismaClient, mockAlgoliaClient);
      await controller.getProductBySlug(req, res);

      // Verify related products query
      expect(mockPrismaClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { categoryId: 'c1' },
              { brandId: 'b1' },
            ],
            id: { not: 'p1' },
          },
          take: 6,
        })
      );

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            relatedProducts: mockRelatedProducts,
          }),
        })
      );
    });

    it('should calculate stock status correctly', async () => {
      const testCases = [
        { stock: 0, expected: 'out_of_stock' },
        { stock: 5, expected: 'low_stock' },
        { stock: 50, expected: 'in_stock' },
      ];

      for (const testCase of testCases) {
        mockPrismaClient.product.findUnique.mockResolvedValue({
          id: 'p1',
          stock: testCase.stock,
        });

        mockPrismaClient.product.findMany.mockResolvedValue([]);

        const req = { params: { slug: 'test' } } as any;
        const res = {
          json: jest.fn(),
          status: jest.fn().mockReturnThis(),
        } as unknown as Response;

        const { CatalogController } = await import('../src/modules/catalog/catalog.controller');
        const controller = new CatalogController(mockPrismaClient, mockAlgoliaClient);
        await controller.getProductBySlug(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              stockStatus: testCase.expected,
            }),
          })
        );
      }
    });
  });

  describe('GET /products/search - Full-Text Search', () => {
    it('should search products with Algolia - REQ-SRCH-001', async () => {
      const mockSearchResults = {
        hits: [
          { objectID: 'p1', name: 'Dog Food', price: 29.99, _highlightResult: {} },
          { objectID: 'p2', name: 'Dog Treats', price: 9.99, _highlightResult: {} },
        ],
        nbHits: 2,
        page: 0,
        nbPages: 1,
      };

      const mockIndex = {
        search: jest.fn().mockResolvedValue(mockSearchResults),
      };

      mockAlgoliaClient.initIndex.mockReturnValue(mockIndex);

      const req = { query: { q: 'dog food' } } as any;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const { CatalogController } = await import('../src/modules/catalog/catalog.controller');
      const controller = new CatalogController(mockPrismaClient, mockAlgoliaClient);
      await controller.searchProducts(req, res);

      expect(mockAlgoliaClient.initIndex).toHaveBeenCalledWith('products');
      expect(mockIndex.search).toHaveBeenCalledWith('dog food', expect.any(Object));

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSearchResults.hits,
        pagination: {
          page: 1,
          totalItems: 2,
          totalPages: 1,
        },
      });
    });

    it('should apply filters in Algolia search', async () => {
      const mockIndex = {
        search: jest.fn().mockResolvedValue({ hits: [], nbHits: 0, page: 0, nbPages: 0 }),
      };

      mockAlgoliaClient.initIndex.mockReturnValue(mockIndex);

      const req = {
        query: {
          q: 'food',
          category: 'dogs-food',
          brand: 'royal-canin',
          minPrice: '20',
          maxPrice: '50',
        },
      } as any;

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const { CatalogController } = await import('../src/modules/catalog/catalog.controller');
      const controller = new CatalogController(mockPrismaClient, mockAlgoliaClient);
      await controller.searchProducts(req, res);

      expect(mockIndex.search).toHaveBeenCalledWith(
        'food',
        expect.objectContaining({
          filters: expect.stringContaining('category.slug:dogs-food'),
        })
      );
    });
  });
});

describe('Catalog Module - Service Layer', () => {
  it('should build hierarchical category tree correctly', async () => {
    const { CatalogService } = await import('../src/modules/catalog/catalog.service');
    const service = new CatalogService(mockPrismaClient);

    const flatCategories = [
      { id: '1', name: 'Dogs', parentId: null, children: [] },
      { id: '2', name: 'Food', parentId: '1', children: [] },
      { id: '3', name: 'Treats', parentId: '1', children: [] },
      { id: '4', name: 'Cats', parentId: null, children: [] },
    ];

    const tree = service.buildCategoryTree(flatCategories);

    expect(tree).toHaveLength(2); // Dogs and Cats
    expect(tree[0].children).toHaveLength(2); // Food and Treats
    expect(tree[0].children![0].name).toBe('Food');
  });

  it('should calculate pagination correctly', async () => {
    const { CatalogService } = await import('../src/modules/catalog/catalog.service');
    const service = new CatalogService(mockPrismaClient);

    const pagination = service.calculatePagination(1, 24, 100);

    expect(pagination).toEqual({
      page: 1,
      pageSize: 24,
      totalItems: 100,
      totalPages: 5,
      hasNext: true,
      hasPrev: false,
    });

    const page3 = service.calculatePagination(3, 24, 100);
    expect(page3.hasNext).toBe(true);
    expect(page3.hasPrev).toBe(true);

    const lastPage = service.calculatePagination(5, 24, 100);
    expect(lastPage.hasNext).toBe(false);
    expect(lastPage.hasPrev).toBe(true);
  });
});
