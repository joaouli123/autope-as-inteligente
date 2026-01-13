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

// Mock cart items
const MOCK_CART_ITEMS: CartItem[] = [
  {
    id: '1',
    name: 'Pastilha de Freio Dianteira',
    description: 'Pastilha de freio cerâmica de alta performance',
    price: 129.90,
    quantity: 2,
    brand: 'Bosch',
    partNumber: 'BN-1234',
  },
  {
    id: '2',
    name: 'Filtro de Óleo',
    description: 'Filtro de óleo lubrificante para motor',
    price: 35.50,
    quantity: 1,
    brand: 'Mann Filter',
    partNumber: 'MF-5678',
  },
  {
    id: '3',
    name: 'Vela de Ignição',
    description: 'Jogo com 4 velas de ignição',
    price: 89.90,
    quantity: 1,
    brand: 'NGK',
    partNumber: 'NGK-9012',
  },
];

// Mock orders
const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    date: '2024-01-10T10:30:00',
    status: 'delivered',
    items: [
      {
        id: '1',
        name: 'Amortecedor Dianteiro',
        description: 'Amortecedor a gás pressurizado',
        price: 289.90,
        quantity: 2,
        brand: 'Cofap',
        partNumber: 'CF-2345',
      },
    ],
    total: 579.80,
    paymentMethod: 'Cartão de Crédito',
    deliveryAddress: {
      street: 'Av. Paulista',
      number: '1000',
      complement: 'Apto 101',
      city: 'São Paulo',
      state: 'SP',
      cep: '01310-100',
    },
  },
  {
    id: 'ORD-002',
    date: '2024-01-15T14:20:00',
    status: 'shipped',
    items: [
      {
        id: '2',
        name: 'Kit de Embreagem',
        description: 'Kit completo de embreagem',
        price: 459.90,
        quantity: 1,
        brand: 'Sachs',
        partNumber: 'SC-6789',
      },
      {
        id: '3',
        name: 'Disco de Freio',
        description: 'Par de discos de freio ventilado',
        price: 199.90,
        quantity: 1,
        brand: 'Fremax',
        partNumber: 'FX-3456',
      },
    ],
    total: 659.80,
    paymentMethod: 'PIX',
    deliveryAddress: {
      street: 'Av. Paulista',
      number: '1000',
      complement: 'Apto 101',
      city: 'São Paulo',
      state: 'SP',
      cep: '01310-100',
    },
  },
  {
    id: 'ORD-003',
    date: '2024-01-08T09:15:00',
    status: 'processing',
    items: [
      {
        id: '4',
        name: 'Bateria',
        description: 'Bateria 60Ah selada',
        price: 389.90,
        quantity: 1,
        brand: 'Moura',
        partNumber: 'MR-7890',
      },
    ],
    total: 389.90,
    paymentMethod: 'Boleto',
    deliveryAddress: {
      street: 'Av. Paulista',
      number: '1000',
      complement: 'Apto 101',
      city: 'São Paulo',
      state: 'SP',
      cep: '01310-100',
    },
  },
];

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(MOCK_CART_ITEMS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);

  const addToCart = (item: CartItem) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prevItems, item];
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
      prevItems.map((item) => (item.id === itemId ? { ...item, quantity } : item))
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
      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
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
