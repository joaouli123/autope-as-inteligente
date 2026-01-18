export interface Store {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  cnpj: string;
  logo_url?: string;
  description?: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
  };
  phone: string;
  email: string;
  opening_hours?: {
    [key: string]: { open: string; close: string };
  };
  social_media?: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
  };
  settings?: {
    notifications_enabled?: boolean;
    email_notifications?: boolean;
    return_policy?: string;
    default_delivery_days?: number;
    free_shipping_above?: number;
  };
  is_active: boolean;
  rating: number;
  average_rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  images: string[];
  category: string;
  sku: string;
  oem_codes?: string[]; // OEM reference codes
  mpn?: string; // Manufacturer Part Number
  brand?: string;
  model?: string;
  specifications?: {
    [key: string]: string;
  };
  compatible_vehicles?: string[];
  is_active: boolean;
  sales_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductCompatibility {
  id: string;
  product_id: string;
  brand: string;
  model: string;
  year_start: number;
  year_end?: number;
  engines?: string[];
  transmissions?: string[];
  fuel_types?: string[];
  valves?: number;
  notes?: string;
  created_at: string;
}

export interface UserVehicle {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  year: number;
  engine?: string;
  transmission?: string;
  fuel_type?: string;
  license_plate?: string;
  vin?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  store_id: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'delivering' | 'delivered' | 'cancelled';
  payment_method: 'credit_card' | 'pix' | 'cash';
  delivery_address: {
    name: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
  };
  status_history: {
    status: string;
    timestamp: string;
    user?: string;
  }[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf_cnpj?: string;
  is_blocked: boolean;
  orders_count: number;
  total_spent: number;
  last_purchase_at?: string;
  last_order_total?: number;
  last_order_number?: string;
  created_at: string;
}

export interface StoreReview {
  id: string;
  store_id: string;
  customer_id?: string;
  customer_name: string;
  order_id?: string;
  rating: number;
  comment?: string;
  store_response?: string;
  store_response_at?: string;
  created_at: string;
}

export interface DashboardMetrics {
  revenue_today: number;
  revenue_month: number;
  revenue_growth: number;
  pending_orders: number;
  processing_orders: number;
  active_products: number;
  low_stock_products: number;
  total_customers: number;
}
