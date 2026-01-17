// ============ USER ============
export interface User {
  id: string;
  email: string | null;
  name: string;
  photoUrl: string | null;
  isAnonymous: boolean;
  createdAt: number;
  updatedAt: number;
}

// ============ ITEM ============
export type ItemCategory =
  | 'electronics'
  | 'clothing'
  | 'furniture'
  | 'books'
  | 'sports'
  | 'toys'
  | 'home'
  | 'other';

export interface Item {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: ItemCategory;
  photoUrl: string;
  createdAt: number;
  updatedAt: number;
}

// ============ LIKE ============
export interface Like {
  id: string;
  fromUserId: string;
  toItemId: string;
  toUserId: string;
  createdAt: number;
}

// ============ DISLIKE ============
export interface Dislike {
  id: string;
  fromUserId: string;
  toItemId: string;
  createdAt: number;
}

// ============ MATCH ============
export interface Match {
  id: string;
  userIds: [string, string];
  itemIds: [string, string];
  createdAt: number;
  lastMessageAt: number | null;
}

// ============ MESSAGE ============
export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  createdAt: number;
  isRead: boolean;
}

// ============ CONTEXT TYPES ============
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'photoUrl'>>) => Promise<void>;
}

export interface ItemsContextType {
  userItems: Item[];
  feedItems: Item[];
  isLoading: boolean;
  addItem: (item: Omit<Item, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<Item>;
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  refreshFeed: () => Promise<void>;
  refreshUserItems: () => Promise<void>;
}

export interface MatchesContextType {
  matches: Match[];
  pendingMatch: Match | null;
  isLoading: boolean;
  likeItem: (item: Item) => Promise<Match | null>;
  dislikeItem: (item: Item) => Promise<void>;
  getMessages: (matchId: string) => Promise<Message[]>;
  sendMessage: (matchId: string, text: string) => Promise<void>;
  clearPendingMatch: () => void;
  refreshMatches: () => Promise<void>;
}
