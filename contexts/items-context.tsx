import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { itemService } from '@/services/item-service';
import { useAuth } from '@/contexts/auth-context';
import type { Item, ItemsContextType } from '@/types';

const ItemsContext = createContext<ItemsContextType | null>(null);

export function ItemsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [feedItems, setFeedItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshUserItems = useCallback(async () => {
    if (!user) return;

    try {
      const items = await itemService.getUserItems(user.id);
      setUserItems(items);
    } catch (error) {
      console.error('Failed to load user items:', error);
    }
  }, [user]);

  const refreshFeed = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const items = await itemService.getFeedItems(user.id);
      setFeedItems(items);
    } catch (error) {
      console.error('Failed to load feed items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshUserItems();
      refreshFeed();
    } else {
      setUserItems([]);
      setFeedItems([]);
    }
  }, [user, refreshUserItems, refreshFeed]);

  const addItem = useCallback(
    async (data: Omit<Item, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      if (!user) throw new Error('Usuário não autenticado');

      const newItem = await itemService.createItem(user.id, data);
      setUserItems((prev) => [newItem, ...prev]);
      return newItem;
    },
    [user]
  );

  const updateItem = useCallback(async (id: string, updates: Partial<Item>) => {
    await itemService.updateItem(id, updates);
    setUserItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, updatedAt: Date.now() } : item))
    );
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    await itemService.deleteItem(id);
    setUserItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const value: ItemsContextType = {
    userItems,
    feedItems,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    refreshFeed,
    refreshUserItems,
  };

  return <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>;
}

export function useItems(): ItemsContextType {
  const context = useContext(ItemsContext);
  if (!context) {
    throw new Error('useItems must be used within an ItemsProvider');
  }
  return context;
}
