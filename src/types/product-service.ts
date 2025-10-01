// Import enums from the main enums file
import { ProductTransactionType, CategoryType, ItemType } from "./enums";

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string; // For hierarchical categories
  type: CategoryType; // Category can be for products, services, or both
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariation {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface Item {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId?: string; // Reference to Category ID
  variations?: ProductVariation[]; // Optional variations
  itemType: ItemType;
  transactionType: ProductTransactionType; // Transaction type: sales or purchase
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface InvoiceItem {
  id: string;
  itemType: ItemType; // Type: product or service
  productId?: string;
  serviceId?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
}
