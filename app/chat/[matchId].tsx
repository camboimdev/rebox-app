import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/hooks/use-auth';
import { useMatches } from '@/hooks/use-matches';
import { MessageBubble, MessageInput } from '@/components/chat';
import { matchService } from '@/services/match-service';
import { authService } from '@/services/auth-service';
import type { Message, User, Match } from '@/types';

export default function ChatScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const tintColor = useThemeColor({}, 'tint');

  const { user } = useAuth();
  const { sendMessage } = useMatches();

  const [messages, setMessages] = useState<Message[]>([]);
  const [match, setMatch] = useState<Match | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const flatListRef = useRef<FlatList>(null);

  const loadChat = useCallback(async () => {
    if (!matchId || !user) return;

    setIsLoading(true);
    try {
      const matchData = await matchService.getMatchById(matchId);
      if (matchData) {
        setMatch(matchData);

        const otherUserId = matchData.userIds.find((id) => id !== user.id) ?? matchData.userIds[0];
        const userData = await authService.getUserById(otherUserId);
        setOtherUser(userData);

        const chatMessages = await matchService.getMessages(matchId);
        setMessages(chatMessages);

        // Mark messages as read
        await matchService.markMessagesAsRead(matchId, user.id);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      setIsLoading(false);
    }
  }, [matchId, user]);

  useEffect(() => {
    loadChat();
  }, [loadChat]);

  const handleSendMessage = async (text: string) => {
    if (!matchId) return;

    try {
      await sendMessage(matchId, text);

      // Reload messages
      const chatMessages = await matchService.getMessages(matchId);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble message={item} isOwnMessage={item.senderId === user?.id} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: textSecondaryColor }]}>
        Nenhuma mensagem ainda.{'\n'}Inicie a conversa!
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: otherUser?.name ?? 'Chat',
          headerBackTitle: 'Voltar',
        }}
      />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            messages.length === 0 && styles.emptyList,
          ]}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          inverted={messages.length > 0}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
            }
          }}
        />
        <MessageInput onSend={handleSendMessage} />
      </KeyboardAvoidingView>
    </>
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
  listContent: {
    paddingVertical: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
