import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getCategoryLabel } from '@/constants/categories';
import type { Item } from '@/types';

interface ItemCardProps {
  item: Item;
  onPress?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export function ItemCard({ item, onPress, onDelete, showActions = false }: ItemCardProps) {
  const backgroundColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'cardBorder');
  const errorColor = useThemeColor({}, 'error');

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor, borderColor }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Image
        source={{ uri: item.photoUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.category, { color: textSecondaryColor }]}>
          {getCategoryLabel(item.category)}
        </Text>
        <Text style={[styles.description, { color: textSecondaryColor }]} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      {showActions && onDelete && (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={[styles.deleteText, { color: errorColor }]}>Remover</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  image: {
    width: 100,
    height: 100,
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 18,
  },
  deleteButton: {
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
