/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *         - unitPrice
 *       properties:
 *         cartItemId:
 *           type: integer
 *           description: The unique identifier for the cart item (auto-generated)
 *         cartId:
 *           type: integer
 *           description: The ID of the parent cart (set automatically when adding to cart)
 *         productId:
 *           type: integer
 *           description: The ID of the product in the cart
 *         quantity:
 *           type: integer
 *           description: The quantity of products in the cart (must be greater than 0)
 *         unitPrice:
 *           type: number
 *           format: float
 *           description: The price per unit
 *         notes:
 *           type: string
 *           description: Additional notes for the cart item
 */
export interface CartItem {
  cartItemId: number;
  cartId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  notes?: string;
}
