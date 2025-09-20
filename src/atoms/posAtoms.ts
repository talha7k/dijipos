import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Order, CartItem, Table, OrderType } from "@/types/pos-order";
import { Customer } from "@/types/customer-supplier";
import { VATSettings } from "@/types/settings";
import { indexedDBStorage } from "@/lib/storage";
import { calculateCartTotals } from "@/lib/vat-calculator";

// =====================
// POS STATE ATOMS
// =====================

// VAT settings state
export const vatSettingsAtom = atom<VATSettings | null>(null);

// Cart state
export const cartItemsAtom = atomWithStorage<CartItem[]>(
  "dijibill-cart-items",
  [],
  indexedDBStorage,
);

// Wrapper atom to ensure cartItems is never null
export const safeCartItemsAtom = atom(
  async (get) => {
    const cartItems = await get(cartItemsAtom);
    return cartItems || [];
  },
  (get, set, newCartItems: CartItem[]) => {
    set(cartItemsAtom, newCartItems);
  },
);
export const cartTotalAtom = atom(async (get) => {
  const cartItems = await get(cartItemsAtom);
  const vatSettings = await get(vatSettingsAtom);

  if (!vatSettings || !vatSettings.isEnabled) {
    // VAT disabled, just sum item totals
    return (cartItems || []).reduce(
      (sum: number, item: CartItem) => sum + item.total,
      0,
    );
  }

  const itemsForCalculation = (cartItems || []).map((item) => ({
    price: item.total / item.quantity, // Get unit price
    quantity: item.quantity,
  }));

  const result = calculateCartTotals(
    itemsForCalculation,
    vatSettings.rate,
    vatSettings.isVatInclusive,
  );

  return result.total;
});

// Subtotal atom (without tax) for components that need it
export const cartSubtotalAtom = atom(async (get) => {
  const cartItems = await get(cartItemsAtom);
  const vatSettings = await get(vatSettingsAtom);

  if (!vatSettings || !vatSettings.isEnabled) {
    // VAT disabled, just sum item totals
    return (cartItems || []).reduce(
      (sum: number, item: CartItem) => sum + item.total,
      0,
    );
  }

  const itemsForCalculation = (cartItems || []).map((item) => ({
    price: item.total / item.quantity, // Get unit price
    quantity: item.quantity,
  }));

  const result = calculateCartTotals(
    itemsForCalculation,
    vatSettings.rate,
    vatSettings.isVatInclusive,
  );

  return result.subtotal;
});

// VAT amount atom for components that need to display VAT separately
export const cartVatAmountAtom = atom(async (get) => {
  const cartItems = await get(cartItemsAtom);
  const vatSettings = await get(vatSettingsAtom);

  if (!vatSettings || !vatSettings.isEnabled) {
    return 0;
  }

  const itemsForCalculation = (cartItems || []).map((item) => ({
    price: item.total / item.quantity, // Get unit price
    quantity: item.quantity,
  }));

  const result = calculateCartTotals(
    itemsForCalculation,
    vatSettings.rate,
    vatSettings.isVatInclusive,
  );

  return result.vatAmount;
});
export const cartLoadingAtom = atom<boolean>(false);

// POS selection state
export const selectedTableAtom = atomWithStorage<Table | null>(
  "dijibill-selected-table",
  null,
  indexedDBStorage,
);
export const selectedCustomerAtom = atomWithStorage<Customer | null>(
  "dijibill-selected-customer",
  null,
  indexedDBStorage,
);
export const selectedOrderTypeAtom = atomWithStorage<OrderType | null>(
  "dijibill-selected-order-type",
  null,
  indexedDBStorage,
);
export const selectedCartOrderAtom = atom<Order | null>(null);

// POS navigation state
export const currentViewAtom = atom<
  "items" | "tables" | "customers" | "orders" | "payment"
>("items");
export const categoryPathAtom = atom<string[]>([]);

// Queue management state
export const nextQueueNumberAtom = atomWithStorage<number>(
  "dijibill-next-queue-number",
  1,
  indexedDBStorage,
);
export const currentQueueNumberAtom = atom<number | null>(null);

// =====================
// DERIVED ATOMS
// =====================

// Cart derived atoms
export const hasItemsInCartAtom = atom(async (get) => {
  const cartItems = await get(cartItemsAtom);
  return (cartItems || []).length > 0;
});
export const cartItemCountAtom = atom(async (get) => {
  const cartItems = await get(cartItemsAtom);
  return (cartItems || []).reduce(
    (count, item) => count + (item.quantity || 1),
    0,
  );
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
  set(currentViewAtom, "items");
  set(categoryPathAtom, []);
  set(selectedCartOrderAtom, null);
  set(currentQueueNumberAtom, null);
});
