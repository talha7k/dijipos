// Import enums from the main enums file
import { UserRole, SubscriptionStatus } from "./enums";

export interface User {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationUser {
  id: string;
  userId: string;
  organizationId: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invitation {
  id: string;
  code: string;
  organizationId: string;
  role: UserRole;
  expiresAt: Date;
  isUsed: boolean;
  usedBy?: string;
  createdAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  nameAr?: string; // Arabic company name
  email: string;
  address?: string;
  phone?: string;
  vatNumber?: string;
  logoUrl?: string; // Company logo URL
  stampUrl?: string; // Company stamp URL
  createdAt: Date;
  updatedAt: Date;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiresAt?: Date;
  createdBy?: {
    userId: string;
    name: string;
    email: string;
  };
}
