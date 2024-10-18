import { create } from 'zustand';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Product, Order, OrderType, OrderItem, ProductCategory, Customer, PaymentType, Inventory, PurchaseOrder, Supplier, StockMovement, User } from './types';

interface AppState {
  productCategories: ProductCategory[];
  products: Product[];
  currentOrder: OrderItem[];
  orders: Order[];
  orderTypes: OrderType[];
  customers: Customer[];
  paymentTypes: PaymentType[];
  inventory: Inventory[];
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
  stockMovements: StockMovement[];
  currentUser: User | null;

  setCurrentUser: (user: User | null) => void;

  fetchOrderTypes: () => Promise<void>;
  addOrderType: (orderType: Omit<OrderType, 'id' | 'created_at'>) => Promise<void>;
  updateOrderType: (orderType: OrderType) => Promise<void>;
  deleteOrderType: (id: string) => Promise<void>;

  fetchProductCategories: () => Promise<void>;
  addProductCategory: (productCategory: Omit<ProductCategory, 'id' | 'created_at' | 'created_by' | 'business_id'>) => Promise<void>;
  updateProductCategory: (productCategory: ProductCategory) => Promise<void>;
  deleteProductCategory: (id: string) => Promise<void>;
  
  fetchPaymentTypes: () => Promise<void>;
  addPaymentType: (paymentType: Omit<PaymentType, 'id' | 'created_at'>) => Promise<void>;
  updatePaymentType: (paymentType: PaymentType) => Promise<void>;
  deletePaymentType: (id: string) => Promise<void>;

  fetchOrders: () => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'created_at' | 'created_by' | 'business_id'>) => void;
  updateOrder: (order: Order) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;

  addToOrder: (item: Omit<OrderItem, 'id' | 'order_id'>) => void;
  removeFromOrder: (id: string) => void;
  clearOrder: () => void;

  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'created_by' | 'business_id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  fetchCustomers: () => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'created_by' | 'business_id'>) => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  fetchInventory: () => Promise<void>;
  addInventoryItem: (item: Omit<Inventory, 'id' | 'created_at' | 'created_by'>) => Promise<void>;
  updateInventoryItem: (item: Inventory) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;

  fetchPurchaseOrders: () => Promise<void>;
  addPurchaseOrder: (order: Omit<PurchaseOrder, 'id' | 'created_at' | 'created_by' | 'business_id'>) => Promise<void>;
  updatePurchaseOrder: (order: PurchaseOrder) => Promise<void>;
  deletePurchaseOrder: (id: string) => Promise<void>;

  fetchSuppliers: () => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'created_at' | 'created_by' | 'business_id'>) => Promise<void>;
  updateSupplier: (supplier: Supplier) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;

  fetchStockMovements: () => Promise<void>;
  addStockMovement: (movement: Omit<StockMovement, 'id' | 'created_at'>) => Promise<void>;
  updateStockMovement: (movement: StockMovement) => Promise<void>;
  deleteStockMovement: (id: string) => Promise<void>;

}

export const useAppStore = create<AppState>((set, get) => ({
  productCategories: [],
  products: [],
  currentOrder: [],
  orders: [],
  orderTypes: [],
  customers: [],
  paymentTypes: [],
  inventory: [],
  purchaseOrders: [],
  suppliers: [],
  stockMovements: [],

  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),

  fetchProductCategories: async () => {
    const querySnapshot = await getDocs(collection(db, 'productCategories'));
    const productCategories = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ProductCategory));
    set({ productCategories });
  },

  addProductCategory: async (productCategory: Omit<ProductCategory, 'id' | 'created_at' | 'created_by' | 'business_id'>) => {
    const currentUser = get().currentUser;
    if (!currentUser) throw new Error("No user logged in");

    const docRef = await addDoc(collection(db, 'productCategories'), {
      ...productCategory,
      business_id: currentUser.business_id,
      created_by: currentUser,
      created_at: Timestamp.fromDate(new Date())
    });
    set((state) => ({ 
      productCategories: [...state.productCategories, { 
        ...productCategory, 
        id: docRef.id, 
        business_id: currentUser.business_id,
        created_by: currentUser, 
        created_at: Timestamp.fromDate(new Date()) 
      }] 
    }));
  },

  updateProductCategory: async (productCategory) => {
    const { id, ...updateData } = productCategory;
    await updateDoc(doc(db, 'productCategories', id), updateData);
    set((state) => ({
      productCategories: state.productCategories.map((p) => (p.id === id ? productCategory : p)),
    }));
  },

  deleteProductCategory: async (id: string) => {
    await deleteDoc(doc(db, 'productCategories', id));
    set((state) => ({
      productCategories: state.productCategories.filter((p) => p.id !== id),
    }));
  },

  fetchOrderTypes: async () => {
    const querySnapshot = await getDocs(collection(db, 'orderTypes'));
    const orderTypes = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as OrderType));
    set({ orderTypes });
  },

  addOrderType: async (orderType) => {
    const currentUser = get().currentUser;
    if (!currentUser) throw new Error("No user logged in");
    const docRef = await addDoc(collection(db, 'orderTypes'), {
      ...orderType,
      business_id: currentUser.business_id || '',  // Use empty string instead of null
      created_by: currentUser,
      created_at: Timestamp.fromDate(new Date())
    });
    set((state) => ({ 
      orderTypes: [...state.orderTypes, { 
        ...orderType, 
        id: docRef.id, 
        business_id: currentUser.business_id || '',  // Use empty string instead of null
        created_by: currentUser, 
        created_at: Timestamp.fromDate(new Date()) 
      }] 
    }));
  },

  updateOrderType: async (orderType) => {
    const { id, ...updateData } = orderType;
    await updateDoc(doc(db, 'orderTypes', id), updateData);
    set((state) => ({
      orderTypes: state.orderTypes.map((o) => (o.id === id ? orderType : o)),
    }));
  },

  deleteOrderType: async (id: string) => {
    await deleteDoc(doc(db, 'orderTypes', id));
    set((state) => ({
      orderTypes: state.orderTypes.filter((o) => o.id !== id),
    }));
  },

  fetchOrders: async () => {
    const querySnapshot = await getDocs(collection(db, 'orders'));
    const orders = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
    set({ orders });
  },

  addOrder: async (order: Omit<Order, 'id' | 'created_at' | 'created_by' | 'business_id'>) => {
    const currentUser = get().currentUser;
    if (!currentUser) throw new Error("No user logged in");

    const docRef = await addDoc(collection(db, 'orders'), {
      ...order,
      business_id: currentUser.business_id,
      created_by: currentUser,
      created_at: Timestamp.fromDate(new Date())
    });
    set((state) => ({ 
      orders: [...state.orders, { 
        ...order, 
        id: docRef.id, 
        business_id: currentUser.business_id,
        created_by: currentUser, 
        created_at: Timestamp.fromDate(new Date()) 
      }] 
    }));
  },

  updateOrder: async (order) => {
    const { id, ...updateData } = order;
    await updateDoc(doc(db, 'orders', id), updateData);
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? order : o)),
    }));
  },

  deleteOrder: async (id: string) => {
    await deleteDoc(doc(db, 'orders', id));
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== id),
    }));
  },

  removeFromOrder: (id: string) => set((state) => ({
    currentOrder: state.currentOrder.filter((item) => item.id !== id),
  })),

  addToOrder: (item: Omit<OrderItem, 'id' | 'order_id'>) => set((state) => ({
    currentOrder: [...state.currentOrder, { 
      ...item, 
      id: Date.now().toString(), 
      order_id: '0', // This will be set when the order is completed
    }],
  })),  

  clearOrder: () => set({ currentOrder: [] }),

  fetchProducts: async () => {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const products = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
    set({ products });
  },

  addProduct: async (product: Omit<Product, 'id' | 'created_at' | 'created_by' | 'business_id'>) => {
    const currentUser = get().currentUser;
    if (!currentUser) throw new Error("No user logged in");

    const docRef = await addDoc(collection(db, 'products'), {
      ...product,
      business_id: currentUser.business_id,
      created_by: currentUser,
      created_at: Timestamp.fromDate(new Date())
    });
    const newProduct: Product = {
      ...product,
      id: docRef.id,
      business_id: currentUser.business_id,
      created_by: currentUser,
      created_at: Timestamp.fromDate(new Date())
    };
    set((state) => ({ products: [...state.products, newProduct] }));
  },

  updateProduct: async (product) => {
    const { id, ...updateData } = product;
    await updateDoc(doc(db, 'products', id), updateData);
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? product : p)),
    }));
  },

  deleteProduct: async (id) => {
    await deleteDoc(doc(db, 'products', id));
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }));
  },

  fetchCustomers: async () => {
    const querySnapshot = await getDocs(collection(db, 'customers'));
    const customers = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Customer));
    set({ customers });
  },

  addCustomer: async (customer: Omit<Customer, 'id' | 'created_at' | 'created_by' | 'business_id'>) => {
    const currentUser = get().currentUser;
    if (!currentUser) throw new Error("No user logged in");

    const docRef = await addDoc(collection(db, 'customers'), {
      ...customer,
      business_id: currentUser.business_id,
      created_by: currentUser,
      created_at: Timestamp.fromDate(new Date())
    });
    set((state) => ({ 
      customers: [...state.customers, { 
        ...customer, 
        id: docRef.id, 
        business_id: currentUser.business_id,
        created_by: currentUser, 
        created_at: Timestamp.fromDate(new Date()) 
      }] 
    }));
  },

  updateCustomer: async (customer) => {
    const { id, ...updateData } = customer;
    await updateDoc(doc(db, 'customers', id), updateData);
    set((state) => ({
      customers: state.customers.map((c) => (c.id === id ? customer : c)),
    }));
  },

  deleteCustomer: async (id: string) => {
    await deleteDoc(doc(db, 'customers', id));
    set((state) => ({
      customers: state.customers.filter((c) => c.id !== id),
    }));
  },

  fetchPaymentTypes: async () => {
    const querySnapshot = await getDocs(collection(db, 'paymentTypes'));
    const paymentTypes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentType));
    set({ paymentTypes });
  },

  addPaymentType: async (paymentType) => {
    const docRef = await addDoc(collection(db, 'paymentTypes'), {
      ...paymentType,
      created_at: Timestamp.fromDate(new Date())
    });
    set((state) => ({ paymentTypes: [...state.paymentTypes, { ...paymentType, id: docRef.id, created_at: Timestamp.fromDate(new Date()) }] }));
  },

  updatePaymentType: async (paymentType) => {
    const { id, ...updateData } = paymentType;
    await updateDoc(doc(db, 'paymentTypes', id), updateData);
    set((state) => ({
      paymentTypes: state.paymentTypes.map((p) => (p.id === id ? paymentType : p)),
    }));
  },

  deletePaymentType: async (id: string) => {
    await deleteDoc(doc(db, 'paymentTypes', id));
    set((state) => ({
      paymentTypes: state.paymentTypes.filter((p) => p.id !== id),
    }));
  },

  fetchInventory: async () => {
    const querySnapshot = await getDocs(collection(db, 'inventory'));
    const inventory = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inventory));
    set({ inventory });
  },

  addInventoryItem: async (item: Omit<Inventory, 'id' | 'created_at' | 'created_by'>) => {
    const currentUser = get().currentUser;
    if (!currentUser) throw new Error("No user logged in");
    const docRef = await addDoc(collection(db, 'inventory'), {
      ...item,
      created_by: currentUser,
      created_at: Timestamp.fromDate(new Date())
    });
    set((state) => ({ 
      inventory: [...state.inventory, { 
        ...item, 
        id: docRef.id, 
        created_by: currentUser, 
        created_at: Timestamp.fromDate(new Date()) 
      }] 
    }));
  },

  updateInventoryItem: async (item: Inventory) => {
    const { id, created_at, created_by, ...updateData } = item;
    await updateDoc(doc(db, 'inventory', id), updateData);
    set((state) => ({
      inventory: state.inventory.map((i) => (i.id === id ? item : i)),
    }));
  },

  deleteInventoryItem: async (id: string) => {
    await deleteDoc(doc(db, 'inventory', id));
    set((state) => ({
      inventory: state.inventory.filter((i) => i.id !== id),
    }));
  },

  fetchPurchaseOrders: async () => {
    const querySnapshot = await getDocs(collection(db, 'purchaseOrders'));
    const purchaseOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PurchaseOrder));
    set({ purchaseOrders });
  },

  addPurchaseOrder: async (order: Omit<PurchaseOrder, 'id' | 'created_at' | 'created_by' | 'business_id'>) => {
    const currentUser = get().currentUser;
    if (!currentUser) throw new Error("No user logged in");

    const docRef = await addDoc(collection(db, 'purchaseOrders'), {
      ...order,
      business_id: currentUser.business_id,
      created_by: currentUser,
      created_at: Timestamp.fromDate(new Date()),
      ordered_at: Timestamp.fromDate(new Date())
    });
    set((state) => ({ 
      purchaseOrders: [...state.purchaseOrders, { 
        ...order, 
        id: docRef.id, 
        business_id: currentUser.business_id,
        created_by: currentUser, 
        created_at: Timestamp.fromDate(new Date()),
        ordered_at: Timestamp.fromDate(new Date())
      }] 
    }));
  },

  updatePurchaseOrder: async (order) => {
    const { id, ...updateData } = order;
    await updateDoc(doc(db, 'purchaseOrders', id), updateData);
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((o) => (o.id === id ? order : o)),
    }));
  },

  deletePurchaseOrder: async (id: string) => {
    await deleteDoc(doc(db, 'purchaseOrders', id));
    set((state) => ({
      purchaseOrders: state.purchaseOrders.filter((o) => o.id !== id),
    }));
  },

  fetchSuppliers: async () => {
    const querySnapshot = await getDocs(collection(db, 'suppliers'));
    const suppliers = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Supplier));
    set({ suppliers });
  },

  addSupplier: async (supplier: Omit<Supplier, 'id' | 'created_at' | 'created_by' | 'business_id'>) => {
    const currentUser = get().currentUser;
    if (!currentUser) throw new Error("No user logged in");

    const docRef = await addDoc(collection(db, 'suppliers'), {
      ...supplier,
      business_id: currentUser.business_id,
      created_by: currentUser,
      created_at: Timestamp.fromDate(new Date())
    });
    set((state) => ({ 
      suppliers: [...state.suppliers, { 
        ...supplier, 
        id: docRef.id, 
        business_id: currentUser.business_id,
        created_by: currentUser, 
        created_at: Timestamp.fromDate(new Date()) 
      }] 
    }));
  },

  updateSupplier: async (supplier) => {
    const { id, ...updateData } = supplier;
    await updateDoc(doc(db, 'suppliers', id), {
      ...updateData,
      contact: { ...updateData.contact },
    });
    set((state) => ({
      suppliers: state.suppliers.map((s) => (s.id === id ? supplier : s)),
    }));
  },

  deleteSupplier: async (id: string) => {
    await deleteDoc(doc(db, 'suppliers', id));
    set((state) => ({
      suppliers: state.suppliers.filter((s) => s.id !== id),
    }));
  },

  fetchStockMovements: async () => {
    const querySnapshot = await getDocs(collection(db, 'stockMovements'));
    const stockMovements = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockMovement));
    set({ stockMovements });
  },

  addStockMovement: async (movement) => {
    const docRef = await addDoc(collection(db, 'stockMovements'), {
      ...movement,
      created_at: Timestamp.fromDate(new Date())
    });
    set((state) => ({ stockMovements: [...state.stockMovements, { ...movement, id: docRef.id, created_at: Timestamp.fromDate(new Date()) }] }));
  },

  updateStockMovement: async (movement) => {
    const { id, ...updateData } = movement;
    await updateDoc(doc(db, 'stockMovements', id), updateData);
    set((state) => ({
      stockMovements: state.stockMovements.map((m) => (m.id === id ? movement : m)),
    }));
  },

  deleteStockMovement: async (id: string) => {
    await deleteDoc(doc(db, 'stockMovements', id));
    set((state) => ({
      stockMovements: state.stockMovements.filter((m) => m.id !== id),
    }));
  },
}));
