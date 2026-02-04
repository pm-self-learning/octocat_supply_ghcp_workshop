/**
 * @swagger
 * tags:
 *   name: Carts
 *   description: API endpoints for managing shopping carts
 */

/**
 * @swagger
 * /api/carts:
 *   get:
 *     summary: Returns all carts
 *     tags: [Carts]
 *     responses:
 *       200:
 *         description: List of all carts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cart'
 *   post:
 *     summary: Create a new cart
 *     tags: [Carts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cart'
 *     responses:
 *       201:
 *         description: Cart created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *
 * /api/carts/{id}:
 *   get:
 *     summary: Get a cart by ID
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart ID
 *     responses:
 *       200:
 *         description: Cart found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       404:
 *         description: Cart not found
 *   put:
 *     summary: Update a cart
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cart'
 *     responses:
 *       200:
 *         description: Cart updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       404:
 *         description: Cart not found
 *   delete:
 *     summary: Delete a cart
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart ID
 *     responses:
 *       204:
 *         description: Cart deleted successfully
 *       404:
 *         description: Cart not found
 *
 * /api/carts/{id}/items:
 *   get:
 *     summary: Get all items in a cart
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart ID
 *     responses:
 *       200:
 *         description: List of cart items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CartItem'
 *   post:
 *     summary: Add an item to a cart
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartItem'
 *     responses:
 *       201:
 *         description: Cart item added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItem'
 *
 * /api/carts/{cartId}/items/{itemId}:
 *   put:
 *     summary: Update a cart item
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart ID
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartItem'
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItem'
 *       404:
 *         description: Cart item not found
 *   delete:
 *     summary: Remove an item from a cart
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart ID
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart Item ID
 *     responses:
 *       204:
 *         description: Cart item removed successfully
 *       404:
 *         description: Cart item not found
 */

import express from 'express';
import { Cart } from '../models/cart';
import { CartItem } from '../models/cartItem';
import { getCartsRepository } from '../repositories/cartsRepo';
import { getCartItemsRepository } from '../repositories/cartItemsRepo';
import { NotFoundError } from '../utils/errors';

const router = express.Router();

// Create a new cart
router.post('/', async (req, res, next) => {
  try {
    // Validate required fields
    const { createdDate, updatedDate, status } = req.body;
    if (!createdDate || !updatedDate || !status) {
      res.status(400).json({ error: 'Missing required fields: createdDate, updatedDate, and status are required' });
      return;
    }

    const repo = await getCartsRepository();
    const newCart = await repo.create(req.body as Omit<Cart, 'cartId'>);
    res.status(201).json(newCart);
  } catch (error) {
    next(error);
  }
});

// Get all carts
router.get('/', async (req, res, next) => {
  try {
    const repo = await getCartsRepository();
    const carts = await repo.findAll();
    res.json(carts);
  } catch (error) {
    next(error);
  }
});

// Get a cart by ID
router.get('/:id', async (req, res, next) => {
  try {
    const repo = await getCartsRepository();
    const cart = await repo.findById(parseInt(req.params.id));
    if (cart) {
      res.json(cart);
    } else {
      res.status(404).send('Cart not found');
    }
  } catch (error) {
    next(error);
  }
});

// Update a cart by ID
router.put('/:id', async (req, res, next) => {
  try {
    const repo = await getCartsRepository();
    const updatedCart = await repo.update(parseInt(req.params.id), req.body);
    res.json(updatedCart);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).send('Cart not found');
    } else {
      next(error);
    }
  }
});

// Delete a cart by ID
router.delete('/:id', async (req, res, next) => {
  try {
    const repo = await getCartsRepository();
    await repo.delete(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).send('Cart not found');
    } else {
      next(error);
    }
  }
});

// Get all items in a cart
router.get('/:id/items', async (req, res, next) => {
  try {
    const cartRepo = await getCartsRepository();
    const cart = await cartRepo.findById(parseInt(req.params.id));
    if (!cart) {
      res.status(404).send('Cart not found');
      return;
    }

    const itemsRepo = await getCartItemsRepository();
    const items = await itemsRepo.findByCartId(parseInt(req.params.id));
    res.json(items);
  } catch (error) {
    next(error);
  }
});

// Add an item to a cart
router.post('/:id/items', async (req, res, next) => {
  try {
    // Validate required fields
    const { productId, quantity, unitPrice } = req.body;
    if (!productId || !quantity || !unitPrice) {
      res.status(400).json({ error: 'Missing required fields: productId, quantity, and unitPrice are required' });
      return;
    }

    // Validate positive quantity
    if (quantity <= 0) {
      res.status(400).json({ error: 'Quantity must be greater than 0' });
      return;
    }

    const cartRepo = await getCartsRepository();
    const cart = await cartRepo.findById(parseInt(req.params.id));
    if (!cart) {
      res.status(404).send('Cart not found');
      return;
    }

    const itemsRepo = await getCartItemsRepository();
    const itemData = {
      ...req.body,
      cartId: parseInt(req.params.id),
    };
    const newItem = await itemsRepo.create(itemData as Omit<CartItem, 'cartItemId'>);
    res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
});

// Update a cart item
router.put('/:cartId/items/:itemId', async (req, res, next) => {
  try {
    const itemsRepo = await getCartItemsRepository();
    const updatedItem = await itemsRepo.update(parseInt(req.params.itemId), req.body);
    res.json(updatedItem);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).send('Cart item not found');
    } else {
      next(error);
    }
  }
});

// Delete a cart item
router.delete('/:cartId/items/:itemId', async (req, res, next) => {
  try {
    const itemsRepo = await getCartItemsRepository();
    await itemsRepo.delete(parseInt(req.params.itemId));
    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).send('Cart item not found');
    } else {
      next(error);
    }
  }
});

export default router;
