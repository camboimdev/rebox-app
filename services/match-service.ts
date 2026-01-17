import { supabase } from '@/lib/supabase';
import type { Like, Match, Message } from '@/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Database row types
interface DbMatch {
  id: string;
  user_a_id: string;
  user_b_id: string;
  item_a_id: string;
  item_b_id: string;
  created_at: string;
  last_message_at: string | null;
}

interface DbMessage {
  id: string;
  match_id: string;
  sender_id: string;
  text: string;
  is_read: boolean;
  created_at: string;
}

interface DbLike {
  id: string;
  from_user_id: string;
  to_item_id: string;
  to_user_id: string;
  created_at: string;
}

interface MutualLikesResult {
  has_mutual_likes: boolean;
  item_a_id: string | null;
  item_b_id: string | null;
}

export const matchService = {
  async recordLike(fromUserId: string, toItemId: string, toUserId: string): Promise<Match | null> {
    // Insert the like
    const { error: likeError } = await supabase
      .from('likes')
      .insert({
        from_user_id: fromUserId,
        to_item_id: toItemId,
        to_user_id: toUserId,
      } as Partial<DbLike>);

    if (likeError) {
      // Ignore duplicate likes
      if (likeError.code !== '23505') {
        throw new Error(`Failed to record like: ${likeError.message}`);
      }
    }

    // Check for mutual match
    const match = await this.checkForMatch(fromUserId, toUserId);
    return match;
  },

  async recordDislike(fromUserId: string, toItemId: string): Promise<void> {
    const { error } = await supabase
      .from('dislikes')
      .insert({
        from_user_id: fromUserId,
        to_item_id: toItemId,
      } as { from_user_id: string; to_item_id: string });

    if (error) {
      // Ignore duplicate dislikes
      if (error.code !== '23505') {
        throw new Error(`Failed to record dislike: ${error.message}`);
      }
    }
  },

  async checkForMatch(userAId: string, userBId: string): Promise<Match | null> {
    // Check if they already matched
    const { data: existingMatch } = await supabase
      .from('matches')
      .select('*')
      .or(`and(user_a_id.eq.${userAId},user_b_id.eq.${userBId}),and(user_a_id.eq.${userBId},user_b_id.eq.${userAId})`)
      .single();

    if (existingMatch) {
      return null; // Already matched
    }

    // Use the database function to check mutual likes
    const { data: mutualLikesResult, error } = await supabase
      .rpc('check_mutual_likes', { user_a: userAId, user_b: userBId });

    if (error) {
      throw new Error(`Failed to check mutual likes: ${error.message}`);
    }

    const results = mutualLikesResult as MutualLikesResult[] | null;
    const result = results?.[0];

    if (!result?.has_mutual_likes || !result.item_a_id || !result.item_b_id) {
      return null;
    }

    // Create the match
    const { data: newMatch, error: matchError } = await supabase
      .from('matches')
      .insert({
        user_a_id: userAId,
        user_b_id: userBId,
        item_a_id: result.item_a_id,
        item_b_id: result.item_b_id,
      } as Partial<DbMatch>)
      .select()
      .single();

    if (matchError) {
      // Ignore duplicate match error
      if (matchError.code !== '23505') {
        throw new Error(`Failed to create match: ${matchError.message}`);
      }
      return null;
    }

    return this.mapDbMatchToMatch(newMatch as DbMatch);
  },

  async getMatches(userId: string): Promise<Match[]> {
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (error) {
      throw new Error(`Failed to get matches: ${error.message}`);
    }

    return (matches as DbMatch[]).map(this.mapDbMatchToMatch);
  },

  async getMatchById(matchId: string): Promise<Match | null> {
    const { data: match, error } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get match: ${error.message}`);
    }

    return this.mapDbMatchToMatch(match as DbMatch);
  },

  async getMessages(matchId: string): Promise<Message[]> {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to get messages: ${error.message}`);
    }

    return (messages as DbMessage[]).map(this.mapDbMessageToMessage);
  },

  async sendMessage(matchId: string, senderId: string, text: string): Promise<Message> {
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: senderId,
        text,
      } as Partial<DbMessage>)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }

    const dbMessage = message as DbMessage;

    // Update match lastMessageAt
    await supabase
      .from('matches')
      .update({ last_message_at: dbMessage.created_at } as Partial<DbMatch>)
      .eq('id', matchId);

    return this.mapDbMessageToMessage(dbMessage);
  },

  async markMessagesAsRead(matchId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true } as Partial<DbMessage>)
      .eq('match_id', matchId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) {
      throw new Error(`Failed to mark messages as read: ${error.message}`);
    }
  },

  async getUnreadCount(userId: string): Promise<number> {
    // Get user's matches
    const { data: matches } = await supabase
      .from('matches')
      .select('id')
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`);

    if (!matches || matches.length === 0) {
      return 0;
    }

    const matchIds = (matches as { id: string }[]).map((m) => m.id);

    // Count unread messages
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('match_id', matchIds)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) {
      throw new Error(`Failed to get unread count: ${error.message}`);
    }

    return count || 0;
  },

  async getLikes(userId: string): Promise<Like[]> {
    const { data: likes, error } = await supabase
      .from('likes')
      .select('*')
      .eq('from_user_id', userId);

    if (error) {
      throw new Error(`Failed to get likes: ${error.message}`);
    }

    return (likes as DbLike[]).map(this.mapDbLikeToLike);
  },

  // Real-time subscriptions
  subscribeToMessages(
    matchId: string,
    onMessage: (message: Message) => void
  ): RealtimeChannel {
    return supabase
      .channel(`messages:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          onMessage(this.mapDbMessageToMessage(payload.new as DbMessage));
        }
      )
      .subscribe();
  },

  subscribeToMatches(
    userId: string,
    onMatch: (match: Match) => void
  ): RealtimeChannel {
    return supabase
      .channel(`matches:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
        },
        (payload) => {
          const match = payload.new as DbMatch;
          if (match.user_a_id === userId || match.user_b_id === userId) {
            onMatch(this.mapDbMatchToMatch(match));
          }
        }
      )
      .subscribe();
  },

  unsubscribe(channel: RealtimeChannel): void {
    supabase.removeChannel(channel);
  },

  // Helper mapping functions
  mapDbMatchToMatch(dbMatch: DbMatch): Match {
    return {
      id: dbMatch.id,
      userIds: [dbMatch.user_a_id, dbMatch.user_b_id],
      itemIds: [dbMatch.item_a_id, dbMatch.item_b_id],
      createdAt: new Date(dbMatch.created_at).getTime(),
      lastMessageAt: dbMatch.last_message_at
        ? new Date(dbMatch.last_message_at).getTime()
        : null,
    };
  },

  mapDbMessageToMessage(dbMessage: DbMessage): Message {
    return {
      id: dbMessage.id,
      matchId: dbMessage.match_id,
      senderId: dbMessage.sender_id,
      text: dbMessage.text,
      createdAt: new Date(dbMessage.created_at).getTime(),
      isRead: dbMessage.is_read,
    };
  },

  mapDbLikeToLike(dbLike: DbLike): Like {
    return {
      id: dbLike.id,
      fromUserId: dbLike.from_user_id,
      toItemId: dbLike.to_item_id,
      toUserId: dbLike.to_user_id,
      createdAt: new Date(dbLike.created_at).getTime(),
    };
  },
};
