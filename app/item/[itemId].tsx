import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { itemService } from '@/services/item-service';
import { authService } from '@/services/auth-service';
import { getCategoryLabel } from '@/constants/categories';
import type { Item, User } from '@/types';

export default function ItemDetailScreen() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const tintColor = useThemeColor({}, 'tint');
  const cardBorderColor = useThemeColor({}, 'cardBorder');

  const [item, setItem] = useState<Item | null>(null);
  const [owner, setOwner] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadItem = async () => {
      if (!itemId) return;

      try {
        const itemData = await itemService.getItemById(itemId);
        setItem(itemData);

        if (itemData) {
          const userData = await authService.getUserById(itemData.userId);
          setOwner(userData);
        }
      } catch (error) {
        console.error('Error loading item:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadItem();
  }, [itemId]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor }]}>
        <Text style={[styles.errorText, { color: textColor }]}>
          Item não encontrado
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: item.title,
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor }]}>
        <Image source={{ uri: item.photoUrl }} style={styles.image} resizeMode="cover" />

        <View style={styles.content}>
          <Text style={[styles.title, { color: textColor }]}>{item.title}</Text>

          <View style={[styles.categoryBadge, { borderColor: tintColor }]}>
            <Text style={[styles.categoryText, { color: tintColor }]}>
              {getCategoryLabel(item.category)}
            </Text>
          </View>

          <Text style={[styles.description, { color: textColor }]}>{item.description}</Text>

          <View style={[styles.ownerCard, { borderColor: cardBorderColor }]}>
            <View style={styles.ownerInfo}>
              {owner?.photoUrl ? (
                <Image source={{ uri: owner.photoUrl }} style={styles.ownerAvatar} />
              ) : (
                <View style={[styles.ownerAvatarPlaceholder, { backgroundColor: tintColor }]}>
                  <Text style={styles.ownerAvatarText}>
                    {owner?.name?.charAt(0).toUpperCase() ?? 'U'}
                  </Text>
                </View>
              )}
              <View>
                <Text style={[styles.ownerName, { color: textColor }]}>
                  {owner?.name ?? 'Usuário'}
                </Text>
                <Text style={[styles.ownerLabel, { color: textSecondaryColor }]}>
                  Proprietário
                </Text>
              </View>
            </View>
          </View>

          <Text style={[styles.dateText, { color: textSecondaryColor }]}>
            Publicado em {formatDate(item.createdAt)}
          </Text>
        </View>
      </ScrollView>
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
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  ownerCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  ownerAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  ownerLabel: {
    fontSize: 14,
  },
  dateText: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
  },
});
