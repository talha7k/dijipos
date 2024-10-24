import { Timestamp } from 'firebase/firestore';

export interface Business {
  id: string;
  type_business: 'restaurant' | 'shop';  // type attribute in snake_case
  name: string;
  contact: ContactInfo;
  timezone: string;
  currency: string;
  language: string; // Restaurant's default language
  created_by: User;
  created_at: Timestamp;
}

export interface User {
  id: string;
  email: string;
  business_id: string;
  password_hash: string;
  full_name: string;
  role_user: 'admin' | 'manager' | 'cashier';
  is_active: boolean;
  created_at: Timestamp;
  // Changed from business_ids: number[]
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Table {
  id: string;
  table_number: string;
  is_occupied: boolean;
  is_reserved: boolean; // To track reserved tables
  capacity: number; // Number of seats
  created_at: Timestamp;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string| null;
  image: string;
  is_visible: boolean; // Visibility toggle
  sort_order: number; // Sorting in the UI
  created_by: User;
  created_at: Timestamp;
}

export interface Product {
  id: string;
  name_en: string;
  name_other: string;
  description: string;
  sku: string| null; // barcode support
  price: number;
  modifiers: string[]| null; // Custom modifiers like spicy, regular, roasted
  category_product: ProductCategory; // type attribute in snake_case
  is_available: boolean;
  is_tax_inclusive: boolean;
  created_at: Timestamp;
  image: string;
  created_by: User;
}

export interface Customer {
  id: string;
  name: string;
  contact: ContactInfo;
  loyalty_points: number; // Loyalty program points
  language_preference: string; // Preferred language for communication
  created_by: User;
  created_at: Timestamp;
}

export interface Order {
  id: string;
  table: Table | null;
  customer: Customer | null;
  created_by: User;
  items: OrderItem[];
  discount_amount: number ;
  discount_type: DiscountType; // Type of discount
  tax_amount: number;
  tax_rate: TaxRate; // Tax percentage rate
  status_order: 'waiting' | 'completed' | 'canceled' | 'in_progress'; // Expanded statuses, type attribute in snake_case
  order_type: OrderType; // Order type support
  payment_status: 'paid' | 'unpaid' | 'partially_paid'; // Payment status
  created_at: Timestamp;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product: Product;
  name: string;
  quantity: number;
  price: number;
  special_instructions: string;
}

export interface DiscountType {
  id: string;
  name: string;
  created_at: Timestamp;
  created_by: User;
}

export interface TaxRate {
  id: string;
  percentage: number;
  created_at: Timestamp;
  created_by: User;
}

export interface PaymentType {
  id: string;
  name: string;
  created_at: Timestamp;
  created_by: User;
}

export interface Payment {
  id: string;
  order_id: string;
  payment_type_id: string; // type attribute in snake_case
  amount: number;
  created_at: Timestamp;
  created_by: User;
}

export interface OrderType {
  id: string;
  name: string;
  created_at: Timestamp;
  created_by: User;
}

export interface Inventory {
  id: string;
  product: Product| null;
  name: string;
  quantity_in_stock: number;
  unit_of_measure: 'grams' | 'ml' | 'pieces';
  reorder_level: number;
  last_restocked_at: Timestamp| null;
  expiry_date: Timestamp | 'non-perishable';
  created_at: Timestamp;
  created_by: User;
}

export interface PurchaseOrder {
  id: string; // Unique identifier
  supplier: Supplier; // Reference to Supplier
  items: PurchaseOrderItem[]; // List of items purchased
  total_amount: number; // Total cost of the order
  order_status: 'waiting' | 'received' | 'canceled'; // Status of the order
  created_at: Timestamp; // Date when the order was placed
  received_at: Timestamp| null; // Date when the order was received (if applicable)
  created_by: User;
}

export interface PurchaseOrderItem {
  id: string; // Unique identifier
  inventory: Inventory; // Reference to Product (for retail)
  quantity_ordered: number; // Quantity ordered
  unit_price: number; // Price per unit
  total_price: number; // Total cost for this item (quantity * unit_price)
}

export interface Supplier {
  id: string; // Unique identifier
  name: string; // Supplier name
  contact: ContactInfo; // Supplier contact details (phone, email)
  store_location_id: string | null; // Optional: associated store
  created_at: Timestamp; // Date the supplier was added
  created_by: User;
}

export interface StockMovement {
  id: string; // Unique identifier for the stock movement record
  inventory: Inventory; // Optional: Reference to the Product (for retail)
  movement_type: 'adjustment' | 'sale' | 'return' | 'transfer'; // Type of stock movement
  quantity: number; // Quantity affected by the movement
  reason: string; // Optional: Reason for adjustment (e.g., "correction", "damage", "sale")
  created_at: Timestamp; // Date and time of the movement
  created_by: User;
  purchase_order: PurchaseOrder| null; // Optional: Reference to an order related to the transaction
}

export interface ContactInfo {
  phone: string; // Optional phone number
  email: string; // Optional email address
  address: string; // Optional address
}

export interface SASSubscription {
  id: string; // Unique identifier for the subscription
  business: Business;
  plan_id: string; // Reference to the pricing plan
  start_date: Timestamp; // Date when the subscription starts
  end_date: Timestamp| null; // Date when the subscription ends (optional for ongoing)
  status_subscription: 'active' | 'canceled' | 'suspended'; // Subscription status, type attribute in snake_case
  created_at: Timestamp; // Date when the subscription was created
}

// Represents a pricing plan
export interface SASPricingPlan {
  id: string; // Unique identifier for the pricing plan
  name: string; // Name of the plan (e.g., "Basic", "Premium")
  description: string; // Description of the plan
  price: number; // Monthly price of the plan
  billing_cycle: 'monthly' | 'half-year' | 'yearly'; // Billing cycle
  features: string[]; // List of features included in the plan
  created_at: Timestamp; // Date when the plan was created
}

// Represents a payment method
export interface SASPaymentType {
  id: string; // Unique identifier for the payment method
  type_payment: 'credit_card' | 'stcpay' | 'bank_transfer'; // type attribute in snake_case
  is_default: boolean; // Indicates if this is the default payment method
  created_at: Timestamp; // Date when the payment method was added
}

// Represents a transaction record
export interface SASTransaction {
  id: string; // Unique identifier for the transaction
  business: Business;
  amount: number; // Amount of the transaction
  payment_type: SASPaymentType; // Reference to the payment method used
  status_transaction: 'completed' | 'failed' | 'pending'; // Transaction status
  created_at: Timestamp; // Date when the transaction was created
}
