import { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { SwipeCard } from './swipe-card';
import { ActionButtons } from './action-buttons';
import type { Item } from '@/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = CARD_WIDTH * 1.4;
const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 500;

interface SwipeDeckProps {
  items: Item[];
  onSwipeLeft: (item: Item) => void;
  onSwipeRight: (item: Item) => void;
}

export function SwipeDeck({ items, onSwipeLeft, onSwipeRight }: SwipeDeckProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  const currentItem = items[0];

  // Reset position when item changes
  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
    cardOpacity.value = 1;
  }, [currentItem?.id]);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleSwipeComplete = (direction: 'left' | 'right', item: Item) => {
    triggerHaptic();
    if (direction === 'left') {
      onSwipeLeft(item);
    } else {
      onSwipeRight(item);
    }
  };

  const animateSwipe = (direction: 'left' | 'right') => {
    'worklet';
    if (!currentItem) return;

    const targetX = direction === 'left' ? -SCREEN_WIDTH * 1.2 : SCREEN_WIDTH * 1.2;
    const item = currentItem;

    translateX.value = withTiming(
      targetX,
      { duration: 250, easing: Easing.out(Easing.ease) },
      (finished) => {
        if (finished) {
          runOnJS(handleSwipeComplete)(direction, item);
        }
      }
    );
  };

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.3;
    })
    .onEnd((event) => {
      const shouldSwipeRight =
        translateX.value > SWIPE_THRESHOLD || event.velocityX > SWIPE_VELOCITY_THRESHOLD;
      const shouldSwipeLeft =
        translateX.value < -SWIPE_THRESHOLD || event.velocityX < -SWIPE_VELOCITY_THRESHOLD;

      if (shouldSwipeRight) {
        animateSwipe('right');
      } else if (shouldSwipeLeft) {
        animateSwipe('left');
      } else {
        // Snap back to center
        translateX.value = withTiming(0, { duration: 200 });
        translateY.value = withTiming(0, { duration: 200 });
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-20, 0, 20]
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
      opacity: cardOpacity.value,
    };
  });

  const handleManualLike = () => {
    if (!currentItem) return;
    animateSwipe('right');
  };

  const handleManualDislike = () => {
    if (!currentItem) return;
    animateSwipe('left');
  };

  if (!currentItem) {
    return (
      <View style={styles.container}>
        <View style={styles.cardContainer} />
        <ActionButtons
          onLike={handleManualLike}
          onDislike={handleManualDislike}
          disabled
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.cardWrapper, cardStyle]}>
            <SwipeCard item={currentItem} translateX={translateX} isTop />
          </Animated.View>
        </GestureDetector>
      </View>

      <ActionButtons
        onLike={handleManualLike}
        onDislike={handleManualDislike}
        disabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
});
