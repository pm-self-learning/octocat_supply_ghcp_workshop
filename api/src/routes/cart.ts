/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: API endpoints for managing shopping cart
 */

/**
 * @swagger
 * /api/cart/{branchId}:
 *   get:
 *     summary: Get cart for a branch with all items
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Branch ID
 *     responses:
 *       200:
 *         description: Cart with items
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartWithItems'
 *
 * /api/cart/{branchId}/items:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Branch ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddToCartRequest'
 *     responses:
 *       201:
 *         description: Item added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItem'
 *
 * /api/cart/{branchId}/items/{cartItemId}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Branch ID
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCartItemRequest'
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
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Branch ID
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart Item ID
 *     responses:
 *       204:
 *         description: Item removed successfully
 *       404:
 *         description: Cart item not found
 *
 * /api/cart/{branchId}/clear:
 *   delete:
 *     summary: Clear all items from cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Branch ID
 *     responses:
 *       204:
 *         description: Cart cleared successfully
 */

import express from 'express';
import { AddToCartRequest, UpdateCartItemRequest } from '../models/cart';
import { getCartsRepository } from '../repositories/cartsRepo';
import { NotFoundError } from '../utils/errors';

const router = express.Router();

// Get cart with items for a branch
router.get('/:branchId', async (req, res, next) => {
  try {
    const branchId = parseInt(req.params.branchId);
    const repo = await getCartsRepository();
    const cart = await repo.getCartWithItems(branchId);
    res.json(cart);
  } catch (error) {
    next(error);
  }
});

// Add item to cart
router.post('/:branchId/items', async (req, res, next) => {
  try {
    const branchId = parseInt(req.params.branchId);
    const { productId, quantity, unitPrice } = req.body as AddToCartRequest;

    // Basic validation
    if (!productId || !quantity || !unitPrice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    const repo = await getCartsRepository();
    const cartItem = await repo.addItem(branchId, productId, quantity, unitPrice);
    res.status(201).json(cartItem);
  } catch (error) {
    next(error);
  }
});

// Update cart item quantity
router.put('/:branchId/items/:cartItemId', async (req, res, next) => {
  try {
    const branchId = parseInt(req.params.branchId);
    const cartItemId = parseInt(req.params.cartItemId);
    const { quantity } = req.body as UpdateCartItemRequest;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    const repo = await getCartsRepository();
    const cartItem = await repo.updateItemQuantity(branchId, cartItemId, quantity);
    res.json(cartItem);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: 'Cart item not found' });
    } else {
      next(error);
    }
  }
});

// Remove item from cart
router.delete('/:branchId/items/:cartItemId', async (req, res, next) => {
  try {
    const branchId = parseInt(req.params.branchId);
    const cartItemId = parseInt(req.params.cartItemId);

    const repo = await getCartsRepository();
    await repo.removeItem(branchId, cartItemId);
    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: 'Cart item not found' });
    } else {
      next(error);
    }
  }
});

// Clear cart
router.delete('/:branchId/clear', async (req, res, next) => {
  try {
    const branchId = parseInt(req.params.branchId);

    const repo = await getCartsRepository();
    await repo.clearCart(branchId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
