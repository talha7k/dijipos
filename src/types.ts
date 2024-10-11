export interface Restaurant {
  id: number;
  name: string;
  address?: string;
  phone_number?: string;
  created_at: Date;
}

export interface User {
  id: number;
  email: string;
  password_hash: string;
  full_name?: string;
  role: 'admin' | 'manager' | 'waiter';
  restaurant_id: number;
  created_at: Date;
}

export interface Table {
  id: number;
  table_number: string;
  restaurant_id: number;
  is_occupied: boolean;
  created_at: Date;
}

export interface ProductCategory {
  id: number;
  name: string;
  description?: string;
  restaurant_id: number;
  created_at: Date;
}

export interface Product {
  id: number;
  name_en: string;
  name_other?: string;
  description?: string;
  price: number;
  category_id: number;
  restaurant_id: number;
  is_available: boolean;
  created_at: Date;
}

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone_number?: string;
  created_at: Date;
}

export interface Order {
  id: number;
  table_id?: number;
  customer_id?: number;
  user_id?: number;
  restaurant_id: number;
  status: 'pending' | 'completed' | 'canceled';
  total_amount: number;
  created_at: Date;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  total_price: number;
  created_at: Date;
}

export interface PaymentType {
  id: number;
  name: string;
  created_at: Date;
}

export interface Payment {
  id: number;
  order_id: number;
  payment_type_id: number;
  amount: number;
  created_at: Date;
}

export interface OrderType {
  id: number;
  name: string;
  restaurant_id: number;
  created_at: Date;
}
