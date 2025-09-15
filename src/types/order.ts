// Import enums from the main enums file
import { TableStatus, OrderStatus, ItemType } from './enums';

export interface Table {
  id: string;
  name: string;
  capacity: number; // Number of seats
  status: TableStatus;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  type: ItemType;
  productId?: string;
  serviceId?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
}

export interface Order {
  id: string;
  organizationId: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: OrderStatus;
  paid: boolean; // Whether the order has been fully paid
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  tableId?: string;
  tableName?: string;
  orderType: string; // dine-in, take-away, delivery
  notes?: string;
  includeQR?: boolean; // Whether to include ZATCA QR code on receipt
  createdById: string; // ID of user who created the order
  createdByName: string; // Name of user who created the order
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderPayment {
  id: string;
  organizationId: string;
  orderId: string;
  amount: number;
  paymentMethod: string; // cash, card, online, etc.
  paymentDate: Date;
  reference?: string; // receipt number, transaction ID, etc.
  notes?: string;
  createdAt: Date;
}

export interface OrderType {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentType {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

