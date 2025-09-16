import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { Order, CartItem, Table, OrderType } from '@/types/order';
import { Customer } from '@/types/customer-supplier';
import { indexedDBStorage } from '@/lib/storage';

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

// Cart derived atoms
export const hasItemsInCartAtom = atom(async (get) => {
  const cartItems = await get(cartItemsAtom);
  return cartItems && cartItems.length > 0;
});
export const cartItemCountAtom = atom(async (get) => {
  const cartItems = await get(cartItemsAtom);
  return cartItems ? cartItems.reduce((count, item) => count + (item.quantity || 1), 0) : 0;
});

// =====================
// UTILITY ATOMS
// =====================

// Reset POS state
export const resetPOSStateAtom = atom(null, (get, set) => {
  set(cartItemsAtom, []);
  set(selectedTableAtom, null);
  set(selectedCustomerAtom, null);
  // Don't clear order type - preserve user preference
  set(currentViewAtom, 'items');
  set(categoryPathAtom, []);
  set(selectedCartOrderAtom, null);
});