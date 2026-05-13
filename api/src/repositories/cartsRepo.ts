/**
 * Repository for cart data access
 */

import { getDatabase, DatabaseConnection } from '../db/sqlite';
import { Cart, CartItem, CartItemWithProduct, CartWithItems } from '../models/cart';
import { handleDatabaseError, NotFoundError } from '../utils/errors';
import { buildInsertSQL, objectToCamelCase, mapDatabaseRows, DatabaseRow } from '../utils/sql';

export class CartsRepository {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  /**
   * Get or create cart for a branch
   */
  async getOrCreateCart(branchId: number): Promise<Cart> {
    try {
      // Try to find existing cart for branch
      const row = await this.db.get<DatabaseRow>(
        'SELECT * FROM carts WHERE branch_id = ?',
        [branchId],
      );

      if (row) {
        return objectToCamelCase<Cart>(row);
      }

      // Create new cart if none exists using INSERT OR IGNORE to handle race conditions
      await this.db.run(
        'INSERT OR IGNORE INTO carts (branch_id, created_at, updated_at) VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        [branchId],
      );

      // Fetch the cart (either just created or created by concurrent request)
      const newCart = await this.db.get<DatabaseRow>('SELECT * FROM carts WHERE branch_id = ?', [
        branchId,
      ]);

      if (!newCart) {
        throw new Error('Failed to create cart');
      }

      return objectToCamelCase<Cart>(newCart);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Get cart by ID
   */
  async findById(cartId: number): Promise<Cart | null> {
    try {
      const row = await this.db.get<DatabaseRow>('SELECT * FROM carts WHERE cart_id = ?', [
        cartId,
      ]);
      return row ? objectToCamelCase<Cart>(row) : null;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Get cart with all items and product details
   */
  async getCartWithItems(branchId: number): Promise<CartWithItems> {
    try {
      const cart = await this.getOrCreateCart(branchId);

      const itemRows = await this.db.all<DatabaseRow>(
        `SELECT 
          ci.*,
          p.name as product_name,
          p.description as product_description,
          p.img_name as product_img_name
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.product_id
        WHERE ci.cart_id = ?
        ORDER BY ci.added_at DESC`,
        [cart.cartId],
      );

      const items = mapDatabaseRows<CartItemWithProduct>(itemRows);

      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

      return {
        ...cart,
        items,
        totalItems,
        totalAmount,
      };
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Add item to cart or update quantity if already exists
   */
  async addItem(
    branchId: number,
    productId: number,
    quantity: number,
    unitPrice: number,
  ): Promise<CartItem> {
    try {
      const cart = await this.getOrCreateCart(branchId);

      // Check if item already exists in cart
      const existingItem = await this.db.get<DatabaseRow>(
        'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
        [cart.cartId, productId],
      );

      if (existingItem) {
        // Update quantity of existing item, keeping the original unit_price
        const existingItemTyped = objectToCamelCase<CartItem>(existingItem);
        const newQuantity = existingItemTyped.quantity + quantity;
        await this.db.run(
          'UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?',
          [newQuantity, existingItemTyped.cartItemId],
        );

        const updatedItem = await this.db.get<DatabaseRow>(
          'SELECT * FROM cart_items WHERE cart_item_id = ?',
          [existingItemTyped.cartItemId],
        );

        if (!updatedItem) {
          throw new Error('Failed to retrieve updated cart item');
        }

        // Update cart timestamp
        await this.updateCartTimestamp(cart.cartId);

        return objectToCamelCase<CartItem>(updatedItem);
      }

      // Add new item
      const { sql, values } = buildInsertSQL('cart_items', {
        cartId: cart.cartId,
        productId,
        quantity,
        unitPrice,
      });

      const result = await this.db.run(sql, values);

      const newItem = await this.db.get<DatabaseRow>(
        'SELECT * FROM cart_items WHERE cart_item_id = ?',
        [result.lastID],
      );

      if (!newItem) {
        throw new Error('Failed to retrieve created cart item');
      }

      // Update cart timestamp
      await this.updateCartTimestamp(cart.cartId);

      return objectToCamelCase<CartItem>(newItem);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Update cart item quantity
   */
  async updateItemQuantity(
    branchId: number,
    cartItemId: number,
    quantity: number,
  ): Promise<CartItem> {
    try {
      const cart = await this.getOrCreateCart(branchId);

      // Verify item belongs to this cart
      const item = await this.db.get<DatabaseRow>(
        'SELECT * FROM cart_items WHERE cart_item_id = ? AND cart_id = ?',
        [cartItemId, cart.cartId],
      );

      if (!item) {
        throw new NotFoundError('Cart item', cartItemId);
      }

      await this.db.run('UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?', [
        quantity,
        cartItemId,
      ]);

      const updatedItem = await this.db.get<DatabaseRow>(
        'SELECT * FROM cart_items WHERE cart_item_id = ?',
        [cartItemId],
      );

      if (!updatedItem) {
        throw new Error('Failed to retrieve updated cart item');
      }

      // Update cart timestamp
      await this.updateCartTimestamp(cart.cartId);

      return objectToCamelCase<CartItem>(updatedItem);
    } catch (error) {
      handleDatabaseError(error, 'Cart item', cartItemId);
    }
  }

  /**
   * Remove item from cart
   */
  async removeItem(branchId: number, cartItemId: number): Promise<void> {
    try {
      const cart = await this.getOrCreateCart(branchId);

      const result = await this.db.run(
        'DELETE FROM cart_items WHERE cart_item_id = ? AND cart_id = ?',
        [cartItemId, cart.cartId],
      );

      if (result.changes === 0) {
        throw new NotFoundError('Cart item', cartItemId);
      }

      // Update cart timestamp
      await this.updateCartTimestamp(cart.cartId);
    } catch (error) {
      handleDatabaseError(error, 'Cart item', cartItemId);
    }
  }

  /**
   * Clear all items from cart
   */
  async clearCart(branchId: number): Promise<void> {
    try {
      const cart = await this.getOrCreateCart(branchId);

      await this.db.run('DELETE FROM cart_items WHERE cart_id = ?', [cart.cartId]);

      // Update cart timestamp
      await this.updateCartTimestamp(cart.cartId);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Update cart's updated_at timestamp
   */
  private async updateCartTimestamp(cartId: number): Promise<void> {
    await this.db.run('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE cart_id = ?', [
      cartId,
    ]);
  }
}

// Factory function to create repository instance
export async function createCartsRepository(isTest: boolean = false): Promise<CartsRepository> {
  const db = await getDatabase(isTest);
  return new CartsRepository(db);
}

// Singleton instance for default usage
let cartsRepo: CartsRepository | null = null;

export async function getCartsRepository(isTest: boolean = false): Promise<CartsRepository> {
  const isTestEnv = isTest || process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
  if (isTestEnv) {
    // In tests, always return a fresh repository bound to the current in-memory DB
    return createCartsRepository(true);
  }
  if (!cartsRepo) {
    cartsRepo = await createCartsRepository(isTest);
  }
  return cartsRepo;
}
