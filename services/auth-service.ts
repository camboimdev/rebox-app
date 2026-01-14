import { storage } from './storage';
import { generateId } from '@/utils/id-generator';
import type { User, LoginCredentials, RegisterData, STORAGE_KEYS } from '@/types';

const CURRENT_USER_KEY = '@rebox/current_user';
const USERS_KEY = '@rebox/users';

interface StoredUser extends User {
  passwordHash: string;
}

// Simple hash for MVP (not secure for production)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

export const authService = {
  async register(data: RegisterData): Promise<User> {
    const users = await storage.getArray<StoredUser>(USERS_KEY);

    // Check if email already exists
    const existingUser = users.find((u) => u.email === data.email);
    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    const now = Date.now();
    const newUser: StoredUser = {
      id: generateId(),
      email: data.email,
      name: data.name,
      photoUrl: null,
      isAnonymous: false,
      createdAt: now,
      updatedAt: now,
      passwordHash: simpleHash(data.password),
    };

    await storage.appendToArray(USERS_KEY, newUser);

    // Return user without password
    const { passwordHash, ...user } = newUser;
    await storage.set(CURRENT_USER_KEY, user);

    return user;
  },

  async login(credentials: LoginCredentials): Promise<User> {
    const users = await storage.getArray<StoredUser>(USERS_KEY);

    const storedUser = users.find((u) => u.email === credentials.email);
    if (!storedUser) {
      throw new Error('Email não encontrado');
    }

    if (storedUser.passwordHash !== simpleHash(credentials.password)) {
      throw new Error('Senha incorreta');
    }

    const { passwordHash, ...user } = storedUser;
    await storage.set(CURRENT_USER_KEY, user);

    return user;
  },

  async loginAnonymously(name: string): Promise<User> {
    const now = Date.now();
    const newUser: User = {
      id: generateId(),
      email: null,
      name: name || 'Usuário Anônimo',
      photoUrl: null,
      isAnonymous: true,
      createdAt: now,
      updatedAt: now,
    };

    await storage.set(CURRENT_USER_KEY, newUser);

    // Also save to users list for consistency
    await storage.appendToArray(USERS_KEY, { ...newUser, passwordHash: '' });

    return newUser;
  },

  async logout(): Promise<void> {
    await storage.remove(CURRENT_USER_KEY);
  },

  async getCurrentUser(): Promise<User | null> {
    return storage.get<User>(CURRENT_USER_KEY);
  },

  async updateProfile(userId: string, updates: Partial<Pick<User, 'name' | 'photoUrl'>>): Promise<User> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser || currentUser.id !== userId) {
      throw new Error('Usuário não encontrado');
    }

    const updatedUser: User = {
      ...currentUser,
      ...updates,
      updatedAt: Date.now(),
    };

    await storage.set(CURRENT_USER_KEY, updatedUser);

    // Update in users array too
    await storage.updateInArray<StoredUser>(USERS_KEY, userId, {
      ...updates,
      updatedAt: updatedUser.updatedAt,
    } as Partial<StoredUser>);

    return updatedUser;
  },

  async getUserById(userId: string): Promise<User | null> {
    const users = await storage.getArray<StoredUser>(USERS_KEY);
    const user = users.find((u) => u.id === userId);
    if (!user) return null;

    const { passwordHash, ...userData } = user;
    return userData;
  },
};
