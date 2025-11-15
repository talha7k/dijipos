import { useState, useEffect, useCallback } from 'react';
import { Item, ItemType, ProductTransactionType } from '@/types';
import {
  getItems,
  getItemsByType,
  getItemsByTransactionType,
  getItem,
  createItem as firestoreCreateItem,
  updateItem as firestoreUpdateItem,
  deleteItem as firestoreDeleteItem
} from '@/lib/firebase/firestore/items';
import { useOrganization } from './useOrganization';

export interface ItemsState {
  items: Item[];
  loading: boolean;
  error: string | null;
}

export interface ItemsActions {
  createItem: (itemData: Omit<Item, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  createItemBulk: (itemData: Omit<Item, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateItem: (itemId: string, updates: Partial<Omit<Item, 'id' | 'createdAt'>>) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  getItemById: (itemId: string) => Promise<Item | null>;
  refreshItems: () => Promise<void>;
}

export function useItems(): ItemsState & ItemsActions {
  const { selectedOrganization } = useOrganization();
  const organizationId = selectedOrganization?.id;

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load items when organization changes
  const loadItems = useCallback(async () => {
    if (!organizationId) {
      setItems([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedItems = await getItems(organizationId);
      setItems(fetchedItems);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load items';
      setError(errorMessage);
      console.error('Error loading items:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  // Load items on mount and when organization changes
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const createItem = useCallback(async (itemData: Omit<Item, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!organizationId) {
      throw new Error('No organization selected');
    }

    try {
      const fullItemData = {
        ...itemData,
        organizationId,
      };

      const itemId = await firestoreCreateItem(fullItemData);

      // Refresh items list
      await loadItems();

      return itemId;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  }, [organizationId, loadItems]);

  const createItemBulk = useCallback(async (itemData: Omit<Item, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!organizationId) {
      throw new Error('No organization selected');
    }

    try {
      const fullItemData = {
        ...itemData,
        organizationId,
      };

      const itemId = await firestoreCreateItem(fullItemData);

      // Immediately update local state with the new item
      const newItem: Item = {
        ...fullItemData,
        id: itemId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setItems(prevItems => [...prevItems, newItem]);

      return itemId;
    } catch (error) {
      console.error('Error creating item (bulk):', error);
      throw error;
    }
  }, [organizationId]);

  const updateItem = useCallback(async (itemId: string, updates: Partial<Omit<Item, 'id' | 'createdAt'>>): Promise<void> => {
    try {
      await firestoreUpdateItem(itemId, updates);

      // Update local state
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId
            ? { ...item, ...updates, updatedAt: new Date() }
            : item
        )
      );
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  }, []);

  const deleteItem = useCallback(async (itemId: string): Promise<void> => {
    try {
      await firestoreDeleteItem(itemId);

      // Update local state
      setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  }, []);

  const getItemById = useCallback(async (itemId: string): Promise<Item | null> => {
    try {
      return await getItem(itemId);
    } catch (error) {
      console.error('Error fetching item:', error);
      throw error;
    }
  }, []);

  const refreshItems = useCallback(async (): Promise<void> => {
    await loadItems();
  }, [loadItems]);

  return {
    items,
    loading,
    error,
    createItem,
    createItemBulk,
    updateItem,
    deleteItem,
    getItemById,
    refreshItems,
  };
}

// Hook for getting items by type
export function useItemsByType(itemType: ItemType): ItemsState & ItemsActions {
  const { selectedOrganization } = useOrganization();
  const organizationId = selectedOrganization?.id;

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    if (!organizationId) {
      setItems([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedItems = await getItemsByType(organizationId, itemType);
      setItems(fetchedItems);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load items';
      setError(errorMessage);
      console.error('Error loading items by type:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, itemType]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Reuse the same actions as the main hook
  const { createItem, createItemBulk, updateItem, deleteItem, getItemById } = useItems();

  return {
    items,
    loading,
    error,
    createItem,
    createItemBulk,
    updateItem,
    deleteItem,
    getItemById,
    refreshItems: loadItems,
  };
}

// Hook for getting items by transaction type
export function useItemsByTransactionType(transactionType: ProductTransactionType): ItemsState & ItemsActions {
  const { selectedOrganization } = useOrganization();
  const organizationId = selectedOrganization?.id;

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    if (!organizationId) {
      setItems([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedItems = await getItemsByTransactionType(organizationId, transactionType);
      setItems(fetchedItems);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load items';
      setError(errorMessage);
      console.error('Error loading items by transaction type:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, transactionType]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Reuse the same actions as the main hook
  const { createItem, createItemBulk, updateItem, deleteItem, getItemById } = useItems();

  return {
    items,
    loading,
    error,
    createItem,
    createItemBulk,
    updateItem,
    deleteItem,
    getItemById,
    refreshItems: loadItems,
  };
}