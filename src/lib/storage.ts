import { get as getItem, set as setItem, del as deleteItem } from 'idb-keyval';

export const indexedDBStorage = {
  getItem: async (key: string) => {
    try {
      return await getItem(key);
    } catch (error) {
      console.error(`Error getting item from IndexedDB for key ${key}:`, error);
      return null;
    }
  },
  
  setItem: async (key: string, value: unknown) => {
    try {
      await setItem(key, value);
    } catch (error) {
      console.error(`Error setting item in IndexedDB for key ${key}:`, error);
    }
  },
  
  removeItem: async (key: string) => {
    try {
      await deleteItem(key);
    } catch (error) {
      console.error(`Error removing item from IndexedDB for key ${key}:`, error);
    }
  },
  
  deleteItem: async (key: string) => {
    try {
      await deleteItem(key);
    } catch (error) {
      console.error(`Error deleting item from IndexedDB for key ${key}:`, error);
    }
  }
};