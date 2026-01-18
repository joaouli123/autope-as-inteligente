import React, { createContext, useState, useContext, ReactNode } from 'react';
import { CartItem, Order } from '../types/order';

interface CartContextData {
  cartItems: CartItem[];
  orders: Order[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  createOrder: (paymentMethod: string) => Order;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

const MOCK_ORDERS: Order[] = [];

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);

  const clampQuantity = (quantity: number, stock?: number) => {
    if (stock === undefined || stock === null) return quantity;
    return Math.min(quantity, stock);
  };

  const addToCart = (item: CartItem) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (item.stock_quantity !== undefined && item.stock_quantity <= 0) {
        return prevItems;
      }
      if (existingItem) {
        const newQuantity = clampQuantity(
          existingItem.quantity + item.quantity,
          item.stock_quantity ?? existingItem.stock_quantity
        );
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: newQuantity } : i
        );
      }
      return [...prevItems, { ...item, quantity: clampQuantity(item.quantity, item.stock_quantity) }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? { ...item, quantity: clampQuantity(quantity, item.stock_quantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const createOrder = (paymentMethod: string): Order => {
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString(),
      status: 'pending',
      items: [...cartItems],
      total: getCartTotal(),
      paymentMethod,
      deliveryAddress: {
        street: 'Av. Paulista',
        number: '1000',
        complement: 'Apto 101',
        city: 'São Paulo',
        state: 'SP',
        cep: '01310-100',
      },
    };
    setOrders((prevOrders) => [newOrder, ...prevOrders]);
    clearCart();
    return newOrder;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        orders,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        createOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
