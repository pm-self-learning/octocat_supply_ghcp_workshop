import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

export default function Cart() {
  const { cart, isLoading, removeItem, updateQuantity, clearCart } = useCart();
  const { darkMode } = useTheme();

  const handleQuantityChange = async (cartItemId: number, currentQuantity: number, delta: number) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity > 0) {
      await updateQuantity(cartItemId, newQuantity);
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    if (confirm('Remove this item from cart?')) {
      await removeItem(cartItemId);
    }
  };

  const handleClearCart = async () => {
    if (confirm('Clear all items from cart?')) {
      await clearCart();
    }
  };

  if (isLoading) {
    return (
      <div
        className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 px-4 transition-colors duration-300`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h1
              className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
            >
              Shopping Cart
            </h1>
            {cart && cart.items.length > 0 && (
              <button
                onClick={handleClearCart}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Empty cart state */}
          {(!cart || cart.items.length === 0) && (
            <div
              className={`flex flex-col items-center justify-center text-center py-20 rounded-lg ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-16 w-16 mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className={`${darkMode ? 'text-light' : 'text-gray-800'} text-xl font-medium`}>
                Your cart is empty
              </p>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                Add some products to get started!
              </p>
            </div>
          )}

          {/* Cart items */}
          {cart && cart.items.length > 0 && (
            <>
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={item.cartItemId}
                    className={`${
                      darkMode ? 'bg-gray-800' : 'bg-white'
                    } rounded-lg p-6 shadow-md transition-colors duration-300`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div
                        className={`w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden ${
                          darkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}
                      >
                        <img
                          src={`/${item.productImgName}`}
                          alt={item.productName}
                          className="w-full h-full object-contain p-2"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-grow">
                        <h3
                          className={`text-xl font-semibold ${
                            darkMode ? 'text-light' : 'text-gray-800'
                          } mb-2`}
                        >
                          {item.productName}
                        </h3>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                          {item.productDescription}
                        </p>

                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-4">
                            <div
                              className={`flex items-center space-x-3 ${
                                darkMode ? 'bg-gray-700' : 'bg-gray-200'
                              } rounded-lg p-1`}
                            >
                              <button
                                onClick={() =>
                                  handleQuantityChange(item.cartItemId, item.quantity, -1)
                                }
                                className={`w-8 h-8 flex items-center justify-center ${
                                  darkMode ? 'text-light' : 'text-gray-700'
                                } hover:text-primary transition-colors`}
                                aria-label="Decrease quantity"
                              >
                                -
                              </button>
                              <span
                                className={`${
                                  darkMode ? 'text-light' : 'text-gray-800'
                                } min-w-[2rem] text-center font-semibold`}
                              >
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(item.cartItemId, item.quantity, 1)
                                }
                                className={`w-8 h-8 flex items-center justify-center ${
                                  darkMode ? 'text-light' : 'text-gray-700'
                                } hover:text-primary transition-colors`}
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>

                            {/* Price */}
                            <div className="flex flex-col items-end">
                              <span
                                className={`${
                                  darkMode ? 'text-gray-400' : 'text-gray-600'
                                } text-sm`}
                              >
                                ${item.unitPrice.toFixed(2)} each
                              </span>
                              <span className="text-primary text-xl font-bold">
                                ${(item.quantity * item.unitPrice).toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(item.cartItemId)}
                            className="text-red-500 hover:text-red-600 transition-colors"
                            aria-label="Remove item"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div
                className={`${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                } rounded-lg p-6 shadow-md transition-colors duration-300`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-lg`}>
                      Total Items:
                    </span>
                    <span
                      className={`${darkMode ? 'text-light' : 'text-gray-800'} text-lg font-semibold`}
                    >
                      {cart.totalItems}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                    <span className={`${darkMode ? 'text-light' : 'text-gray-800'} text-2xl font-bold`}>
                      Total:
                    </span>
                    <span className="text-primary text-2xl font-bold">
                      ${cart.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
