import { storage } from './storage';
import { generateId } from '@/utils/id-generator';
import type { Like, Dislike, Match, Message } from '@/types';

const LIKES_KEY = '@rebox/likes';
const DISLIKES_KEY = '@rebox/dislikes';
const MATCHES_KEY = '@rebox/matches';
const MESSAGES_KEY = '@rebox/messages';

export const matchService = {
  async recordLike(fromUserId: string, toItemId: string, toUserId: string): Promise<Match | null> {
    const like: Like = {
      id: generateId(),
      fromUserId,
      toItemId,
      toUserId,
      createdAt: Date.now(),
    };

    await storage.appendToArray(LIKES_KEY, like);

    // Check for mutual match
    const match = await this.checkForMatch(fromUserId, toUserId);
    return match;
  },

  async recordDislike(fromUserId: string, toItemId: string): Promise<void> {
    const dislike: Dislike = {
      id: generateId(),
      fromUserId,
      toItemId,
      createdAt: Date.now(),
    };

    await storage.appendToArray(DISLIKES_KEY, dislike);
  },

  async checkForMatch(userAId: string, userBId: string): Promise<Match | null> {
    const likes = await storage.getArray<Like>(LIKES_KEY);
    const matches = await storage.getArray<Match>(MATCHES_KEY);

    // Check if they already matched
    const existingMatch = matches.find(
      (m) =>
        (m.userIds[0] === userAId && m.userIds[1] === userBId) ||
        (m.userIds[0] === userBId && m.userIds[1] === userAId)
    );

    if (existingMatch) return null;

    // Check if userA liked any item from userB
    const userALikes = likes.filter((l) => l.fromUserId === userAId && l.toUserId === userBId);

    // Check if userB liked any item from userA
    const userBLikes = likes.filter((l) => l.fromUserId === userBId && l.toUserId === userAId);

    // If both have liked each other's items, create a match
    if (userALikes.length > 0 && userBLikes.length > 0) {
      const match: Match = {
        id: generateId(),
        userIds: [userAId, userBId],
        itemIds: [userBLikes[0].toItemId, userALikes[0].toItemId],
        createdAt: Date.now(),
        lastMessageAt: null,
      };

      await storage.appendToArray(MATCHES_KEY, match);
      return match;
    }

    return null;
  },

  async getMatches(userId: string): Promise<Match[]> {
    const matches = await storage.getArray<Match>(MATCHES_KEY);
    return matches
      .filter((m) => m.userIds.includes(userId))
      .sort((a, b) => (b.lastMessageAt ?? b.createdAt) - (a.lastMessageAt ?? a.createdAt));
  },

  async getMatchById(matchId: string): Promise<Match | null> {
    return storage.findInArray<Match>(MATCHES_KEY, matchId);
  },

  async getMessages(matchId: string): Promise<Message[]> {
    const messages = await storage.getArray<Message>(MESSAGES_KEY);
    return messages.filter((m) => m.matchId === matchId).sort((a, b) => a.createdAt - b.createdAt);
  },

  async sendMessage(matchId: string, senderId: string, text: string): Promise<Message> {
    const message: Message = {
      id: generateId(),
      matchId,
      senderId,
      text,
      createdAt: Date.now(),
      isRead: false,
    };

    await storage.appendToArray(MESSAGES_KEY, message);

    // Update match lastMessageAt
    await storage.updateInArray<Match>(MATCHES_KEY, matchId, {
      lastMessageAt: message.createdAt,
    });

    return message;
  },

  async markMessagesAsRead(matchId: string, userId: string): Promise<void> {
    const messages = await storage.getArray<Message>(MESSAGES_KEY);
    const updatedMessages = messages.map((m) => {
      if (m.matchId === matchId && m.senderId !== userId && !m.isRead) {
        return { ...m, isRead: true };
      }
      return m;
    });
    await storage.set(MESSAGES_KEY, updatedMessages);
  },

  async getUnreadCount(userId: string): Promise<number> {
    const matches = await this.getMatches(userId);
    const messages = await storage.getArray<Message>(MESSAGES_KEY);

    let count = 0;
    for (const match of matches) {
      const unread = messages.filter(
        (m) => m.matchId === match.id && m.senderId !== userId && !m.isRead
      );
      count += unread.length;
    }

    return count;
  },

  async getLikes(userId: string): Promise<Like[]> {
    const likes = await storage.getArray<Like>(LIKES_KEY);
    return likes.filter((l) => l.fromUserId === userId);
  },
};
