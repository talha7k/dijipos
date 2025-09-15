import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { Organization, User as AppUser, OrganizationUser } from '@/types';
import { Order, CartItem, OrderPayment, Table, OrderType } from '@/types/order';
import { Customer, Supplier } from '@/types/customer-supplier';
import { Product, Service, Category } from '@/types/product-service';
import { Invoice, Quote, Payment, PaymentType } from '@/types';
import { User } from 'firebase/auth';
import { indexedDBStorage } from '@/lib/storage';

// =====================
// AUTH STATE ATOMS
// =====================

// Firebase User state
export const userAtom = atom<User | null>(null);
export const authLoadingAtom = atom<boolean>(true);
export const authErrorAtom = atom<string | null>(null);
export const authInitializedAtom = atom<boolean>(false);
export const emailVerifiedAtom = atom<boolean>(false);

// Organization state
export const selectedOrganizationAtom = atom<Organization | null>(null);
export const organizationUserAtom = atom<OrganizationUser | null>(null);
export const userOrganizationsAtom = atom<OrganizationUser[]>([]);
export const organizationLoadingAtom = atom<boolean>(false);
export const organizationErrorAtom = atom<string | null>(null);
export const organizationIdAtom = atomWithStorage<string | null>('dijibill-organization-id', null, indexedDBStorage);

// =====================
// THEME STATE ATOMS
// =====================

export const themeAtom = atomWithStorage<'light' | 'dark'>('dijibill-theme', 'light', indexedDBStorage);

// =====================
// SIDEBAR STATE ATOMS
// =====================

export const sidebarCollapsedAtom = atomWithStorage<boolean>('dijibill-sidebar-collapsed', false, indexedDBStorage);
export const mobileSidebarOpenAtom = atom<boolean>(false);

// =====================
// ORDER STATE ATOMS
// =====================

// Order management
export const ordersAtom = atom<Order[]>([]);
export const currentOrderAtom = atom<Order | null>(null);
export const ordersLoadingAtom = atom<boolean>(false);
export const ordersErrorAtom = atom<string | null>(null);

// Order payments
export const paymentsAtom = atom<{ [orderId: string]: OrderPayment[] }>({});

// Order types state
export const orderTypesAtom = atom<OrderType[]>([]);
export const orderTypesLoadingAtom = atom<boolean>(false);
export const orderTypesErrorAtom = atom<string | null>(null);

// Refresh keys for data refetching
export const ordersRefreshKeyAtom = atom<number>(0);
export const paymentsRefreshKeyAtom = atom<number>(0);
export const orderTypesRefreshKeyAtom = atom<number>(0);

// =====================
// POS STATE ATOMS
// =====================

// Cart state
export const cartItemsAtom = atomWithStorage<CartItem[]>('dijibill-cart-items', [], indexedDBStorage);
export const cartTotalAtom = atom(async (get) => {
  const cartItems = await get(cartItemsAtom);
  return (cartItems || []).reduce((sum: number, item: CartItem) => sum + item.total, 0);
});
export const cartLoadingAtom = atom<boolean>(false);

// POS selection state
export const selectedTableAtom = atomWithStorage<Table | null>('dijibill-selected-table', null, indexedDBStorage);
export const selectedCustomerAtom = atomWithStorage<Customer | null>('dijibill-selected-customer', null, indexedDBStorage);
export const selectedOrderTypeAtom = atomWithStorage<OrderType | null>('dijibill-selected-order-type', null, indexedDBStorage);
export const selectedCartOrderAtom = atom<Order | null>(null);

// POS navigation state
export const currentViewAtom = atom<'items' | 'tables' | 'customers' | 'orders' | 'payment'>('items');
export const categoryPathAtom = atom<string[]>([]);

// =====================
// DERIVED ATOMS
// =====================

// Auth derived atoms
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);
export const hasOrganizationAtom = atom((get) => get(selectedOrganizationAtom) !== null);
export const hasOrganizationsAtom = atom((get) => get(userOrganizationsAtom).length > 0);

// Cart derived atoms
export const hasItemsInCartAtom = atom(async (get) => {
  const cartItems = await get(cartItemsAtom);
  return cartItems && cartItems.length > 0;
});
export const cartItemCountAtom = atom(async (get) => {
  const cartItems = await get(cartItemsAtom);
  return cartItems ? cartItems.reduce((count, item) => count + (item.quantity || 1), 0) : 0;
});

// Order derived atoms
export const hasOrdersAtom = atom((get) => get(ordersAtom).length > 0);
export const activeOrdersAtom = atom((get) => 
  get(ordersAtom).filter(order => order.status !== 'completed' && order.status !== 'cancelled')
);

// =====================
// PERSISTENCE ATOMS
// =====================

// Note: Persistence is now handled directly by IndexedDB atoms above

// =====================
// ASYNC ATOMS
// =====================

// These atoms can be used for async data fetching
// Example: export const fetchOrdersAtom = atom(async (get) => { ... });

// =====================
// UTILITY ATOMS
// =====================

// Reset atoms for clearing state
export const resetAuthStateAtom = atom(null, (get, set) => {
  set(userAtom, null);
  set(organizationUserAtom, null);
  set(selectedOrganizationAtom, null);
  set(userOrganizationsAtom, []);
  set(organizationIdAtom, null);
  set(emailVerifiedAtom, false);
  set(authLoadingAtom, false);
  set(authErrorAtom, null);
});

export const resetPOSStateAtom = atom(null, (get, set) => {
  set(cartItemsAtom, []);
  set(selectedTableAtom, null);
  set(selectedCustomerAtom, null);
  // Don't clear order type - preserve user preference
  set(currentViewAtom, 'items');
  set(categoryPathAtom, []);
  set(selectedCartOrderAtom, null);
});

// =====================
// DATA STATE ATOMS
// =====================

// Customers state
export const customersAtom = atom<Customer[]>([]);
export const customersLoadingAtom = atom<boolean>(false);
export const customersErrorAtom = atom<string | null>(null);

// Products state
export const productsAtom = atom<Product[]>([]);
export const productsLoadingAtom = atom<boolean>(false);
export const productsErrorAtom = atom<string | null>(null);

// Services state
export const servicesAtom = atom<Service[]>([]);
export const servicesLoadingAtom = atom<boolean>(false);
export const servicesErrorAtom = atom<string | null>(null);

// Tables state
export const tablesAtom = atom<Table[]>([]);
export const tablesLoadingAtom = atom<boolean>(false);
export const tablesErrorAtom = atom<string | null>(null);

// Invoices state
export const invoicesAtom = atom<Invoice[]>([]);
export const invoicesLoadingAtom = atom<boolean>(false);
export const invoicesErrorAtom = atom<string | null>(null);

// Quotes state
export const quotesAtom = atom<Quote[]>([]);
export const quotesLoadingAtom = atom<boolean>(false);
export const quotesErrorAtom = atom<string | null>(null);

// Invoice/Quote payments state (different from order payments)
export const invoicePaymentsAtom = atom<Payment[]>([]);
export const invoicePaymentsLoadingAtom = atom<boolean>(false);
export const invoicePaymentsErrorAtom = atom<string | null>(null);

// Payment types state
export const paymentTypesAtom = atom<PaymentType[]>([]);
export const paymentTypesLoadingAtom = atom<boolean>(false);
export const paymentTypesErrorAtom = atom<string | null>(null);

// Suppliers state
export const suppliersAtom = atom<Supplier[]>([]);
export const suppliersLoadingAtom = atom<boolean>(false);
export const suppliersErrorAtom = atom<string | null>(null);

// Categories state
export const categoriesAtom = atom<Category[]>([]);
export const categoriesLoadingAtom = atom<boolean>(false);
export const categoriesErrorAtom = atom<string | null>(null);

// Order management state
export const orderManagementLoadingAtom = atom<boolean>(false);
export const orderManagementErrorAtom = atom<string | null>(null);