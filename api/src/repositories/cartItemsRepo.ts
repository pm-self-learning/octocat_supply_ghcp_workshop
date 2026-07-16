/**
 * Repository for cart items data access
 */

import { getDatabase, DatabaseConnection } from '../db/sqlite';
import { CartItem } from '../models/cartItem';
import { handleDatabaseError, NotFoundError } from '../utils/errors';
import { buildInsertSQL, buildUpdateSQL, objectToCamelCase, mapDatabaseRows, DatabaseRow } from '../utils/sql';

export class CartItemsRepository {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  /**
   * Get all cart items
   */
  async findAll(): Promise<CartItem[]> {
    try {
      const rows = await this.db.all<DatabaseRow>('SELECT * FROM cart_items ORDER BY cart_item_id');
      return mapDatabaseRows<CartItem>(rows);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Get cart item by ID
   */
  async findById(id: number): Promise<CartItem | null> {
    try {
      const row = await this.db.get<DatabaseRow>('SELECT * FROM cart_items WHERE cart_item_id = ?', [id]);
      return row ? objectToCamelCase<CartItem>(row) : null;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Get cart items by cart ID
   */
  async findByCartId(cartId: number): Promise<CartItem[]> {
    try {
      const rows = await this.db.all<DatabaseRow>(
        'SELECT * FROM cart_items WHERE cart_id = ? ORDER BY cart_item_id',
        [cartId],
      );
      return mapDatabaseRows<CartItem>(rows);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Create a new cart item
   */
  async create(cartItem: Omit<CartItem, 'cartItemId'>): Promise<CartItem> {
    try {
      const { sql, values } = buildInsertSQL('cart_items', cartItem);
      const result = await this.db.run(sql, values);

      const createdCartItem = await this.findById(result.lastID || 0);
      if (!createdCartItem) {
        throw new Error('Failed to retrieve created cart item');
      }

      return createdCartItem;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Update cart item by ID
   */
  async update(id: number, cartItem: Partial<Omit<CartItem, 'cartItemId'>>): Promise<CartItem> {
    try {
      const { sql, values } = buildUpdateSQL('cart_items', cartItem, 'cart_item_id = ?');
      const result = await this.db.run(sql, [...values, id]);

      if (result.changes === 0) {
        throw new NotFoundError('CartItem', id);
      }

      const updatedCartItem = await this.findById(id);
      if (!updatedCartItem) {
        throw new Error('Failed to retrieve updated cart item');
      }

      return updatedCartItem;
    } catch (error) {
      handleDatabaseError(error, 'CartItem', id);
    }
  }

  /**
   * Delete cart item by ID
   */
  async delete(id: number): Promise<void> {
    try {
      const result = await this.db.run('DELETE FROM cart_items WHERE cart_item_id = ?', [id]);

      if (result.changes === 0) {
        throw new NotFoundError('CartItem', id);
      }
    } catch (error) {
      handleDatabaseError(error, 'CartItem', id);
    }
  }

  /**
   * Delete all cart items for a cart
   */
  async deleteByCartId(cartId: number): Promise<void> {
    try {
      await this.db.run('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Check if cart item exists
   */
  async exists(id: number): Promise<boolean> {
    try {
      const result = await this.db.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM cart_items WHERE cart_item_id = ?',
        [id],
      );
      return (result?.count || 0) > 0;
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}

// Factory function to create repository instance
export async function createCartItemsRepository(
  isTest: boolean = false,
): Promise<CartItemsRepository> {
  const db = await getDatabase(isTest);
  return new CartItemsRepository(db);
}

// Singleton instance for default usage
let cartItemsRepo: CartItemsRepository | null = null;

export async function getCartItemsRepository(isTest: boolean = false): Promise<CartItemsRepository> {
  const isTestEnv = isTest || process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
  if (isTestEnv) {
    // In tests, always return a fresh repository bound to the current in-memory DB
    return await createCartItemsRepository(isTest);
  }
  if (!cartItemsRepo) {
    cartItemsRepo = await createCartItemsRepository(isTest);
  }
  return cartItemsRepo;
}
