export interface Customer {
  id: string;
  name: string;
  nameAr?: string; // Arabic customer name
  email: string;
  address?: string;
  phone?: string;
  vatNumber?: string;
  logoUrl?: string; // Customer logo URL
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  nameAr?: string; // Arabic supplier name
  email: string;
  address?: string;
  phone?: string;
  vatNumber?: string;
  contactPerson?: string;
  logoUrl?: string; // Supplier logo URL
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}