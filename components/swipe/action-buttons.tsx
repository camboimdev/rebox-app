import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface ActionButtonsProps {
  onLike: () => void;
  onDislike: () => void;
  disabled?: boolean;
}

export function ActionButtons({ onLike, onDislike, disabled = false }: ActionButtonsProps) {
  const likeColor = useThemeColor({}, 'like');
  const dislikeColor = useThemeColor({}, 'dislike');
  const cardColor = useThemeColor({}, 'card');

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.dislikeButton, { backgroundColor: cardColor }]}
        onPress={onDislike}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <IconSymbol name="xmark" size={32} color={dislikeColor} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.likeButton, { backgroundColor: cardColor }]}
        onPress={onLike}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <IconSymbol name="heart.fill" size={32} color={likeColor} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingVertical: 20,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dislikeButton: {},
  likeButton: {},
});
