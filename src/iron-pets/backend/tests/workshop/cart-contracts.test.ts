import express from 'express';
import request from 'supertest';
import { validate } from '../../src/middleware/validate';
import { addItemSchema, updateItemSchema } from '../../src/modules/cart/cart.validation';

describe('Cart request validation contract', () => {
  const app = express();
  app.use(express.json());
  app.post('/items', validate(addItemSchema), (req, res) => res.json(req.body));
  app.put('/items/:id', validate(updateItemSchema), (req, res) => res.json({ id: req.params.id, ...req.body }));

  test('accepts the documented flat add-item JSON body', async () => {
    const data = { productId: 'workshop-product', quantity: 1 };
    const response = await request(app).post('/items').send(data);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(data);
  });
  test.each([0, -1, 1.5])('rejects invalid add quantity %s', async quantity => {
    const response = await request(app).post('/items').send({ productId: 'p', quantity });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
  test('validates params and body without merging namespaces', async () => {
    const response = await request(app).put('/items/cart-item').send({ quantity: 2 });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 'cart-item', quantity: 2 });
  });
  test('does not accept a nested body workaround', async () => {
    const response = await request(app).post('/items').send({ body: { productId: 'p', quantity: 1 } });
    expect(response.status).toBe(400);
  });
});
