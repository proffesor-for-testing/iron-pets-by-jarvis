import request from 'supertest';

// Keep the real application/router/controller stack; replace database IO only.
jest.mock('@prisma/client', () => {
  const actual = jest.requireActual('@prisma/client');
  return { ...actual, PrismaClient: jest.fn(() => ({
    product: { findMany: jest.fn(async () => []), count: jest.fn(async () => 0) },
    category: { findMany: jest.fn(async () => []) },
    brand: { findMany: jest.fn(async () => []) },
  })) };
});

import { createApp } from '../../src/app';

describe('Workshop HTTP contracts (database IO mocked)', () => {
  const app = createApp();
  for (const path of ['/api/products', '/api/categories', '/api/brands',
    '/api/v1/products', '/api/v1/categories', '/api/v1/catalog/products']) {
    test(`serves the documented catalog route ${path}`, async () => {
      const response = await request(app).get(path);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  }

  test('reports invalid registration as a client validation error', async () => {
    const response = await request(app).post('/api/auth/register').send({
      email: '', password: 'short', firstName: 'Test', lastName: 'User',
    });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: 'email' }),
    ]));
  });
});

