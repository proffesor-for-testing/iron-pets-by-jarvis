/**
 * TDD London School - Search Module Tests
 * Outside-In approach with mock-driven development
 *
 * Test Coverage:
 * - REQ-SRCH-001: Product search with typo tolerance, relevance ranking
 * - REQ-SRCH-002: Autocomplete within 200ms, 8 suggestions max
 * - REQ-SRCH-003: Filters (price, brand, rating, availability)
 * - REQ-SRCH-004: Sorting (relevance, price low/high, rating, newest)
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import { Express } from 'express';
import { PrismaClient } from '@prisma/client';

// Mock dependencies (London School approach)
const mockPrisma = {
  product: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
  brand: {
    findMany: jest.fn(),
  },
  category: {
    findMany: jest.fn(),
  },
};

const mockRedis = {
  get: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  incr: jest.fn(),
};

const mockSearchEngine = {
  search: jest.fn(),
  suggest: jest.fn(),
  indexProduct: jest.fn(),
  buildQuery: jest.fn(),
};

// Test data
const sampleProducts = [
  {
    id: 'prod-001',
    sku: 'FOOD-DRY-001',
    name: 'Premium Dog Food - Chicken & Rice',
    description: 'High-quality dry dog food with real chicken',
    price: 49.99,
    salePrice: null,
    stockQuantity: 150,
    categoryId: 'cat-001',
    brandId: 'brand-001',
    rating: 4.5,
    reviewCount: 89,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    category: { id: 'cat-001', name: 'Dog Food', slug: 'dog-food' },
    brand: { id: 'brand-001', name: 'PremiumPet', slug: 'premiumpet' },
  },
  {
    id: 'prod-002',
    sku: 'FOOD-WET-002',
    name: 'Organic Cat Food - Salmon',
    description: 'Grain-free wet cat food with wild salmon',
    price: 29.99,
    salePrice: 24.99,
    stockQuantity: 0,
    categoryId: 'cat-002',
    brandId: 'brand-002',
    rating: 4.8,
    reviewCount: 142,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    category: { id: 'cat-002', name: 'Cat Food', slug: 'cat-food' },
    brand: { id: 'brand-002', name: 'OrganicPaws', slug: 'organicpaws' },
  },
  {
    id: 'prod-003',
    sku: 'TOY-CHW-003',
    name: 'Durable Dog Chew Toy',
    description: 'Tough rubber toy for aggressive chewers',
    price: 15.99,
    salePrice: null,
    stockQuantity: 250,
    categoryId: 'cat-003',
    brandId: 'brand-003',
    rating: 4.2,
    reviewCount: 56,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
    category: { id: 'cat-003', name: 'Dog Toys', slug: 'dog-toys' },
    brand: { id: 'brand-003', name: 'ToughPlay', slug: 'toughplay' },
  },
];

const sampleBrands = [
  { id: 'brand-001', name: 'PremiumPet', slug: 'premiumpet' },
  { id: 'brand-002', name: 'OrganicPaws', slug: 'organicpaws' },
  { id: 'brand-003', name: 'ToughPlay', slug: 'toughplay' },
];

const sampleCategories = [
  { id: 'cat-001', name: 'Dog Food', slug: 'dog-food', parentId: null },
  { id: 'cat-002', name: 'Cat Food', slug: 'cat-food', parentId: null },
  { id: 'cat-003', name: 'Dog Toys', slug: 'dog-toys', parentId: null },
];

describe('Search Module - TDD London School', () => {
  let app: Express;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /search - Basic Search Functionality - REQ-SRCH-001', () => {
    it('should return products matching keyword search', async () => {
      // Arrange - Setup mock expectations
      const searchQuery = 'dog food';
      mockPrisma.product.findMany.mockResolvedValue([sampleProducts[0]]);
      mockPrisma.product.count.mockResolvedValue(1);
      mockSearchEngine.search.mockResolvedValue({
        products: [sampleProducts[0]],
        total: 1,
        relevanceScores: { 'prod-001': 0.95 },
      });

      // Act
      const response = await request(app)
        .get('/search')
        .query({ q: searchQuery, page: 1, pageSize: 20 })
        .expect(200);

      // Assert - Verify collaboration pattern
      expect(mockSearchEngine.search).toHaveBeenCalledWith({
        query: searchQuery,
        filters: {},
        pagination: { page: 1, pageSize: 20 },
        sort: 'relevance',
      });

      expect(response.body).toMatchObject({
        success: true,
        data: {
          products: [
            {
              id: 'prod-001',
              name: 'Premium Dog Food - Chicken & Rice',
              price: 49.99,
              rating: 4.5,
              inStock: true,
            },
          ],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
          },
        },
      });
    });

    it('should return empty results for no matches', async () => {
      // Arrange
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);
      mockSearchEngine.search.mockResolvedValue({
        products: [],
        total: 0,
        relevanceScores: {},
      });

      // Act
      const response = await request(app)
        .get('/search')
        .query({ q: 'nonexistent product xyz' })
        .expect(200);

      // Assert
      expect(response.body).toMatchObject({
        success: true,
        data: {
          products: [],
          pagination: {
            total: 0,
            totalPages: 0,
          },
        },
      });
    });

    it('should handle empty query string gracefully', async () => {
      // Arrange
      mockPrisma.product.findMany.mockResolvedValue(sampleProducts);
      mockPrisma.product.count.mockResolvedValue(3);

      // Act
      const response = await request(app)
        .get('/search')
        .query({ q: '', page: 1, pageSize: 20 })
        .expect(200);

      // Assert - Should return all products when no query
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: { category: true, brand: true },
      });

      expect(response.body.data.products).toHaveLength(3);
    });

    it('should handle typo tolerance in search - REQ-SRCH-001', async () => {
      // Arrange - Simulate fuzzy search matching "fod" to "food"
      const typoQuery = 'dof fod'; // Misspelled "dog food"
      mockSearchEngine.search.mockResolvedValue({
        products: [sampleProducts[0]],
        total: 1,
        relevanceScores: { 'prod-001': 0.78 }, // Lower score due to fuzzy match
        correctedQuery: 'dog food',
      });

      // Act
      const response = await request(app)
        .get('/search')
        .query({ q: typoQuery })
        .expect(200);

      // Assert
      expect(mockSearchEngine.search).toHaveBeenCalledWith({
        query: typoQuery,
        filters: {},
        pagination: expect.any(Object),
        sort: 'relevance',
      });

      expect(response.body.data).toMatchObject({
        products: expect.arrayContaining([
          expect.objectContaining({ id: 'prod-001' }),
        ]),
        didYouMean: 'dog food',
      });
    });

    it('should rank results by relevance score - REQ-SRCH-001', async () => {
      // Arrange - Multiple products with different relevance scores
      const rankedProducts = [
        { ...sampleProducts[0], relevanceScore: 0.95 },
        { ...sampleProducts[2], relevanceScore: 0.72 },
        { ...sampleProducts[1], relevanceScore: 0.65 },
      ];

      mockSearchEngine.search.mockResolvedValue({
        products: rankedProducts,
        total: 3,
        relevanceScores: {
          'prod-001': 0.95,
          'prod-003': 0.72,
          'prod-002': 0.65,
        },
      });

      // Act
      const response = await request(app)
        .get('/search')
        .query({ q: 'dog', sort: 'relevance' })
        .expect(200);

      // Assert - Verify products ordered by relevance
      expect(response.body.data.products[0].id).toBe('prod-001');
      expect(response.body.data.products[1].id).toBe('prod-003');
      expect(response.body.data.products[2].id).toBe('prod-002');
    });
  });

  describe('GET /search - Pagination - REQ-SRCH-001', () => {
    it('should paginate results with page and pageSize parameters', async () => {
      // Arrange
      const page = 2;
      const pageSize = 10;
      mockPrisma.product.findMany.mockResolvedValue([sampleProducts[0]]);
      mockPrisma.product.count.mockResolvedValue(25);

      // Act
      const response = await request(app)
        .get('/search')
        .query({ q: 'food', page, pageSize })
        .expect(200);

      // Assert - Verify correct skip/take calculation
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: expect.any(Object),
        skip: 10, // (page - 1) * pageSize = (2 - 1) * 10
        take: 10,
        orderBy: expect.any(Object),
        include: expect.any(Object),
      });

      expect(response.body.data.pagination).toMatchObject({
        page: 2,
        pageSize: 10,
        total: 25,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      });
    });

    it('should use default pagination values when not provided', async () => {
      // Arrange
      mockPrisma.product.findMany.mockResolvedValue(sampleProducts);
      mockPrisma.product.count.mockResolvedValue(3);

      // Act
      const response = await request(app)
        .get('/search')
        .query({ q: 'pet' })
        .expect(200);

      // Assert - Default page=1, pageSize=20
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: expect.any(Object),
        skip: 0,
        take: 20,
        orderBy: expect.any(Object),
        include: expect.any(Object),
      });

      expect(response.body.data.pagination).toMatchObject({
        page: 1,
        pageSize: 20,
      });
    });

    it('should reject invalid pagination parameters', async () => {
      // Act & Assert - Negative page
      await request(app)
        .get('/search')
        .query({ q: 'food', page: -1 })
        .expect(400);

      // Act & Assert - Page size exceeds max (100)
      await request(app)
        .get('/search')
        .query({ q: 'food', pageSize: 150 })
        .expect(400);

      // Act & Assert - Zero page
      await request(app)
        .get('/search')
        .query({ q: 'food', page: 0 })
        .expect(400);
    });

    it('should calculate totalPages correctly', async () => {
      // Arrange
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(47);

      // Act
      const response = await request(app)
        .get('/search')
        .query({ q: 'toy', pageSize: 10 })
        .expect(200);

      // Assert - 47 items / 10 per page = 5 pages
      expect(response.body.data.pagination.totalPages).toBe(5);
    });
  });

  describe('GET /search - Filtering - REQ-SRCH-003', () => {
    it('should filter by category', async () => {
      // Arrange
      const categoryId = 'cat-001';
      mockPrisma.product.findMany.mockResolvedValue([sampleProducts[0]]);
      mockPrisma.product.count.mockResolvedValue(1);

      // Act
      const response = await request(app)
        .get('/search')
        .query({ q: 'food', categoryId })
        .expect(200);

      // Assert
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          categoryId: 'cat-001',
        }),
        skip: expect.any(Number),
        take: expect.any(Number),
        orderBy: expect.any(Object),
        include: expect.any(Object),
      });

      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.products[0].category.id).toBe('cat-001');
    });

    it('should filter by price range - REQ-SRCH-003', async () => {
      // Arrange
      const minPrice = 20;
      const maxPrice = 50;
      mockPrisma.product.findMany.mockResolvedValue([
        sampleProducts[0],
        sampleProducts[1],
      ]);
      mockPrisma.product.count.mockResolvedValue(2);

      // Act
      const response = await request(app)
        .get('/search')
        .query({ q: 'food', minPrice, maxPrice })
        .expect(200);

      // Assert
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          price: {
            gte: 20,
            lte: 50,
          },
        }),
        skip: expect.any(Number),
        take: expect.any(Number),
        orderBy: expect.any(Object),
        include: expect.any(Object),
      });

      expect(response.body.data.products).toHaveLength(2);
      response.body.data.products.forEach((product: any) => {
        expect(product.price).toBeGreaterThanOrEqual(20);
        expect(product.price).toBeLessThanOrEqual(50);
      });
    });

    it('should filter by brand - REQ-SRCH-003', async () => {
      // Arrange
      const brandId = 'brand-002';
      mockPrisma.product.findMany.mockResolvedValue([sampleProducts[1]]);
      mockPrisma.product.count.mockResolvedValue(1);

      // Act
      const response = await request(app)
        .get('/search')
        .query({ q: 'food', brandId })
        .expect(200);

      // Assert
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          brandId: 'brand-002',
        }),
        skip: expect.any(Number),
        take: expect.any(Number),
        orderBy: expect.any(Object),
        include: expect.any(Object),
      });

      expect(response.body.data.products[0].brand.id).toBe('brand-002');
    });

    it('should filter by minimum rating - REQ-SRCH-003', async () => {
      // Arrange
      const minRating = 4.5;
      mockPrisma.product.findMany.mockResolvedValue([
        sampleProducts[0],
        sampleProducts[1],
      ]);
      mockPrisma.product.count.mockResolvedValue(2);

      // Act
      const response = await request(app)
        .get('/search')
        .query({ q: 'food', minRating })
        .expect(200);

      // Assert
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          rating: {
            gte: 4.5,
          },
        }),
        skip: expect.any(Number),
        take: expect.any(Number),
        orderBy: expect.any(Object),
        include: expect.any(Object),
      });

      response.body.data.products.forEach((product: any) => {
        expect(product.rating).toBeGreaterThanOrEqual(4.5);
      });
    });

    it('should filter by stock availability - REQ-SRCH-003', async () => {
      // Arrange
      mockPrisma.product.findMany.mockResolvedValue([
        sampleProducts[0],
        sampleProducts[2],
      ]);
      mockPrisma.product.count.mockResolvedValue(2);

      // Act
      const response = await request(app)
        .get('/search')
        .query({ q: 'pet', inStock: true })
        .expect(200);

      // Assert
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          stockQuantity: {
            gt: 0,
          },
        }),
        skip: expect.any(Number),
        take: expect.any(Number),
        orderBy: expect.any(Object),
        include: expect.any(Object),
      });

      response.body.data.products.forEach((product: any) => {
        expect(product.inStock).toBe(true);
      });
    });

    it('should combine multiple filters - REQ-SRCH-003', async () => {
      // Arrange
      const filters = {
        q: 'food',
        categoryId: 'cat-001',
        minPrice: 20,
        maxPrice: 60,
        brandId: 'brand-001',
        minRating: 4.0,
        inStock: true,
      };

      mockPrisma.product.findMany.mockResolvedValue([sampleProducts[0]]);
      mockPrisma.product.count.mockResolvedValue(1);

      // Act
      const response = await request(app)
        .get('/search')
        .query(filters)
        .expect(200);

      // Assert - Verify all filters applied
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          categoryId: 'cat-001',
          brandId: 'brand-001',
          price: {
            gte: 20,
            lte: 60,
          },
          rating: {
            gte: 4.0,
          },
          stockQuantity: {
            gt: 0,
          },
        }),
        skip: expect.any(Number),
        take: expect.any(Number),
        orderBy: expect.any(Object),
        include: expect.any(Object),
      });
    });
  });

  describe('GET /search - Sorting - REQ-SRCH-004', () => {
    it('should sort by relevance (default) - REQ-SRCH-004', async () => {
      // Arrange
      mockSearchEngine.search.mockResolvedValue({
        products: sampleProducts,
        total: 3,
        relevanceScores: {
          'prod-001': 0.95,
          'prod-002': 0.85,
          'prod-003': 0.75,
        },
      });

      // Act
      const response = await request(app)
        .get('/search')
        .query({ q: 'pet', sort: 'relevance' })
        .expect(200);

      // Assert
      expect(mockSearchEngine.search).toHaveBeenCalledWith({
        query: 'pet',
        filters: {},
        pagination: expect.any(Object),
        sort: 'relevance',
      });
    });

    it('should sort by price low to high - REQ-SRCH-004', async () => {
      // Arrange
      const sortedProducts = [
        sampleProducts[2], // $15.99
        sampleProducts[1], // $29.99
        sampleProducts[0], // $49.99
      ];
      mockPrisma.product.findMany.mockResolvedValue(sortedProducts);
      mockPrisma.product.count.mockResolvedValue(3);

      // Act
      const response = await request(app)
        .get('/search')
        .query({ q: 'pet', sort: 'price_asc' })
        .expect(200);

      // Assert
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: expect.any(Object),
        skip: expect.any(Number),
        take: expect.any(Number),
        orderBy: { price: 'asc' },
        include: expect.any(Object),
      });

      expect(response.body.data.products[0].price).toBeLessThan(
        response.body.data.products[1].price
      );
    });

    it('should sort by price high to low - REQ-SRCH-004', async () => {
      // Arrange
      const sortedProducts = [
        sampleProducts[0], // $49.99
        sampleProducts[1], // $29.99
        sampleProducts[2], // $15.99
      ];
      mockPrisma.product.findMany.mockResolvedValue(sortedProducts);
      mockPrisma.product.count.mockResolvedValue(3);

      // Act
      const response = await request(app)
        .get('/search')
        .query({ q: 'pet', sort: 'price_desc' })
        .expect(200);

      // Assert
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: expect.any(Object),
        skip: expect.any(Number),
        take: expect.any(Number),
        orderBy: { price: 'desc' },
        include: expect.any(Object),
      });

      expect(response.body.data.products[0].price).toBeGreaterThan(
        response.body.data.products[1].price
      );
    });

    it('should sort by rating high to low - REQ-SRCH-004', async () => {
      // Arrange
      const sortedProducts = [
        sampleProducts[1], // 4.8
        sampleProducts[0], // 4.5
        sampleProducts[2], // 4.2
      ];
      mockPrisma.product.findMany.mockResolvedValue(sortedProducts);
      mockPrisma.product.count.mockResolvedValue(3);

      // Act
      const response = await request(app)
        .get('/search')
        .query({ q: 'pet', sort: 'rating' })
        .expect(200);

      // Assert
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: expect.any(Object),
        skip: expect.any(Number),
        take: expect.any(Number),
        orderBy: { rating: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should sort by newest first - REQ-SRCH-004', async () => {
      // Arrange
      const sortedProducts = [
        sampleProducts[2], // Jan 25
        sampleProducts[1], // Jan 20
        sampleProducts[0], // Jan 15
      ];
      mockPrisma.product.findMany.mockResolvedValue(sortedProducts);
      mockPrisma.product.count.mockResolvedValue(3);

      // Act
      const response = await request(app)
        .get('/search')
        .query({ q: 'pet', sort: 'newest' })
        .expect(200);

      // Assert
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: expect.any(Object),
        skip: expect.any(Number),
        take: expect.any(Number),
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should reject invalid sort parameter', async () => {
      // Act & Assert
      const response = await request(app)
        .get('/search')
        .query({ q: 'pet', sort: 'invalid_sort' })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid sort parameter'),
      });
    });
  });

  describe('GET /search/autocomplete - REQ-SRCH-002', () => {
    it('should return autocomplete suggestions within 200ms', async () => {
      // Arrange
      const query = 'dog f';
      const suggestions = [
        { text: 'dog food', score: 0.95 },
        { text: 'dog food dry', score: 0.87 },
        { text: 'dog food wet', score: 0.82 },
      ];

      mockSearchEngine.suggest.mockResolvedValue(suggestions);
      mockRedis.get.mockResolvedValue(null); // Cache miss

      // Act
      const startTime = Date.now();
      const response = await request(app)
        .get('/search/autocomplete')
        .query({ q: query })
        .expect(200);
      const duration = Date.now() - startTime;

      // Assert - Performance requirement
      expect(duration).toBeLessThan(200);

      expect(mockSearchEngine.suggest).toHaveBeenCalledWith({
        query,
        limit: 8,
      });

      expect(response.body).toMatchObject({
        success: true,
        data: {
          suggestions: [
            { text: 'dog food', score: 0.95 },
            { text: 'dog food dry', score: 0.87 },
            { text: 'dog food wet', score: 0.82 },
          ],
        },
      });
    });

    it('should limit suggestions to 8 maximum - REQ-SRCH-002', async () => {
      // Arrange
      const manySuggestions = Array.from({ length: 15 }, (_, i) => ({
        text: `suggestion ${i + 1}`,
        score: 0.9 - i * 0.05,
      }));

      mockSearchEngine.suggest.mockResolvedValue(manySuggestions.slice(0, 8));

      // Act
      const response = await request(app)
        .get('/search/autocomplete')
        .query({ q: 'dog' })
        .expect(200);

      // Assert
      expect(mockSearchEngine.suggest).toHaveBeenCalledWith({
        query: 'dog',
        limit: 8,
      });

      expect(response.body.data.suggestions).toHaveLength(8);
    });

    it('should return cached suggestions when available', async () => {
      // Arrange
      const query = 'cat food';
      const cachedSuggestions = JSON.stringify([
        { text: 'cat food', score: 0.95 },
        { text: 'cat food wet', score: 0.88 },
      ]);

      mockRedis.get.mockResolvedValue(cachedSuggestions);

      // Act
      const response = await request(app)
        .get('/search/autocomplete')
        .query({ q: query })
        .expect(200);

      // Assert - Should use cache, not call search engine
      expect(mockRedis.get).toHaveBeenCalledWith(`autocomplete:${query}`);
      expect(mockSearchEngine.suggest).not.toHaveBeenCalled();

      expect(response.body.data.suggestions).toHaveLength(2);
    });

    it('should cache suggestions for future requests', async () => {
      // Arrange
      const query = 'bird seed';
      const suggestions = [{ text: 'bird seed premium', score: 0.9 }];

      mockSearchEngine.suggest.mockResolvedValue(suggestions);
      mockRedis.get.mockResolvedValue(null); // Cache miss
      mockRedis.setex.mockResolvedValue('OK');

      // Act
      await request(app)
        .get('/search/autocomplete')
        .query({ q: query })
        .expect(200);

      // Assert - Should cache results
      expect(mockRedis.setex).toHaveBeenCalledWith(
        `autocomplete:${query}`,
        3600, // 1 hour TTL
        JSON.stringify(suggestions)
      );
    });

    it('should require minimum 2 characters for autocomplete', async () => {
      // Act & Assert
      const response = await request(app)
        .get('/search/autocomplete')
        .query({ q: 'd' })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('at least 2 characters'),
      });

      expect(mockSearchEngine.suggest).not.toHaveBeenCalled();
    });

    it('should return empty suggestions for no matches', async () => {
      // Arrange
      mockSearchEngine.suggest.mockResolvedValue([]);
      mockRedis.get.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .get('/search/autocomplete')
        .query({ q: 'xyz nonexistent' })
        .expect(200);

      // Assert
      expect(response.body.data.suggestions).toHaveLength(0);
    });
  });

  describe('GET /search/filters - Filter Options - REQ-SRCH-003', () => {
    it('should return available filter options', async () => {
      // Arrange
      mockPrisma.category.findMany.mockResolvedValue(sampleCategories);
      mockPrisma.brand.findMany.mockResolvedValue(sampleBrands);
      mockPrisma.product.findMany.mockResolvedValue(sampleProducts);

      // Act
      const response = await request(app)
        .get('/search/filters')
        .expect(200);

      // Assert
      expect(mockPrisma.category.findMany).toHaveBeenCalled();
      expect(mockPrisma.brand.findMany).toHaveBeenCalled();

      expect(response.body).toMatchObject({
        success: true,
        data: {
          categories: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              name: expect.any(String),
            }),
          ]),
          brands: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              name: expect.any(String),
            }),
          ]),
          priceRanges: expect.arrayContaining([
            expect.objectContaining({
              label: expect.any(String),
              min: expect.any(Number),
              max: expect.any(Number),
            }),
          ]),
          ratingOptions: [
            { label: '4 stars & up', value: 4 },
            { label: '3 stars & up', value: 3 },
            { label: '2 stars & up', value: 2 },
          ],
        },
      });
    });

    it('should calculate dynamic price ranges based on products', async () => {
      // Arrange
      mockPrisma.product.findMany.mockResolvedValue(sampleProducts);

      // Act
      const response = await request(app)
        .get('/search/filters')
        .expect(200);

      // Assert - Verify price ranges generated
      expect(response.body.data.priceRanges).toEqual(
        expect.arrayContaining([
          { label: '$0 - $25', min: 0, max: 25 },
          { label: '$25 - $50', min: 25, max: 50 },
          { label: '$50+', min: 50, max: null },
        ])
      );
    });

    it('should cache filter options for performance', async () => {
      // Arrange
      const cachedFilters = JSON.stringify({
        categories: sampleCategories,
        brands: sampleBrands,
      });

      mockRedis.get.mockResolvedValue(cachedFilters);

      // Act
      await request(app)
        .get('/search/filters')
        .expect(200);

      // Assert - Should use cache
      expect(mockRedis.get).toHaveBeenCalledWith('search:filters');
      expect(mockPrisma.category.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.brand.findMany).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange
      mockPrisma.product.findMany.mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act
      const response = await request(app)
        .get('/search')
        .query({ q: 'dog food' })
        .expect(500);

      // Assert
      expect(response.body).toMatchObject({
        success: false,
        error: 'Search service temporarily unavailable',
      });
    });

    it('should handle search engine failures', async () => {
      // Arrange
      mockSearchEngine.search.mockRejectedValue(
        new Error('Search index unavailable')
      );

      // Act
      const response = await request(app)
        .get('/search')
        .query({ q: 'cat toy' })
        .expect(500);

      // Assert
      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('Search service'),
      });
    });

    it('should handle Redis cache failures without breaking search', async () => {
      // Arrange
      mockRedis.get.mockRejectedValue(new Error('Redis connection lost'));
      mockSearchEngine.suggest.mockResolvedValue([
        { text: 'dog food', score: 0.9 },
      ]);

      // Act - Should still work with cache failure
      const response = await request(app)
        .get('/search/autocomplete')
        .query({ q: 'dog' })
        .expect(200);

      // Assert - Search works despite cache failure
      expect(response.body.success).toBe(true);
      expect(mockSearchEngine.suggest).toHaveBeenCalled();
    });

    it('should reject SQL injection attempts in query', async () => {
      // Arrange
      const maliciousQuery = "'; DROP TABLE products; --";

      // Act
      const response = await request(app)
        .get('/search')
        .query({ q: maliciousQuery })
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid search query'),
      });

      // Verify database not called with malicious input
      expect(mockPrisma.product.findMany).not.toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                name: expect.objectContaining({
                  contains: expect.stringContaining('DROP TABLE'),
                }),
              }),
            ]),
          }),
        })
      );
    });

    it('should handle invalid filter combinations', async () => {
      // Arrange - minPrice > maxPrice
      const response = await request(app)
        .get('/search')
        .query({ q: 'food', minPrice: 100, maxPrice: 50 })
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid price range'),
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in search query', async () => {
      // Arrange
      const specialQuery = 'dog & cat food (premium)';
      mockSearchEngine.search.mockResolvedValue({
        products: [sampleProducts[0]],
        total: 1,
        relevanceScores: {},
      });

      // Act
      const response = await request(app)
        .get('/search')
        .query({ q: specialQuery })
        .expect(200);

      // Assert - Should sanitize and search
      expect(mockSearchEngine.search).toHaveBeenCalledWith({
        query: specialQuery,
        filters: expect.any(Object),
        pagination: expect.any(Object),
        sort: expect.any(String),
      });
    });

    it('should handle very long search queries', async () => {
      // Arrange
      const longQuery = 'dog food '.repeat(50); // 450 characters

      // Act
      const response = await request(app)
        .get('/search')
        .query({ q: longQuery })
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('Query too long'),
      });
    });

    it('should handle Unicode characters in search', async () => {
      // Arrange
      const unicodeQuery = '犬の食べ物'; // Japanese for "dog food"
      mockSearchEngine.search.mockResolvedValue({
        products: [sampleProducts[0]],
        total: 1,
        relevanceScores: {},
      });

      // Act
      const response = await request(app)
        .get('/search')
        .query({ q: unicodeQuery })
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
    });

    it('should handle concurrent search requests', async () => {
      // Arrange
      mockSearchEngine.search.mockResolvedValue({
        products: [sampleProducts[0]],
        total: 1,
        relevanceScores: {},
      });

      // Act - Simulate 5 concurrent requests
      const requests = Array.from({ length: 5 }, () =>
        request(app).get('/search').query({ q: 'dog food' })
      );

      const responses = await Promise.all(requests);

      // Assert - All should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      // Verify search engine called 5 times
      expect(mockSearchEngine.search).toHaveBeenCalledTimes(5);
    });

    it('should handle whitespace-only queries', async () => {
      // Act
      const response = await request(app)
        .get('/search')
        .query({ q: '   ' })
        .expect(200);

      // Assert - Treat as empty query
      expect(response.body.data.products).toBeDefined();
    });

    it('should handle numeric-only search queries', async () => {
      // Arrange
      const numericQuery = '12345';
      mockSearchEngine.search.mockResolvedValue({
        products: [],
        total: 0,
        relevanceScores: {},
      });

      // Act
      const response = await request(app)
        .get('/search')
        .query({ q: numericQuery })
        .expect(200);

      // Assert - Should search for SKU or product ID
      expect(mockSearchEngine.search).toHaveBeenCalled();
    });
  });

  describe('Performance & Caching', () => {
    it('should cache search results for identical queries', async () => {
      // Arrange
      const query = 'popular dog food';
      const cachedResults = JSON.stringify({
        products: [sampleProducts[0]],
        total: 1,
      });

      mockRedis.get.mockResolvedValue(cachedResults);

      // Act
      const response = await request(app)
        .get('/search')
        .query({ q: query })
        .expect(200);

      // Assert - Should use cache
      expect(mockRedis.get).toHaveBeenCalled();
      expect(mockSearchEngine.search).not.toHaveBeenCalled();
      expect(response.body.data.products).toHaveLength(1);
    });

    it('should invalidate cache when filters change', async () => {
      // Arrange
      mockRedis.get.mockResolvedValue(null);
      mockSearchEngine.search.mockResolvedValue({
        products: [sampleProducts[0]],
        total: 1,
        relevanceScores: {},
      });

      // Act - First request with filters
      await request(app)
        .get('/search')
        .query({ q: 'food', categoryId: 'cat-001' })
        .expect(200);

      // Act - Second request with different filters
      await request(app)
        .get('/search')
        .query({ q: 'food', categoryId: 'cat-002' })
        .expect(200);

      // Assert - Should call search engine twice (different cache keys)
      expect(mockSearchEngine.search).toHaveBeenCalledTimes(2);
    });

    it('should track search analytics for popular queries', async () => {
      // Arrange
      const popularQuery = 'best dog food';
      mockRedis.incr.mockResolvedValue(42);

      mockSearchEngine.search.mockResolvedValue({
        products: [sampleProducts[0]],
        total: 1,
        relevanceScores: {},
      });

      // Act
      await request(app)
        .get('/search')
        .query({ q: popularQuery })
        .expect(200);

      // Assert - Should track query count
      expect(mockRedis.incr).toHaveBeenCalledWith(
        `search:analytics:${popularQuery}`
      );
    });
  });
});
