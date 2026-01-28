import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { api } from '../api/config';

// Branch ID is hardcoded to 1 as per requirements
const BRANCH_ID = 1;

export interface CartItem {
  cartItemId: number;
  cartId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  addedAt: string;
  productName: string;
  productDescription: string;
  productImgName: string;
}

export interface Cart {
  cartId: number;
  branchId: number;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

interface CartContextType {
  cart: Cart | undefined;
  isLoading: boolean;
  error: unknown;
  addToCart: (productId: number, quantity: number, unitPrice: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

const fetchCart = async (): Promise<Cart> => {
  const { data } = await axios.get(`${api.baseURL}/api/cart/${BRANCH_ID}`);
  return data;
};

export function CartProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: cart, isLoading, error } = useQuery<Cart>('cart', fetchCart, {
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  const addToCartMutation = useMutation(
    async ({ productId, quantity, unitPrice }: { productId: number; quantity: number; unitPrice: number }) => {
      await axios.post(`${api.baseURL}/api/cart/${BRANCH_ID}/items`, {
        productId,
        quantity,
        unitPrice,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
      },
    }
  );

  const updateQuantityMutation = useMutation(
    async ({ cartItemId, quantity }: { cartItemId: number; quantity: number }) => {
      await axios.put(`${api.baseURL}/api/cart/${BRANCH_ID}/items/${cartItemId}`, {
        quantity,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
      },
    }
  );

  const removeItemMutation = useMutation(
    async (cartItemId: number) => {
      await axios.delete(`${api.baseURL}/api/cart/${BRANCH_ID}/items/${cartItemId}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
      },
    }
  );

  const clearCartMutation = useMutation(
    async () => {
      await axios.delete(`${api.baseURL}/api/cart/${BRANCH_ID}/clear`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
      },
    }
  );

  const addToCart = async (productId: number, quantity: number, unitPrice: number) => {
    await addToCartMutation.mutateAsync({ productId, quantity, unitPrice });
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    await updateQuantityMutation.mutateAsync({ cartItemId, quantity });
  };

  const removeItem = async (cartItemId: number) => {
    await removeItemMutation.mutateAsync(cartItemId);
  };

  const clearCart = async () => {
    await clearCartMutation.mutateAsync();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        error,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
