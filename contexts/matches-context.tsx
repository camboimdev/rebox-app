import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { matchService } from '@/services/match-service';
import { useAuth } from '@/contexts/auth-context';
import type { Match, Message, Item, MatchesContextType } from '@/types';

const MatchesContext = createContext<MatchesContextType | null>(null);

export function MatchesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [pendingMatch, setPendingMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshMatches = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const userMatches = await matchService.getMatches(user.id);
      setMatches(userMatches);
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshMatches();
    } else {
      setMatches([]);
      setPendingMatch(null);
    }
  }, [user, refreshMatches]);

  const likeItem = useCallback(
    async (item: Item): Promise<Match | null> => {
      if (!user) throw new Error('Usuário não autenticado');

      const match = await matchService.recordLike(user.id, item.id, item.userId);

      if (match) {
        setPendingMatch(match);
        setMatches((prev) => [match, ...prev]);
      }

      return match;
    },
    [user]
  );

  const dislikeItem = useCallback(
    async (item: Item): Promise<void> => {
      if (!user) throw new Error('Usuário não autenticado');

      await matchService.recordDislike(user.id, item.id);
    },
    [user]
  );

  const getMessages = useCallback(async (matchId: string): Promise<Message[]> => {
    return matchService.getMessages(matchId);
  }, []);

  const sendMessage = useCallback(
    async (matchId: string, text: string): Promise<void> => {
      if (!user) throw new Error('Usuário não autenticado');

      await matchService.sendMessage(matchId, user.id, text);

      // Update lastMessageAt in local state
      setMatches((prev) =>
        prev.map((m) => (m.id === matchId ? { ...m, lastMessageAt: Date.now() } : m))
      );
    },
    [user]
  );

  const clearPendingMatch = useCallback(() => {
    setPendingMatch(null);
  }, []);

  const value: MatchesContextType = {
    matches,
    pendingMatch,
    isLoading,
    likeItem,
    dislikeItem,
    getMessages,
    sendMessage,
    clearPendingMatch,
    refreshMatches,
  };

  return <MatchesContext.Provider value={value}>{children}</MatchesContext.Provider>;
}

export function useMatches(): MatchesContextType {
  const context = useContext(MatchesContext);
  if (!context) {
    throw new Error('useMatches must be used within a MatchesProvider');
  }
  return context;
}
