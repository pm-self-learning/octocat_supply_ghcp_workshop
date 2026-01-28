/**
 * @swagger
 * components:
 *   schemas:
 *     Cart:
 *       type: object
 *       required:
 *         - cartId
 *         - branchId
 *       properties:
 *         cartId:
 *           type: integer
 *           description: The unique identifier for the cart
 *         branchId:
 *           type: integer
 *           description: The ID of the branch that owns the cart
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the cart was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the cart was last updated
 *     CartItem:
 *       type: object
 *       required:
 *         - cartItemId
 *         - cartId
 *         - productId
 *         - quantity
 *         - unitPrice
 *       properties:
 *         cartItemId:
 *           type: integer
 *           description: The unique identifier for the cart item
 *         cartId:
 *           type: integer
 *           description: The ID of the cart this item belongs to
 *         productId:
 *           type: integer
 *           description: The ID of the product
 *         quantity:
 *           type: integer
 *           description: The quantity of this product in the cart
 *         unitPrice:
 *           type: number
 *           format: float
 *           description: The price per unit at the time of adding to cart
 *         addedAt:
 *           type: string
 *           format: date-time
 *           description: When the item was added to the cart
 *     CartWithItems:
 *       type: object
 *       properties:
 *         cartId:
 *           type: integer
 *         branchId:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         items:
 *           type: array
 *           items:
 *             allOf:
 *               - $ref: '#/components/schemas/CartItem'
 *               - type: object
 *                 properties:
 *                   productName:
 *                     type: string
 *                   productDescription:
 *                     type: string
 *                   productImgName:
 *                     type: string
 *         totalItems:
 *           type: integer
 *         totalAmount:
 *           type: number
 *           format: float
 *     AddToCartRequest:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *         - unitPrice
 *       properties:
 *         productId:
 *           type: integer
 *         quantity:
 *           type: integer
 *           minimum: 1
 *         unitPrice:
 *           type: number
 *           format: float
 *     UpdateCartItemRequest:
 *       type: object
 *       required:
 *         - quantity
 *       properties:
 *         quantity:
 *           type: integer
 *           minimum: 1
 */

export interface Cart {
  cartId: number;
  branchId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  cartItemId: number;
  cartId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  addedAt: string;
}

export interface CartItemWithProduct extends CartItem {
  productName: string;
  productDescription: string;
  productImgName: string;
}

export interface CartWithItems extends Cart {
  items: CartItemWithProduct[];
  totalItems: number;
  totalAmount: number;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
