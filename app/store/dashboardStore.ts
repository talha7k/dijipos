import { create } from 'zustand';

export type Tab = 'dashboard' | 'orders' | 'menu' | 'customers' | 'management';

export interface Order {
  id: string;
  customerName: string;
  products: Array<{ name: string; price: number; quantity: number }>;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
}

interface DashboardState {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  
  // Dashboard data
  totalRevenue: number;
  totalOrders: number;
  activeTables: number;
  newCustomers: number;

  // Orders
  orders: Order[];
  addOrder: (order: Omit<Order, 'id'>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  deleteOrder: (id: string) => void;
  updateOrder: (id: string, order: Partial<Omit<Order, 'id' | 'status'>>) => void;

  // Menu
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;

  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Dashboard data
  totalRevenue: 45231.89,
  totalOrders: 2350,
  activeTables: 15,
  newCustomers: 573,

  // Orders
  orders: [
    { id: '1', customerName: 'John Doe', total: 50.99, status: 'completed' },
    { id: '2', customerName: 'Jane Smith', total: 35.50, status: 'pending' },
    { id: '3', customerName: 'Bob Johnson', total: 75.25, status: 'cancelled' },
  ],
  addOrder: (order) => set((state) => ({
    orders: [...state.orders, { ...order, id: Date.now().toString() }]
  })),
  updateOrderStatus: (id, status) => set((state) => ({
    orders: state.orders.map(order => order.id === id ? { ...order, status } : order)
  })),
  deleteOrder: (id) => set((state) => ({
    orders: state.orders.filter(order => order.id !== id)
  })),
  updateOrder: (id, order) => set((state) => ({
    orders: state.orders.map(o => o.id === id ? { ...o, ...order } : o)
  })),

  // Menu
  menuItems: [
    { id: '1', name: 'Pizza Margherita', price: 12.99, category: 'Main Course' },
    { id: '2', name: 'Caesar Salad', price: 8.99, category: 'Appetizer' },
    { id: '3', name: 'Tiramisu', price: 6.99, category: 'Dessert' },
  ],
  addMenuItem: (item) => set((state) => ({
    menuItems: [...state.menuItems, { ...item, id: Date.now().toString() }]
  })),
  updateMenuItem: (id, item) => set((state) => ({
    menuItems: state.menuItems.map(menuItem => menuItem.id === id ? { ...menuItem, ...item } : menuItem)
  })),
  deleteMenuItem: (id) => set((state) => ({
    menuItems: state.menuItems.filter(item => item.id !== id)
  })),

  // Customers
  customers: [
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com', totalOrders: 10 },
    { id: '2', name: 'Bob Smith', email: 'bob@example.com', totalOrders: 5 },
    { id: '3', name: 'Carol Davis', email: 'carol@example.com', totalOrders: 8 },
  ],
  addCustomer: (customer) => set((state) => ({
    customers: [...state.customers, { ...customer, id: Date.now().toString() }]
  })),
  updateCustomer: (id, customer) => set((state) => ({
    customers: state.customers.map(c => c.id === id ? { ...c, ...customer } : c)
  })),
  deleteCustomer: (id) => set((state) => ({
    customers: state.customers.filter(c => c.id !== id)
  })),
}));