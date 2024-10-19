import { create } from 'zustand';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Product, Order, OrderType, OrderItem, ProductCategory, Customer, PaymentType, Inventory, PurchaseOrder, Supplier, StockMovement, User, TaxRate } from './types';

interface AppState {
  productCategories: ProductCategory[];
  products: Product[];
  currentOrder: OrderItem[];
  orders: Order[];
  orderTypes: OrderType[];
  customers: Customer[];
  taxRates: TaxRate[];
  paymentTypes: PaymentType[];
  inventory: Inventory[];
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
  stockMovements: StockMovement[];
  currentUser: User | null;

  fetchOrderTypes: () => Promise<void>;
  addOrderType: (orderType: Omit<OrderType, 'id' | 'created_at'>) => Promise<void>;
  updateOrderType: (orderType: OrderType) => Promise<void>;
  deleteOrderType: (id: string) => Promise<void>;
  

  fetchProductCategories: () => Promise<void>;
  addProductCategory: (productCategory: Omit<ProductCategory, 'id' | 'created_at' | 'created_by'>) => Promise<void>;
  updateProductCategory: (productCategory: ProductCategory) => Promise<void>;
  deleteProductCategory: (id: string) => Promise<void>;
  
  fetchPaymentTypes: () => Promise<void>;
  addPaymentType: (paymentType: Omit<PaymentType, 'id' | 'created_at'>) => Promise<void>;
  updatePaymentType: (paymentType: PaymentType) => Promise<void>;
  deletePaymentType: (id: string) => Promise<void>;

  fetchTaxRates: () => Promise<void>;

  fetchOrders: () => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'created_at' | 'created_by'>) => void;
  updateOrder: (order: Order) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;

  addToOrder: (item: Omit<OrderItem, 'id' | 'order_id'>) => void;
  removeFromOrder: (id: string) => void;
  clearOrder: () => void;

  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'created_by'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  fetchCustomers: () => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'created_by'>) => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  fetchInventory: () => Promise<void>;
  addInventoryItem: (item: Omit<Inventory, 'id' | 'created_at' | 'created_by'>) => Promise<void>;
  updateInventoryItem: (item: Inventory) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;

    fetchPurchaseOrders: () => Promise<void>;
  addPurchaseOrder: (order: Omit<PurchaseOrder, 'id' | 'created_at' | 'created_by'>) => Promise<void>;
  updatePurchaseOrder: (order: PurchaseOrder) => Promise<void>;
  deletePurchaseOrder: (id: string) => Promise<void>;

  fetchSuppliers: () => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'created_at' | 'created_by'>) => Promise<void>;
  updateSupplier: (supplier: Supplier) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;

  fetchStockMovements: () => Promise<void>;
  addStockMovement: (movement: Omit<StockMovement, 'id' | 'created_at' | 'created_by'>) => Promise<void>;
  updateStockMovement: (movement: StockMovement) => Promise<void>;
  deleteStockMovement: (id: string) => Promise<void>;

  addSampleProducts: () => Promise<void>;
  addSampleProductCategories: () => Promise<void>;
}

const sampleProducts: Omit<Product, 'id' | 'created_at' | 'created_by'>[] = [
  {
    name_en: 'Margherita Pizza',
    name_other: 'بيتزا مارجريتا',
    description: 'Classic pizza with tomato sauce, mozzarella, and basil',
    price: 12.99,
    category_product: { id: '1', name: 'Pizza' } as ProductCategory,
    is_available: true,
    image: 'https://example.com/images/margherita-pizza.jpg',
  },
  {
    name_en: 'Chicken Shawarma',
    name_other: 'اورما دجاج',
    description: 'Grilled chicken wrapped in pita bread with vegetables and sauce',
    price: 8.99,
    category_product: { id: '2', name: 'Wraps' } as ProductCategory,
    is_available: true,
    image: 'https://example.com/images/chicken-shawarma.jpg',
  },
  {
    name_en: 'Falafel Plate',
    name_other: 'طبق فلافل',
    description: 'Deep-fried chickpea balls served with hummus and salad',
    price: 10.99,
    category_product: { id: '3', name: 'Plates' } as ProductCategory,
    is_available: true,
    image: 'https://example.com/images/falafel-plate.jpg',
  },
];

const sampleProductCategories: Omit<ProductCategory, 'id' | 'created_at' | 'created_by' >[] = [
  {
    name: 'Pizza',
    description: 'Various types of pizzas',
    image: 'https://example.com/images/pizza-category.jpg',
    is_visible: true,
    sort_order: 1,
  },
  {
    name: 'Wraps',
    description: 'Delicious wrapped sandwiches',
    image: 'https://example.com/images/wraps-category.jpg',
    is_visible: true,
    sort_order: 2,
  },
  {
    name: 'Plates',
    description: 'Full meal plates',
    image: 'https://example.com/images/plates-category.jpg',
    is_visible: true,
    sort_order: 3,
  },
];

export const useAppStore = create<AppState>((set, get) => ({
  productCategories: [],
  products: [],
  currentOrder: [],
  orders: [],
  orderTypes: [],
  taxRates: [],
  customers: [],
  paymentTypes: [],
  inventory: [],
  purchaseOrders: [],
  suppliers: [],
  stockMovements: [],
  currentUser: null,
  
  fetchProductCategories: async () => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const querySnapshot = await getDocs(collection(db, `businesses/${currentUser.business_id}/productCategories`));
    const productCategories = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ProductCategory));
    if (productCategories.length === 0) {
      // If no product categories are fetched, use sample categories
      set({ productCategories: sampleProductCategories.map((category, index) => ({
        ...category,
        id: `sample-${index}`,
        created_at: Timestamp.fromDate(new Date()),
        created_by: { id: 'sample', email: 'sample@example.com', business_id: currentUser.business_id } as User
      })) });
    } else {
      set({ productCategories });
    }
  },

  addProductCategory: async (productCategory: Omit<ProductCategory, 'id' | 'created_at' | 'created_by'>) => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const docRef = await addDoc(collection(db, `businesses/${currentUser.business_id}/productCategories`), {
      ...productCategory,
      created_by: currentUser,
      created_at: Timestamp.fromDate(new Date())
    });
    set((state) => ({ 
      productCategories: [...state.productCategories, { 
        ...productCategory, 
        id: docRef.id, 
        created_by: currentUser, 
        created_at: Timestamp.fromDate(new Date()) 
      }] 
    }));
  },

  updateProductCategory: async (productCategory: ProductCategory) => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const { id, ...updateData } = productCategory;
    await updateDoc(doc(db, `businesses/${currentUser.business_id}/productCategories`, id), updateData);
    set((state) => ({
      productCategories: state.productCategories.map((p) => (p.id === id ? productCategory : p)),
    }));
  },

  deleteProductCategory: async (id: string) => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    await deleteDoc(doc(db, `businesses/${currentUser.business_id}/productCategories`, id));
    set((state) => ({
      productCategories: state.productCategories.filter((p) => p.id !== id),
    }));
  },

  fetchTaxRates: async () => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const querySnapshot = await getDocs(collection(db, `businesses/${currentUser.business_id}/taxRates`));
    const taxRates = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TaxRate));
    set((state) => ({
      taxRates: taxRates,
    }));  },

  fetchOrderTypes: async () => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const querySnapshot = await getDocs(collection(db, `businesses/${currentUser.business_id}/orderTypes`));
    const orderTypes = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as OrderType));
    set({ orderTypes });
  },

  addOrderType: async (orderType: Omit<OrderType, 'id' | 'created_at' | 'created_by'>) => {
    const currentUser = get().currentUser;
    if (!currentUser) throw new Error("No user logged in");
    const docRef = await addDoc(collection(db, `businesses/${currentUser.business_id}/orderTypes`), {
      ...orderType,
      created_by: currentUser,
      created_at: Timestamp.fromDate(new Date())
    });
    set((state) => ({ 
      orderTypes: [...state.orderTypes, { 
        ...orderType, 
        id: docRef.id, 
        created_by: currentUser, 
        created_at: Timestamp.fromDate(new Date()) 
      }] 
    }));
  },

  updateOrderType: async (orderType: OrderType) => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const { id, ...updateData } = orderType;
    await updateDoc(doc(db, `businesses/${currentUser.business_id}/orderTypes`, id), updateData);
    set((state) => ({
      orderTypes: state.orderTypes.map((o) => (o.id === id ? orderType : o)),
    }));
  },

  deleteOrderType: async (id: string) => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    await deleteDoc(doc(db, `businesses/${currentUser.business_id}/orderTypes`, id));
    set((state) => ({
      orderTypes: state.orderTypes.filter((o) => o.id !== id),
    }));
  },

  fetchOrders: async () => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const querySnapshot = await getDocs(collection(db, `businesses/${currentUser.business_id}/orders`));
    const orders = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
    set({ orders });
  },

  addOrder: async (order: Omit<Order, 'id' | 'created_at' | 'created_by'>) => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const docRef = await addDoc(collection(db, `businesses/${currentUser.business_id}/orders`), {
      ...order,
      created_by: currentUser,
      created_at: Timestamp.fromDate(new Date())
    });
    set((state) => ({ 
      orders: [...state.orders, { 
        ...order, 
        id: docRef.id, 
        created_by: currentUser, 
        created_at: Timestamp.fromDate(new Date()) 
      }] 
    }));
  },

  updateOrder: async (order: Order) => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const { id, ...updateData } = order;
    await updateDoc(doc(db, `businesses/${currentUser.business_id}/orders`, id), updateData);
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? order : o)),
    }));
  },

  deleteOrder: async (id: string) => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    await deleteDoc(doc(db, `businesses/${currentUser.business_id}/orders`, id));
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
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const querySnapshot = await getDocs(collection(db, `businesses/${currentUser.business_id}/products`));
    const products = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
    if (products.length === 0) {
      // If no products are fetched, use sample products
      set({ products: sampleProducts.map((product, index) => ({
        ...product,
        id: `sample-${index}`,
        created_at: Timestamp.fromDate(new Date()),
        created_by: { id: 'sample', email: 'sample@example.com', business_id: 'sample' } as User
      })) });
    } else {
      set({ products });
    }
  },

  addProduct: async (product: Omit<Product, 'id' | 'created_at' | 'created_by'>) => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const docRef = await addDoc(collection(db, `businesses/${currentUser.business_id}/products`), {
      ...product,
      created_by: currentUser,
      created_at: Timestamp.fromDate(new Date())
    });
    const newProduct: Product = {
      ...product,
      id: docRef.id,
      created_by: currentUser,
      created_at: Timestamp.fromDate(new Date())
    };
    set((state) => ({ products: [...state.products, newProduct] }));
  },

  updateProduct: async (product: Product) => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const { id, ...updateData } = product;
    await updateDoc(doc(db, `businesses/${currentUser.business_id}/products`, id), updateData);
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? product : p)),
    }));
  },

  deleteProduct: async (id: string) => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    await deleteDoc(doc(db, `businesses/${currentUser.business_id}/products`, id));
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }));
  },

  fetchCustomers: async () => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const querySnapshot = await getDocs(collection(db, `businesses/${currentUser.business_id}/customers`));
    const customers = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Customer));
    set({ customers });
  },

  addCustomer: async (customer: Omit<Customer, 'id' | 'created_at' | 'created_by'>) => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const docRef = await addDoc(collection(db, `businesses/${currentUser.business_id}/customers`), {
      ...customer,
      created_by: currentUser,
      created_at: Timestamp.fromDate(new Date())
    });
    set((state) => ({ 
      customers: [...state.customers, { 
        ...customer, 
        id: docRef.id, 
        created_by: currentUser, 
        created_at: Timestamp.fromDate(new Date()) 
      }] 
    }));
  },

  updateCustomer: async (customer: Customer) => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const { id, ...updateData } = customer;
    await updateDoc(doc(db, `businesses/${currentUser.business_id}/customers`, id), updateData);
    set((state) => ({
      customers: state.customers.map((c) => (c.id === id ? customer : c)),
    }));
  },

  deleteCustomer: async (id: string) => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    await deleteDoc(doc(db, `businesses/${currentUser.business_id}/customers`, id));
    set((state) => ({
      customers: state.customers.filter((c) => c.id !== id),
    }));
  },

  fetchPaymentTypes: async () => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const querySnapshot = await getDocs(collection(db, `businesses/${currentUser.business_id}/paymentTypes`));
    const paymentTypes = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PaymentType));
    set({ paymentTypes });
  },

  addPaymentType: async (paymentType: Omit<PaymentType, 'id' | 'created_at'>) => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const docRef = await addDoc(collection(db, `businesses/${currentUser.business_id}/paymentTypes`), {
      ...paymentType,
      created_by: currentUser,
      created_at: Timestamp.fromDate(new Date())
    });
    set((state) => ({ 
      paymentTypes: [...state.paymentTypes, { 
        ...paymentType, 
        id: docRef.id, 
        created_by: currentUser, 
        created_at: Timestamp.fromDate(new Date()) 
      }] 
    }));
  },

  updatePaymentType: async (paymentType: PaymentType) => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const { id, ...updateData } = paymentType;
    await updateDoc(doc(db, `businesses/${currentUser.business_id}/paymentTypes`, id), updateData);
    set((state) => ({
      paymentTypes: state.paymentTypes.map((p) => (p.id === id ? paymentType : p)),
    }));
  },

  deletePaymentType: async (id: string) => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    await deleteDoc(doc(db, `businesses/${currentUser.business_id}/paymentTypes`, id));
    set((state) => ({
      paymentTypes: state.paymentTypes.filter((p) => p.id !== id),
    }));
  },

  fetchInventory: async () => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const querySnapshot = await getDocs(collection(db, `businesses/${currentUser.business_id}/inventory`));
    const inventory = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Inventory));
    set({ inventory });
  },

  addInventoryItem: async (item: Omit<Inventory, 'id' | 'created_at' | 'created_by'>) => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const docRef = await addDoc(collection(db, `businesses/${currentUser.business_id}/inventory`), {
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
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const { id, ...updateData } = item;
    await updateDoc(doc(db, `businesses/${currentUser.business_id}/inventory`, id), updateData);
    set((state) => ({
      inventory: state.inventory.map((i) => (i.id === id ? item : i)),
    }));
  },

  deleteInventoryItem: async (id: string) => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    await deleteDoc(doc(db, `businesses/${currentUser.business_id}/inventory`, id));
    set((state) => ({
      inventory: state.inventory.filter((i) => i.id !== id),
    }));
  },

  fetchPurchaseOrders: async () => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const querySnapshot = await getDocs(collection(db, `businesses/${currentUser.business_id}/purchaseOrders`));
    const purchaseOrders = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PurchaseOrder));
    set({ purchaseOrders });
  },

  addPurchaseOrder: async (order: Omit<PurchaseOrder, 'id' | 'created_at' | 'created_by'>) => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const docRef = await addDoc(collection(db, `businesses/${currentUser.business_id}/purchaseOrders`), {
      ...order,
      created_by: currentUser,
      created_at: Timestamp.fromDate(new Date())
    });
    set((state) => ({ 
      purchaseOrders: [...state.purchaseOrders, { 
        ...order, 
        id: docRef.id, 
        created_by: currentUser, 
        created_at: Timestamp.fromDate(new Date()) 
      }] 
    }));
  },

  updatePurchaseOrder: async (order: PurchaseOrder) => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const { id, ...updateData } = order;
    await updateDoc(doc(db, `businesses/${currentUser.business_id}/purchaseOrders`, id), updateData);
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((o) => (o.id === id ? order : o)),
    }));
  },

  deletePurchaseOrder: async (id: string) => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    await deleteDoc(doc(db, `businesses/${currentUser.business_id}/purchaseOrders`, id));
    set((state) => ({
      purchaseOrders: state.purchaseOrders.filter((o) => o.id !== id),
    }));
  },

  fetchSuppliers: async () => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const querySnapshot = await getDocs(collection(db, `businesses/${currentUser.business_id}/suppliers`));
    const suppliers = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Supplier));
    set({ suppliers });
  },

  addSupplier: async (supplier: Omit<Supplier, 'id' | 'created_at' | 'created_by'>) => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const docRef = await addDoc(collection(db, `businesses/${currentUser.business_id}/suppliers`), {
      ...supplier,
      created_by: currentUser,
      created_at: Timestamp.fromDate(new Date())
    });
    set((state) => ({ 
      suppliers: [...state.suppliers, { 
        ...supplier, 
        id: docRef.id, 
        created_by: currentUser, 
        created_at: Timestamp.fromDate(new Date()) 
      }] 
    }));
  },

  updateSupplier: async (supplier: Supplier) => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const { id, ...updateData } = supplier;
    await updateDoc(doc(db, `businesses/${currentUser.business_id}/suppliers`, id), updateData);
    set((state) => ({
      suppliers: state.suppliers.map((s) => (s.id === id ? supplier : s)),
    }));
  },

  deleteSupplier: async (id: string) => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    await deleteDoc(doc(db, `businesses/${currentUser.business_id}/suppliers`, id));
    set((state) => ({
      suppliers: state.suppliers.filter((s) => s.id !== id),
    }));
  },

  fetchStockMovements: async () => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const querySnapshot = await getDocs(collection(db, `businesses/${currentUser.business_id}/stockMovements`));
    const stockMovements = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as StockMovement));
    set({ stockMovements });
  },

  addStockMovement: async (movement: Omit<StockMovement, 'id' | 'created_at' | 'created_by'>) => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const docRef = await addDoc(collection(db, `businesses/${currentUser.business_id}/stockMovements`), {
      ...movement,
      created_by: currentUser,
      created_at: Timestamp.fromDate(new Date())
    });
    set((state) => ({ 
      stockMovements: [...state.stockMovements, { 
        ...movement, 
        id: docRef.id, 
        created_by: currentUser, 
        created_at: Timestamp.fromDate(new Date()) 
      }] 
    }));
  },

  updateStockMovement: async (movement: StockMovement) => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    const { id, ...updateData } = movement;
    await updateDoc(doc(db, `businesses/${currentUser.business_id}/stockMovements`, id), updateData);
    set((state) => ({
      stockMovements: state.stockMovements.map((m) => (m.id === id ? movement : m)),
    }));
  },

  deleteStockMovement: async (id: string) => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");
    await deleteDoc(doc(db, `businesses/${currentUser.business_id}/stockMovements`, id));
    set((state) => ({
      stockMovements: state.stockMovements.filter((m) => m.id !== id),
    }));
  },

  addSampleProducts: async () => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");

    for (const product of sampleProducts) {
      const docRef = await addDoc(collection(db, `businesses/${currentUser.business_id}/products`), {
        ...product,
        created_by: currentUser,
        created_at: Timestamp.fromDate(new Date())
      });
      set((state) => ({ 
        products: [...state.products, { 
          ...product, 
          id: docRef.id, 
          created_by: currentUser, 
          created_at: Timestamp.fromDate(new Date()) 
        }] 
      }));
    }
  },

  addSampleProductCategories: async () => {
    const currentUser = get().currentUser;
    if (!currentUser || !currentUser.business_id) throw new Error("No user logged in or no business associated");

    for (const category of sampleProductCategories) {
      const docRef = await addDoc(collection(db, `businesses/${currentUser.business_id}/productCategories`), {
        ...category,
        created_by: currentUser,
        created_at: Timestamp.fromDate(new Date())
      });
      set((state) => ({ 
        productCategories: [...state.productCategories, { 
          ...category, 
          id: docRef.id, 
          created_by: currentUser, 
          created_at: Timestamp.fromDate(new Date()) 
        }] 
      }));
    }
  },
}));