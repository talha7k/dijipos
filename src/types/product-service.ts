// Enums used by product and service types
// Enums defined locally to avoid import issues
enum CategoryType {
  PRODUCT = 'product',
  SERVICE = 'service'
}

enum ItemType {
  PRODUCT = 'product',
  SERVICE = 'service'
}

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

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId?: string; // Reference to Category ID
  variations?: ProductVariation[]; // Optional variations
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number; // total price
  categoryId?: string; // Reference to Category ID
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
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