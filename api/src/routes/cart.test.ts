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
    await db.run(
      'INSERT INTO branches (branch_id, headquarters_id, name, description, address, contact_person, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [1, 1, 'Branch One', 'Test branch', '123 Test St', 'Test Person', 'test@test.com', '555-0000'],
    );
    await db.run('INSERT INTO suppliers (supplier_id, name) VALUES (?, ?)', [1, 'Supplier One']);
    await db.run(
      'INSERT INTO products (product_id, supplier_id, name, description, price, sku, unit, img_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [1, 1, 'Test Product', 'A test product', 99.99, 'TEST-001', 'unit', 'test.png'],
    );

    // Set up express app
    app = express();
    app.use(express.json());
    app.use('/cart', cartRouter);
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should get or create an empty cart for a branch', async () => {
    const response = await request(app).get('/cart/1');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      branchId: 1,
      items: [],
      totalItems: 0,
      totalAmount: 0,
    });
    expect(response.body.cartId).toBeDefined();
  });

  it('should add an item to cart', async () => {
    const response = await request(app).post('/cart/1/items').send({
      productId: 1,
      quantity: 2,
      unitPrice: 99.99,
    });
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      productId: 1,
      quantity: 2,
      unitPrice: 99.99,
    });
    expect(response.body.cartItemId).toBeDefined();
  });

  it('should merge quantities when adding the same product twice', async () => {
    // Add product first time
    await request(app).post('/cart/1/items').send({
      productId: 1,
      quantity: 2,
      unitPrice: 99.99,
    });

    // Add same product again
    await request(app).post('/cart/1/items').send({
      productId: 1,
      quantity: 3,
      unitPrice: 89.99, // Different price
    });

    // Check cart
    const response = await request(app).get('/cart/1');
    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].quantity).toBe(5); // 2 + 3
    expect(response.body.items[0].unitPrice).toBe(99.99); // Original price preserved
    expect(response.body.totalItems).toBe(5);
  });

  it('should update cart item quantity', async () => {
    // Add item first
    const addResponse = await request(app).post('/cart/1/items').send({
      productId: 1,
      quantity: 2,
      unitPrice: 99.99,
    });
    const cartItemId = addResponse.body.cartItemId;

    // Update quantity
    const response = await request(app).put(`/cart/1/items/${cartItemId}`).send({
      quantity: 5,
    });
    expect(response.status).toBe(200);
    expect(response.body.quantity).toBe(5);
  });

  it('should remove an item from cart', async () => {
    // Add item first
    const addResponse = await request(app).post('/cart/1/items').send({
      productId: 1,
      quantity: 2,
      unitPrice: 99.99,
    });
    const cartItemId = addResponse.body.cartItemId;

    // Remove item
    const response = await request(app).delete(`/cart/1/items/${cartItemId}`);
    expect(response.status).toBe(204);

    // Verify cart is empty
    const cartResponse = await request(app).get('/cart/1');
    expect(cartResponse.body.items).toHaveLength(0);
  });

  it('should clear all items from cart', async () => {
    // Add multiple items
    await request(app).post('/cart/1/items').send({
      productId: 1,
      quantity: 2,
      unitPrice: 99.99,
    });

    // Clear cart
    const response = await request(app).delete('/cart/1/clear');
    expect(response.status).toBe(204);

    // Verify cart is empty
    const cartResponse = await request(app).get('/cart/1');
    expect(cartResponse.body.items).toHaveLength(0);
    expect(cartResponse.body.totalItems).toBe(0);
  });

  it('should return 400 for invalid branch ID', async () => {
    const response = await request(app).get('/cart/invalid');
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid branch ID');
  });

  it('should return 400 for invalid cart item ID', async () => {
    const response = await request(app).put('/cart/1/items/invalid').send({
      quantity: 5,
    });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid branch ID or cart item ID');
  });

  it('should return 400 for missing required fields', async () => {
    const response = await request(app).post('/cart/1/items').send({
      productId: 1,
      // Missing quantity and unitPrice
    });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Missing required fields');
  });

  it('should return 400 for invalid quantity', async () => {
    const response = await request(app).post('/cart/1/items').send({
      productId: 1,
      quantity: 0,
      unitPrice: 99.99,
    });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Quantity must be greater than 0');
  });

  it('should return 404 for non-existing cart item', async () => {
    const response = await request(app).delete('/cart/1/items/999');
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Cart item not found');
  });

  it('should calculate correct totals with multiple items', async () => {
    // Add first item
    await request(app).post('/cart/1/items').send({
      productId: 1,
      quantity: 2,
      unitPrice: 50.0,
    });

    // Check cart totals
    const response = await request(app).get('/cart/1');
    expect(response.status).toBe(200);
    expect(response.body.totalItems).toBe(2);
    expect(response.body.totalAmount).toBe(100.0);
  });

  it('should include product details in cart items', async () => {
    // Add item
    await request(app).post('/cart/1/items').send({
      productId: 1,
      quantity: 1,
      unitPrice: 99.99,
    });

    // Get cart
    const response = await request(app).get('/cart/1');
    expect(response.status).toBe(200);
    expect(response.body.items[0]).toMatchObject({
      productName: 'Test Product',
      productDescription: 'A test product',
      productImgName: 'test.png',
    });
  });
});
