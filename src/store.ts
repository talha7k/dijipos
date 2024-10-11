import { create } from 'zustand';
import mockData from './mockData.json';
import {
  Restaurant, User, Table, ProductCategory, Product,
  Customer, Order, OrderItem, PaymentType, Payment, OrderType
} from './types';

// Define the store state
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

  // Add actions
  addRestaurant: (restaurant: Omit<Restaurant, 'id' | 'created_at'>) => void;
  getRestaurant: (id: number) => Restaurant | undefined;
  updateRestaurant: (id: number, updates: Partial<Omit<Restaurant, 'id' | 'created_at'>>) => void;
  deleteRestaurant: (id: number) => void;

  addUser: (user: Omit<User, 'id' | 'created_at'>) => void;
  getUser: (id: number) => User | undefined;
  updateUser: (id: number, updates: Partial<Omit<User, 'id' | 'created_at'>>) => void;
  deleteUser: (id: number) => void;

  addTable: (table: Omit<Table, 'id' | 'created_at'>) => void;
  getTable: (id: number) => Table | undefined;
  updateTable: (id: number, updates: Partial<Omit<Table, 'id' | 'created_at'>>) => void;
  deleteTable: (id: number) => void;

  addProductCategory: (category: Omit<ProductCategory, 'id' | 'created_at'>) => void;
  getProductCategory: (id: number) => ProductCategory | undefined;
  updateProductCategory: (id: number, updates: Partial<Omit<ProductCategory, 'id' | 'created_at'>>) => void;
  deleteProductCategory: (id: number) => void;

  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => void;
  getProduct: (id: number) => Product | undefined;
  updateProduct: (id: number, updates: Partial<Omit<Product, 'id' | 'created_at'>>) => void;
  deleteProduct: (id: number) => void;

  addCustomer: (customer: Omit<Customer, 'id' | 'created_at'>) => void;
  getCustomer: (id: number) => Customer | undefined;
  updateCustomer: (id: number, updates: Partial<Omit<Customer, 'id' | 'created_at'>>) => void;
  deleteCustomer: (id: number) => void;

  addOrder: (order: Omit<Order, 'id' | 'created_at'>) => void;
  getOrder: (id: number) => Order | undefined;
  updateOrder: (id: number, updates: Partial<Omit<Order, 'id' | 'created_at'>>) => void;
  deleteOrder: (id: number) => void;

  addOrderItem: (orderItem: Omit<OrderItem, 'id' | 'created_at' | 'total_price'>) => void;
  getOrderItem: (id: number) => OrderItem | undefined;
  updateOrderItem: (id: number, updates: Partial<Omit<OrderItem, 'id' | 'created_at' | 'total_price'>>) => void;
  deleteOrderItem: (id: number) => void;

  addPaymentType: (paymentType: Omit<PaymentType, 'id' | 'created_at'>) => void;
  getPaymentType: (id: number) => PaymentType | undefined;
  updatePaymentType: (id: number, updates: Partial<Omit<PaymentType, 'id' | 'created_at'>>) => void;
  deletePaymentType: (id: number) => void;

  addPayment: (payment: Omit<Payment, 'id' | 'created_at'>) => void;
  getPayment: (id: number) => Payment | undefined;
  updatePayment: (id: number, updates: Partial<Omit<Payment, 'id' | 'created_at'>>) => void;
  deletePayment: (id: number) => void;

  // Rename SalesCategory actions to OrderType actions
  addOrderType: (orderType: Omit<OrderType, 'id' | 'created_at'>) => void;
  getOrderType: (id: number) => OrderType | undefined;
  updateOrderType: (id: number, updates: Partial<Omit<OrderType, 'id' | 'created_at'>>) => void;
  deleteOrderType: (id: number) => void;
}

// Add this helper function at the top of the file, after the imports
const convertDates = <T extends { created_at: string }>(items: T[]): (Omit<T, 'created_at'> & { created_at: Date })[] => {
  return items.map(item => ({
    ...item,
    created_at: new Date(item.created_at)
  }));
};

// Create the store
const useStore = create<StoreState>((set, get) => ({
  // Initialize state with mock data, converting dates and ensuring correct types
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

  // Restaurant actions
  addRestaurant: (restaurant) =>
    set((state) => ({
      restaurants: [...state.restaurants, { ...restaurant, id: Date.now(), created_at: new Date() }],
    })),
  getRestaurant: (id) => get().restaurants.find(r => r.id === id),
  updateRestaurant: (id, updates) =>
    set((state) => ({
      restaurants: state.restaurants.map(r => r.id === id ? { ...r, ...updates } : r),
    })),
  deleteRestaurant: (id) =>
    set((state) => ({
      restaurants: state.restaurants.filter(r => r.id !== id),
    })),

  // User actions
  addUser: (user) =>
    set((state) => ({
      users: [...state.users, { ...user, id: Date.now(), created_at: new Date() }],
    })),
  getUser: (id) => get().users.find(u => u.id === id),
  updateUser: (id, updates) =>
    set((state) => ({
      users: state.users.map(u => u.id === id ? { ...u, ...updates } : u),
    })),
  deleteUser: (id) =>
    set((state) => ({
      users: state.users.filter(u => u.id !== id),
    })),

  // Table actions
  addTable: (table) =>
    set((state) => ({
      tables: [...state.tables, { ...table, id: Date.now(), created_at: new Date() }],
    })),
  getTable: (id) => get().tables.find(t => t.id === id),
  updateTable: (id, updates) =>
    set((state) => ({
      tables: state.tables.map(t => t.id === id ? { ...t, ...updates } : t),
    })),
  deleteTable: (id) =>
    set((state) => ({
      tables: state.tables.filter(t => t.id !== id),
    })),

  // ProductCategory actions
  addProductCategory: (category) =>
    set((state) => ({
      productCategories: [...state.productCategories, { ...category, id: Date.now(), created_at: new Date() }],
    })),
  getProductCategory: (id) => get().productCategories.find(pc => pc.id === id),
  updateProductCategory: (id, updates) =>
    set((state) => ({
      productCategories: state.productCategories.map(pc => pc.id === id ? { ...pc, ...updates } : pc),
    })),
  deleteProductCategory: (id) =>
    set((state) => ({
      productCategories: state.productCategories.filter(pc => pc.id !== id),
    })),

  // Product actions
  addProduct: (product) =>
    set((state) => ({
      products: [...state.products, { ...product, id: Date.now(), created_at: new Date() }],
    })),
  getProduct: (id) => get().products.find(p => p.id === id),
  updateProduct: (id, updates) =>
    set((state) => ({
      products: state.products.map(p => p.id === id ? { ...p, ...updates } : p),
    })),
  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter(p => p.id !== id),
    })),

  // Customer actions
  addCustomer: (customer) =>
    set((state) => ({
      customers: [...state.customers, { ...customer, id: Date.now(), created_at: new Date() }],
    })),
  getCustomer: (id) => get().customers.find(c => c.id === id),
  updateCustomer: (id, updates) =>
    set((state) => ({
      customers: state.customers.map(c => c.id === id ? { ...c, ...updates } : c),
    })),
  deleteCustomer: (id) =>
    set((state) => ({
      customers: state.customers.filter(c => c.id !== id),
    })),

  // Order actions
  addOrder: (order) =>
    set((state) => ({
      orders: [...state.orders, { ...order, id: Date.now(), created_at: new Date() }],
    })),
  getOrder: (id) => get().orders.find(o => o.id === id),
  updateOrder: (id, updates) =>
    set((state) => ({
      orders: state.orders.map(o => o.id === id ? { ...o, ...updates } : o),
    })),
  deleteOrder: (id) =>
    set((state) => ({
      orders: state.orders.filter(o => o.id !== id),
    })),

  // OrderItem actions
  addOrderItem: (orderItem) =>
    set((state) => ({
      orderItems: [...state.orderItems, { 
        ...orderItem, 
        id: Date.now(), 
        created_at: new Date(),
        total_price: orderItem.quantity * orderItem.price
      }],
    })),
  getOrderItem: (id) => get().orderItems.find(oi => oi.id === id),
  updateOrderItem: (id, updates) =>
    set((state) => ({
      orderItems: state.orderItems.map(oi => oi.id === id ? { 
        ...oi, 
        ...updates, 
        total_price: (updates.quantity || oi.quantity) * (updates.price || oi.price)
      } : oi),
    })),
  deleteOrderItem: (id) =>
    set((state) => ({
      orderItems: state.orderItems.filter(oi => oi.id !== id),
    })),

  // PaymentType actions
  addPaymentType: (paymentType) =>
    set((state) => ({
      paymentTypes: [...state.paymentTypes, { ...paymentType, id: Date.now(), created_at: new Date() }],
    })),
  getPaymentType: (id) => get().paymentTypes.find(pt => pt.id === id),
  updatePaymentType: (id, updates) =>
    set((state) => ({
      paymentTypes: state.paymentTypes.map(pt => pt.id === id ? { ...pt, ...updates } : pt),
    })),
  deletePaymentType: (id) =>
    set((state) => ({
      paymentTypes: state.paymentTypes.filter(pt => pt.id !== id),
    })),

  // Payment actions
  addPayment: (payment) =>
    set((state) => ({
      payments: [...state.payments, { ...payment, id: Date.now(), created_at: new Date() }],
    })),
  getPayment: (id) => get().payments.find(p => p.id === id),
  updatePayment: (id, updates) =>
    set((state) => ({
      payments: state.payments.map(p => p.id === id ? { ...p, ...updates } : p),
    })),
  deletePayment: (id) =>
    set((state) => ({
      payments: state.payments.filter(p => p.id !== id),
    })),

  // Rename SalesCategory actions to OrderType actions
  addOrderType: (orderType) =>
    set((state) => ({
      orderTypes: [...state.orderTypes, { ...orderType, id: Date.now(), created_at: new Date() }],
    })),
  getOrderType: (id) => get().orderTypes.find(ot => ot.id === id),
  updateOrderType: (id, updates) =>
    set((state) => ({
      orderTypes: state.orderTypes.map(ot => ot.id === id ? { ...ot, ...updates } : ot),
    })),
  deleteOrderType: (id) =>
    set((state) => ({
      orderTypes: state.orderTypes.filter(ot => ot.id !== id),
    })),
}));

export default useStore;