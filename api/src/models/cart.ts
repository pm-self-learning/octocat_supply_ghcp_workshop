/**
 * @swagger
 * components:
 *   schemas:
 *     Cart:
 *       type: object
 *       required:
 *         - createdDate
 *         - updatedDate
 *       properties:
 *         cartId:
 *           type: integer
 *           description: The unique identifier for the cart (auto-generated)
 *         branchId:
 *           type: integer
 *           description: The ID of the branch that owns this cart
 *         createdDate:
 *           type: string
 *           format: date-time
 *           description: The date and time when the cart was created
 *         updatedDate:
 *           type: string
 *           format: date-time
 *           description: The date and time when the cart was last updated
 *         status:
 *           type: string
 *           description: The current status of the cart
 *           enum: [active, completed, abandoned]
 *           default: active
 */
export interface Cart {
  cartId: number;
  branchId?: number;
  createdDate: string;
  updatedDate: string;
  status: string;
}
