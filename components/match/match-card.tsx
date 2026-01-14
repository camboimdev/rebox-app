import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Match, User, Item } from '@/types';

interface MatchCardProps {
  match: Match;
  otherUser: User;
  matchedItems: Item[];
  lastMessage?: string;
  unreadCount?: number;
  onPress: () => void;
}

export function MatchCard({
  match,
  otherUser,
  matchedItems,
  lastMessage,
  unreadCount = 0,
  onPress,
}: MatchCardProps) {
  const backgroundColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'cardBorder');
  const matchColor = useThemeColor({}, 'match');

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    }
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor, borderColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {otherUser.photoUrl ? (
          <Image source={{ uri: otherUser.photoUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: matchColor }]}>
            <Text style={styles.avatarText}>{otherUser.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        {unreadCount > 0 && (
          <View style={[styles.badge, { backgroundColor: matchColor }]}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
            {otherUser.name}
          </Text>
          <Text style={[styles.time, { color: textSecondaryColor }]}>
            {formatDate(match.lastMessageAt ?? match.createdAt)}
          </Text>
        </View>

        <Text
          style={[
            styles.message,
            { color: unreadCount > 0 ? textColor : textSecondaryColor },
            unreadCount > 0 && styles.unreadMessage,
          ]}
          numberOfLines={1}
        >
          {lastMessage || 'Envie uma mensagem para começar a conversa!'}
        </Text>

        {matchedItems.length > 0 && (
          <View style={styles.itemsPreview}>
            {matchedItems.slice(0, 2).map((item) => (
              <Image
                key={item.id}
                source={{ uri: item.photoUrl }}
                style={[styles.itemThumb, { borderColor }]}
              />
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  time: {
    fontSize: 12,
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    marginBottom: 8,
  },
  unreadMessage: {
    fontWeight: '500',
  },
  itemsPreview: {
    flexDirection: 'row',
    gap: 8,
  },
  itemThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
  },
});
