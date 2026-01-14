import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/hooks/use-auth';
import { useMatches } from '@/hooks/use-matches';
import { MatchCard } from '@/components/match';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { authService } from '@/services/auth-service';
import { itemService } from '@/services/item-service';
import { matchService } from '@/services/match-service';
import type { Match, User, Item, Message } from '@/types';

interface EnrichedMatch {
  match: Match;
  otherUser: User;
  matchedItems: Item[];
  lastMessage?: string;
  unreadCount: number;
}

export default function MatchesScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const tintColor = useThemeColor({}, 'tint');

  const { user } = useAuth();
  const { matches, isLoading, refreshMatches } = useMatches();

  const [enrichedMatches, setEnrichedMatches] = useState<EnrichedMatch[]>([]);
  const [isEnriching, setIsEnriching] = useState(false);

  const enrichMatches = useCallback(async () => {
    if (!user || matches.length === 0) {
      setEnrichedMatches([]);
      return;
    }

    setIsEnriching(true);
    try {
      const enriched = await Promise.all(
        matches.map(async (match) => {
          const otherUserId = match.userIds.find((id) => id !== user.id) ?? match.userIds[0];
          const otherUser = await authService.getUserById(otherUserId);
          const matchedItems = await itemService.getItemsByIds(match.itemIds);
          const messages = await matchService.getMessages(match.id);
          const unreadMessages = messages.filter(
            (m) => m.senderId !== user.id && !m.isRead
          );

          return {
            match,
            otherUser: otherUser ?? {
              id: otherUserId,
              name: 'Usuário',
              email: null,
              photoUrl: null,
              isAnonymous: true,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
            matchedItems,
            lastMessage: messages.length > 0 ? messages[messages.length - 1].text : undefined,
            unreadCount: unreadMessages.length,
          };
        })
      );

      setEnrichedMatches(enriched);
    } catch (error) {
      console.error('Error enriching matches:', error);
    } finally {
      setIsEnriching(false);
    }
  }, [user, matches]);

  useEffect(() => {
    enrichMatches();
  }, [enrichMatches]);

  const handleMatchPress = (matchId: string) => {
    router.push(`/chat/${matchId}`);
  };

  const renderItem = ({ item }: { item: EnrichedMatch }) => (
    <MatchCard
      match={item.match}
      otherUser={item.otherUser}
      matchedItems={item.matchedItems}
      lastMessage={item.lastMessage}
      unreadCount={item.unreadCount}
      onPress={() => handleMatchPress(item.match.id)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol name="heart" size={64} color={textSecondaryColor} />
      <Text style={[styles.emptyTitle, { color: textColor }]}>
        Nenhum match ainda
      </Text>
      <Text style={[styles.emptySubtitle, { color: textSecondaryColor }]}>
        Continue explorando itens para encontrar trocas!
      </Text>
    </View>
  );

  if (isLoading || isEnriching) {
    return (
      <SafeAreaView style={[styles.container, styles.centered, { backgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Matches</Text>
      </View>

      <FlatList
        data={enrichedMatches}
        renderItem={renderItem}
        keyExtractor={(item) => item.match.id}
        contentContainerStyle={[
          styles.listContent,
          enrichedMatches.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        onRefresh={refreshMatches}
        refreshing={isLoading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});
