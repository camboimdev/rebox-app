import { storage } from './storage';
import { generateId } from '@/utils/id-generator';
import type { Item, Like, Dislike, STORAGE_KEYS } from '@/types';

const ITEMS_KEY = '@rebox/items';
const LIKES_KEY = '@rebox/likes';
const DISLIKES_KEY = '@rebox/dislikes';

export const itemService = {
  async createItem(
    userId: string,
    data: Omit<Item, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<Item> {
    const now = Date.now();
    const newItem: Item = {
      ...data,
      id: generateId(),
      userId,
      createdAt: now,
      updatedAt: now,
    };

    await storage.appendToArray(ITEMS_KEY, newItem);
    return newItem;
  },

  async getUserItems(userId: string): Promise<Item[]> {
    const items = await storage.getArray<Item>(ITEMS_KEY);
    return items.filter((item) => item.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
  },

  async getFeedItems(userId: string): Promise<Item[]> {
    const items = await storage.getArray<Item>(ITEMS_KEY);
    const likes = await storage.getArray<Like>(LIKES_KEY);
    const dislikes = await storage.getArray<Dislike>(DISLIKES_KEY);

    // Get items the user has already interacted with
    const likedItemIds = new Set(likes.filter((l) => l.fromUserId === userId).map((l) => l.toItemId));
    const dislikedItemIds = new Set(
      dislikes.filter((d) => d.fromUserId === userId).map((d) => d.toItemId)
    );

    // Return items from other users that haven't been interacted with
    return items
      .filter(
        (item) =>
          item.userId !== userId && !likedItemIds.has(item.id) && !dislikedItemIds.has(item.id)
      )
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  async getItemById(itemId: string): Promise<Item | null> {
    return storage.findInArray<Item>(ITEMS_KEY, itemId);
  },

  async updateItem(itemId: string, updates: Partial<Item>): Promise<void> {
    await storage.updateInArray<Item>(ITEMS_KEY, itemId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },

  async deleteItem(itemId: string): Promise<void> {
    await storage.removeFromArray<Item>(ITEMS_KEY, itemId);
  },

  async getAllItems(): Promise<Item[]> {
    return storage.getArray<Item>(ITEMS_KEY);
  },

  async getItemsByIds(itemIds: string[]): Promise<Item[]> {
    const items = await storage.getArray<Item>(ITEMS_KEY);
    return items.filter((item) => itemIds.includes(item.id));
  },
};
