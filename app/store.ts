import { create } from 'zustand';
import mockData from '@/mockData.json';
import {
  Restaurant, User, Table, ProductCategory, Product,
  Customer, Order, OrderItem, PaymentType, Payment, OrderType, UserCredentials
} from '../types';

interface StoreState {
  restaurants: Restaurant[];
  users: User[];
  tables: Table[];
  productCategories: ProductCategory[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
  orderItems: OrderItem[];
  paymentTypes: PaymentType[];
  payments: Payment[];
  orderTypes: OrderType[];
  currentUser: User | null;
  token: string | null;
  login: (credentials: UserCredentials) => Promise<void>;
  logout: () => void;

  // Add other methods here...
}

const convertDates = <T extends { created_at: string }>(items: T[]): (Omit<T, 'created_at'> & { created_at: Date })[] => {
  return items.map(item => ({
    ...item,
    created_at: new Date(item.created_at)
  }));
};

const useStore = create<StoreState>((set) => ({
  restaurants: convertDates(mockData.restaurants),
  users: convertDates(mockData.users) as User[],
  tables: convertDates(mockData.tables),
  productCategories: convertDates(mockData.productCategories),
  products: convertDates(mockData.products),
  customers: convertDates(mockData.customers),
  orders: convertDates(mockData.orders) as Order[],
  orderItems: convertDates(mockData.orderItems),
  paymentTypes: convertDates(mockData.paymentTypes),
  payments: convertDates(mockData.payments),
  orderTypes: convertDates(mockData.orderTypes) as OrderType[],
  currentUser: null,
  token: null,
  login: async (credentials: UserCredentials) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find user in mock data (replace this with actual API call in production)
    const user = mockData.users.find(
      u => u.email === credentials.email && u.password_hash === credentials.password
    );

    if (user) {
      const { password_hash, ...userWithoutPassword } = user;
      set({
        currentUser: {
          ...userWithoutPassword,
          created_at: new Date(userWithoutPassword.created_at)
        } as User,
        token: 'mock-jwt-token-' + Math.random().toString(36).substr(2, 9)
      });
    } else {
      throw new Error('Invalid credentials');
    }
  },

  logout: () => {
    set({ currentUser: null, token: null });
  },

  // Implement other methods here...
}));

export default useStore;
