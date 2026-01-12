
export interface Vehicle {
  id: string;
  make: string;      // Ex: Chevrolet
  model: string;     // Ex: Onix
  year: number;      // Ex: 2020
  version?: string;  // Ex: LTZ
  engine?: string;   // Ex: 1.0, 1.4, 2.0
  valves?: string;   // Ex: 8v, 16v
  fuel?: string;     // Ex: Flex, Gasolina, Diesel
  transmission?: string; // Ex: Manual, Automático
  nickname?: string;
}

export interface Store {
  id: string;
  name: string;
  rating: number;
  address: string;
  distance: string;
  revenue?: number; // For Admin
  salesCount?: number; // For Admin
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  storeId: string;
  store?: Store; // Populated at runtime
  compatibleModels: string[]; // Simple string matching for demo
  sales?: number; // For Admin analytics
  // Specifications now support technical auto parts details
  specifications?: Record<string, string>; 
}

export interface CartItem extends Product {
  quantity: number;
}

export interface AddressData {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export type PaymentMethodType = 'credit_card_machine' | 'cash' | 'pix';

export enum OrderStatus {
  PENDING = 'PENDING',       // Processando
  CONFIRMED = 'CONFIRMED',   // Confirmado pela loja
  DELIVERING = 'DELIVERING', // Saiu para entrega
  COMPLETED = 'COMPLETED',   // Entregue
  CANCELLED = 'CANCELLED'    // Cancelado
}

export interface Order {
  id: string;
  date: string; // ISO String
  status: OrderStatus;
  items: CartItem[];
  total: number;
  shippingCost: number;
  addressSnapshot: string; // Store address at time of purchase
  paymentMethod: PaymentMethodType;
}

export type UserRole = 'CONSUMER' | 'SELLER' | 'ADMIN';

export interface UserProfile {
  name: string;
  role: UserRole;
  email?: string;
  cpfCnpj?: string;
  phone?: string;
  address?: string; // Formatted string for easy display
  addressDetails?: AddressData; // Structured data
  vehicle: Vehicle | null;
  orders: Order[]; // History of orders
  storeId?: string; // If SELLER
}

export enum ViewState {
  // Mobile Consumer Flow
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  HOME = 'HOME',
  SEARCH = 'SEARCH',
  CART = 'CART',
  PROFILE = 'PROFILE',
  PRODUCT_DETAIL = 'PRODUCT_DETAIL',
  CHECKOUT_CONFIRMATION = 'CHECKOUT_CONFIRMATION', 
  CHECKOUT_SUCCESS = 'CHECKOUT_SUCCESS',
  ORDERS = 'ORDERS',
  
  // Web/Seller Portal Flow (Separate)
  WEB_PORTAL_LOGIN = 'WEB_PORTAL_LOGIN',
  WEB_PORTAL_REGISTER = 'WEB_PORTAL_REGISTER',
  
  // Dashboard Views
  DASHBOARD_HOME = 'DASHBOARD_HOME',
  DASHBOARD_PRODUCTS = 'DASHBOARD_PRODUCTS',
  DASHBOARD_API = 'DASHBOARD_API',
  DASHBOARD_SALES = 'DASHBOARD_SALES'
}

export interface AIReponse {
  suggestedPartType: string;
  reasoning: string;
  keywords: string[];
}

export interface FilterCriteria {
  make: string;
  model: string;
  year: string;
  engine?: string;
  valves?: string;
  category: string;
  maxPrice: number;
  sortOrder: 'asc' | 'desc' | '';
  // Dynamic attributes matching Product specifications
  attributes?: Record<string, string>;
  // Toggle to force match with user vehicle
  useMyVehicle?: boolean;
}
