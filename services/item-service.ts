import { supabase } from '@/lib/supabase';
import type { Item } from '@/types';

// Database row type for items table
interface DbItem {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  photo_url: string;
  created_at: string;
  updated_at: string;
}

// Database row type for likes table
interface DbLike {
  to_item_id: string;
}

// Database row type for dislikes table
interface DbDislike {
  to_item_id: string;
}

export const itemService = {
  async createItem(
    userId: string,
    data: Omit<Item, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<Item> {
    const { data: newItem, error } = await supabase
      .from('items')
      .insert({
        user_id: userId,
        title: data.title,
        description: data.description,
        category: data.category,
        photo_url: data.photoUrl,
      } as Partial<DbItem>)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create item: ${error.message}`);
    }

    return this.mapDbItemToItem(newItem as DbItem);
  },

  async getUserItems(userId: string): Promise<Item[]> {
    const { data: items, error } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get user items: ${error.message}`);
    }

    return (items as DbItem[]).map(this.mapDbItemToItem);
  },

  async getFeedItems(userId: string): Promise<Item[]> {
    // Get items the user has already interacted with (liked or disliked)
    const [{ data: likes }, { data: dislikes }] = await Promise.all([
      supabase
        .from('likes')
        .select('to_item_id')
        .eq('from_user_id', userId),
      supabase
        .from('dislikes')
        .select('to_item_id')
        .eq('from_user_id', userId),
    ]);

    const interactedItemIds = [
      ...((likes as DbLike[] | null)?.map((l) => l.to_item_id) || []),
      ...((dislikes as DbDislike[] | null)?.map((d) => d.to_item_id) || []),
    ];

    // Get items from other users that haven't been interacted with
    let query = supabase
      .from('items')
      .select('*')
      .neq('user_id', userId)
      .order('created_at', { ascending: false });

    if (interactedItemIds.length > 0) {
      query = query.not('id', 'in', `(${interactedItemIds.join(',')})`);
    }

    const { data: items, error } = await query;

    if (error) {
      throw new Error(`Failed to get feed items: ${error.message}`);
    }

    return (items as DbItem[]).map(this.mapDbItemToItem);
  },

  async getItemById(itemId: string): Promise<Item | null> {
    const { data: item, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to get item: ${error.message}`);
    }

    return this.mapDbItemToItem(item as DbItem);
  },

  async updateItem(itemId: string, updates: Partial<Item>): Promise<void> {
    const dbUpdates: Partial<DbItem> = {};

    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.photoUrl !== undefined) dbUpdates.photo_url = updates.photoUrl;

    const { error } = await supabase
      .from('items')
      .update(dbUpdates as DbItem)
      .eq('id', itemId);

    if (error) {
      throw new Error(`Failed to update item: ${error.message}`);
    }
  },

  async deleteItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId);

    if (error) {
      throw new Error(`Failed to delete item: ${error.message}`);
    }
  },

  async getAllItems(): Promise<Item[]> {
    const { data: items, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get all items: ${error.message}`);
    }

    return (items as DbItem[]).map(this.mapDbItemToItem);
  },

  async getItemsByIds(itemIds: string[]): Promise<Item[]> {
    if (itemIds.length === 0) return [];

    const { data: items, error } = await supabase
      .from('items')
      .select('*')
      .in('id', itemIds);

    if (error) {
      throw new Error(`Failed to get items by IDs: ${error.message}`);
    }

    return (items as DbItem[]).map(this.mapDbItemToItem);
  },

  // Helper function to map database row to Item type
  mapDbItemToItem(dbItem: DbItem): Item {
    return {
      id: dbItem.id,
      userId: dbItem.user_id,
      title: dbItem.title,
      description: dbItem.description,
      category: dbItem.category as Item['category'],
      photoUrl: dbItem.photo_url,
      createdAt: new Date(dbItem.created_at).getTime(),
      updatedAt: new Date(dbItem.updated_at).getTime(),
    };
  },
};
