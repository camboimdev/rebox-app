import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getCategoryLabel } from '@/constants/categories';
import type { Item } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
const SWIPE_THRESHOLD = 100;

interface SwipeCardProps {
  item: Item;
  translateX: Animated.SharedValue<number>;
  isTop?: boolean;
}

export function SwipeCard({ item, translateX, isTop = false }: SwipeCardProps) {
  const cardBackgroundColor = useThemeColor({}, 'card');
  const likeColor = useThemeColor({}, 'like');
  const dislikeColor = useThemeColor({}, 'dislike');

  const likeOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const nopeOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  return (
    <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
      <Image source={{ uri: item.photoUrl }} style={styles.image} resizeMode="cover" />

      {/* Gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.category}>
          {getCategoryLabel(item.category)}
        </Text>
        <Text style={styles.description} numberOfLines={3}>
          {item.description}
        </Text>
      </View>

      {/* Like overlay */}
      {isTop && (
        <Animated.View style={[styles.overlay, styles.likeOverlay, likeOverlayStyle]}>
          <View style={[styles.overlayBadge, { borderColor: likeColor }]}>
            <Text style={[styles.overlayText, { color: likeColor }]}>LIKE</Text>
          </View>
        </Animated.View>
      )}

      {/* Nope overlay */}
      {isTop && (
        <Animated.View style={[styles.overlay, styles.nopeOverlay, nopeOverlayStyle]}>
          <View style={[styles.overlayBadge, { borderColor: dislikeColor }]}>
            <Text style={[styles.overlayText, { color: dislikeColor }]}>NOPE</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#fff',
  },
  category: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: 'rgba(255,255,255,0.8)',
  },
  description: {
    fontSize: 15,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.9)',
  },
  overlay: {
    position: 'absolute',
    top: 40,
    padding: 8,
  },
  likeOverlay: {
    left: 20,
    transform: [{ rotate: '-15deg' }],
  },
  nopeOverlay: {
    right: 20,
    transform: [{ rotate: '15deg' }],
  },
  overlayBadge: {
    borderWidth: 4,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  overlayText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
});
