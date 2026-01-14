import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error reading ${key} from storage:`, error);
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing ${key} to storage:`, error);
      throw error;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
      throw error;
    }
  },

  async getArray<T>(key: string): Promise<T[]> {
    const data = await this.get<T[]>(key);
    return data ?? [];
  },

  async appendToArray<T>(key: string, item: T): Promise<void> {
    const array = await this.getArray<T>(key);
    array.push(item);
    await this.set(key, array);
  },

  async updateInArray<T extends { id: string }>(
    key: string,
    id: string,
    updates: Partial<T>
  ): Promise<void> {
    const array = await this.getArray<T>(key);
    const index = array.findIndex((item) => item.id === id);
    if (index !== -1) {
      array[index] = { ...array[index], ...updates };
      await this.set(key, array);
    }
  },

  async removeFromArray<T extends { id: string }>(key: string, id: string): Promise<void> {
    const array = await this.getArray<T>(key);
    const filtered = array.filter((item) => item.id !== id);
    await this.set(key, filtered);
  },

  async findInArray<T extends { id: string }>(key: string, id: string): Promise<T | null> {
    const array = await this.getArray<T>(key);
    return array.find((item) => item.id === id) ?? null;
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },
};
