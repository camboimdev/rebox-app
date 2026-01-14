import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useItems } from '@/hooks/use-items';
import { useMatches } from '@/hooks/use-matches';
import { SwipeDeck } from '@/components/swipe';
import { MatchModal } from '@/components/match';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { itemService } from '@/services/item-service';
import type { Item } from '@/types';

export default function SwipeFeedScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const tintColor = useThemeColor({}, 'tint');

  const { feedItems, refreshFeed, isLoading } = useItems();
  const { likeItem, dislikeItem, pendingMatch, clearPendingMatch } = useMatches();

  const [localFeedItems, setLocalFeedItems] = useState<Item[]>([]);
  const [matchedItems, setMatchedItems] = useState<Item[]>([]);

  useEffect(() => {
    setLocalFeedItems(feedItems);
  }, [feedItems]);

  useEffect(() => {
    const loadMatchedItems = async () => {
      if (pendingMatch) {
        const items = await itemService.getItemsByIds(pendingMatch.itemIds);
        setMatchedItems(items);
      }
    };
    loadMatchedItems();
  }, [pendingMatch]);

  const handleSwipeRight = useCallback(
    async (item: Item) => {
      // Remove item from local state immediately for smooth UX
      setLocalFeedItems((prev) => prev.filter((i) => i.id !== item.id));

      try {
        await likeItem(item);
      } catch (error) {
        console.error('Error liking item:', error);
      }
    },
    [likeItem]
  );

  const handleSwipeLeft = useCallback(
    async (item: Item) => {
      // Remove item from local state immediately for smooth UX
      setLocalFeedItems((prev) => prev.filter((i) => i.id !== item.id));

      try {
        await dislikeItem(item);
      } catch (error) {
        console.error('Error disliking item:', error);
      }
    },
    [dislikeItem]
  );

  const handleSendMessage = () => {
    if (pendingMatch) {
      clearPendingMatch();
      router.push(`/chat/${pendingMatch.id}`);
    }
  };

  const handleKeepSwiping = () => {
    clearPendingMatch();
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol name="sparkles" size={80} color={textSecondaryColor} />
      <Text style={[styles.emptyTitle, { color: textColor }]}>
        Nenhum item disponível
      </Text>
      <Text style={[styles.emptySubtitle, { color: textSecondaryColor }]}>
        Não há mais itens para explorar no momento.{'\n'}
        Volte mais tarde ou adicione seus próprios itens!
      </Text>
    </View>
  );

  if (isLoading && localFeedItems.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.centered, { backgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
        <Text style={[styles.loadingText, { color: textSecondaryColor }]}>
          Carregando itens...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>Descobrir</Text>
        </View>

        {localFeedItems.length > 0 ? (
          <SwipeDeck
            items={localFeedItems}
            onSwipeRight={handleSwipeRight}
            onSwipeLeft={handleSwipeLeft}
          />
        ) : (
          renderEmpty()
        )}

        <MatchModal
          visible={!!pendingMatch}
          match={pendingMatch}
          items={matchedItems}
          onSendMessage={handleSendMessage}
          onKeepSwiping={handleKeepSwiping}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
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
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
