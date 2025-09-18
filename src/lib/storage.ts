import { get as getItem, set as setItem, del as deleteItem, createStore } from 'idb-keyval';

let store: ReturnType<typeof createStore> | null = null;
let storeInitialized = false;

const initializeStore = () => {
  if (!storeInitialized) {
    try {
      store = createStore('dijibill-db', 'dijibill-store');
      storeInitialized = true;
    } catch (error) {
      console.error('Failed to initialize IndexedDB store:', error);
      storeInitialized = false;
    }
  }
  return store;
};

const resetStore = () => {
  store = null;
  storeInitialized = false;
};

export const indexedDBStorage = {
  getItem: async (key: string) => {
    try {
      const currentStore = initializeStore();
      if (!currentStore) {
        console.warn(`IndexedDB store not available for key ${key}`);
        return null;
      }
      const value = await getItem(key, currentStore);
      const result = value === undefined ? null : value;
      console.log(`IndexedDB getItem: ${key} =`, result);
      return result;
    } catch (error) {
      console.error(`Error getting item from IndexedDB for key ${key}:`, error);
      if (error instanceof Error && error.name === 'UnknownError') {
        resetStore();
      }
      return null;
    }
  },
  
  setItem: async (key: string, value: unknown) => {
    try {
      const currentStore = initializeStore();
      if (!currentStore) {
        console.warn(`IndexedDB store not available for setting key ${key}`);
        return;
      }
      console.log(`IndexedDB setItem: ${key} =`, value);
      await setItem(key, value, currentStore);
    } catch (error) {
      console.error(`Error setting item in IndexedDB for key ${key}:`, error);
      if (error instanceof Error && error.name === 'UnknownError') {
        resetStore();
      }
    }
  },
  
  removeItem: async (key: string) => {
    try {
      const currentStore = initializeStore();
      if (!currentStore) {
        return;
      }
      await deleteItem(key, currentStore);
    } catch (error) {
      console.error(`Error removing item from IndexedDB for key ${key}:`, error);
      if (error instanceof Error && error.name === 'UnknownError') {
        resetStore();
      }
    }
  },
  
  deleteItem: async (key: string) => {
    try {
      const currentStore = initializeStore();
      if (!currentStore) {
        return;
      }
      await deleteItem(key, currentStore);
    } catch (error) {
      console.error(`Error deleting item from IndexedDB for key ${key}:`, error);
      if (error instanceof Error && error.name === 'UnknownError') {
        resetStore();
      }
    }
  }
};