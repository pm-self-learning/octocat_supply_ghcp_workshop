import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cartRouter from './cart';
import { runMigrations } from '../db/migrate';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { errorHandler } from '../utils/errors';

let app: express.Express;

describe('Cart API', () => {
  beforeEach(async () => {
    // Ensure a fresh in-memory database for each test
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    // Seed required foreign keys
    const db = await getDatabase();
    await db.run('INSERT INTO headquarters (headquarters_id, name) VALUES (?, ?)', [1, 'HQ One']);
    await db.run('INSERT INTO branches (branch_id, headquarters_id, name) VALUES (?, ?, ?)', [
      1,
      1,
      'Branch One',
    ]);
    await db.run('INSERT INTO suppliers (supplier_id, name) VALUES (?, ?)', [1, 'Supplier One']);
    await db.run(
      'INSERT INTO products (product_id, supplier_id, name, price, sku, unit) VALUES (?, ?, ?, ?, ?, ?)',
      [1, 1, 'Test Product', 10.0, 'SKU001', 'piece'],
    );

    // Set up express app
    app = express();
    app.use(express.json());
    app.use('/carts', cartRouter);
    // Attach error handler to translate repo errors
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should create a new cart', async () => {
    const newCart = {
      branchId: 1,
      createdDate: '2024-01-01T00:00:00Z',
      updatedDate: '2024-01-01T00:00:00Z',
      status: 'active',
    };
    const response = await request(app).post('/carts').send(newCart);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newCart);
    expect(response.body.cartId).toBeDefined();
  });

  it('should get all carts', async () => {
    const response = await request(app).get('/carts');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should get a cart by ID', async () => {
    // First create a cart to test getting it
    const newCart = {
      branchId: 1,
      createdDate: '2024-01-01T00:00:00Z',
      updatedDate: '2024-01-01T00:00:00Z',
      status: 'active',
    };
    const createResponse = await request(app).post('/carts').send(newCart);
    const cartId = createResponse.body.cartId;

    const response = await request(app).get(`/carts/${cartId}`);
    expect(response.status).toBe(200);
    expect(response.body.cartId).toBe(cartId);
  });

  it('should update a cart by ID', async () => {
    // First create a cart to test updating it
    const newCart = {
      branchId: 1,
      createdDate: '2024-01-01T00:00:00Z',
      updatedDate: '2024-01-01T00:00:00Z',
      status: 'active',
    };
    const createResponse = await request(app).post('/carts').send(newCart);
    const cartId = createResponse.body.cartId;

    const updatedCart = {
      ...newCart,
      status: 'completed',
      updatedDate: '2024-01-02T00:00:00Z',
    };
    const response = await request(app).put(`/carts/${cartId}`).send(updatedCart);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('completed');
  });

  it('should delete a cart by ID', async () => {
    // First create a cart to test deleting it
    const newCart = {
      branchId: 1,
      createdDate: '2024-01-01T00:00:00Z',
      updatedDate: '2024-01-01T00:00:00Z',
      status: 'active',
    };
    const createResponse = await request(app).post('/carts').send(newCart);
    const cartId = createResponse.body.cartId;

    const response = await request(app).delete(`/carts/${cartId}`);
    expect(response.status).toBe(204);
  });

  it('should return 404 for non-existing cart', async () => {
    const response = await request(app).get('/carts/999');
    expect(response.status).toBe(404);
  });

  it('should add an item to a cart', async () => {
    // First create a cart
    const newCart = {
      branchId: 1,
      createdDate: '2024-01-01T00:00:00Z',
      updatedDate: '2024-01-01T00:00:00Z',
      status: 'active',
    };
    const createResponse = await request(app).post('/carts').send(newCart);
    const cartId = createResponse.body.cartId;

    // Add an item to the cart
    const cartItem = {
      productId: 1,
      quantity: 2,
      unitPrice: 10.0,
      notes: 'Test item',
    };
    const response = await request(app).post(`/carts/${cartId}/items`).send(cartItem);
    expect(response.status).toBe(201);
    expect(response.body.cartId).toBe(cartId);
    expect(response.body.productId).toBe(1);
    expect(response.body.quantity).toBe(2);
  });

  it('should get all items in a cart', async () => {
    // First create a cart
    const newCart = {
      branchId: 1,
      createdDate: '2024-01-01T00:00:00Z',
      updatedDate: '2024-01-01T00:00:00Z',
      status: 'active',
    };
    const createResponse = await request(app).post('/carts').send(newCart);
    const cartId = createResponse.body.cartId;

    // Add items to the cart
    const cartItem1 = {
      productId: 1,
      quantity: 2,
      unitPrice: 10.0,
    };
    await request(app).post(`/carts/${cartId}/items`).send(cartItem1);

    const response = await request(app).get(`/carts/${cartId}/items`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
  });

  it('should update a cart item', async () => {
    // First create a cart and add an item
    const newCart = {
      branchId: 1,
      createdDate: '2024-01-01T00:00:00Z',
      updatedDate: '2024-01-01T00:00:00Z',
      status: 'active',
    };
    const createResponse = await request(app).post('/carts').send(newCart);
    const cartId = createResponse.body.cartId;

    const cartItem = {
      productId: 1,
      quantity: 2,
      unitPrice: 10.0,
    };
    const itemResponse = await request(app).post(`/carts/${cartId}/items`).send(cartItem);
    const itemId = itemResponse.body.cartItemId;

    // Update the item
    const updatedItem = {
      quantity: 5,
    };
    const response = await request(app).put(`/carts/${cartId}/items/${itemId}`).send(updatedItem);
    expect(response.status).toBe(200);
    expect(response.body.quantity).toBe(5);
  });

  it('should delete a cart item', async () => {
    // First create a cart and add an item
    const newCart = {
      branchId: 1,
      createdDate: '2024-01-01T00:00:00Z',
      updatedDate: '2024-01-01T00:00:00Z',
      status: 'active',
    };
    const createResponse = await request(app).post('/carts').send(newCart);
    const cartId = createResponse.body.cartId;

    const cartItem = {
      productId: 1,
      quantity: 2,
      unitPrice: 10.0,
    };
    const itemResponse = await request(app).post(`/carts/${cartId}/items`).send(cartItem);
    const itemId = itemResponse.body.cartItemId;

    // Delete the item
    const response = await request(app).delete(`/carts/${cartId}/items/${itemId}`);
    expect(response.status).toBe(204);
  });

  it('should return 404 when adding item to non-existing cart', async () => {
    const cartItem = {
      productId: 1,
      quantity: 2,
      unitPrice: 10.0,
    };
    const response = await request(app).post('/carts/999/items').send(cartItem);
    expect(response.status).toBe(404);
  });
});
