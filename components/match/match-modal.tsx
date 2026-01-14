import { View, Text, StyleSheet, Modal, Image, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Match, Item } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MatchModalProps {
  visible: boolean;
  match: Match | null;
  items: Item[];
  onSendMessage: () => void;
  onKeepSwiping: () => void;
}

export function MatchModal({
  visible,
  match,
  items,
  onSendMessage,
  onKeepSwiping,
}: MatchModalProps) {
  if (!match || items.length < 2) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <LinearGradient
          colors={['rgba(236,72,153,0.95)', 'rgba(168,85,247,0.95)']}
          style={styles.container}
        >
          <Text style={styles.title}>{"It's a Match!"}</Text>
          <Text style={styles.subtitle}>Vocês demonstraram interesse nos itens um do outro</Text>

          <View style={styles.itemsContainer}>
            <View style={styles.itemWrapper}>
              <Image source={{ uri: items[0].photoUrl }} style={styles.itemImage} />
              <Text style={styles.itemTitle} numberOfLines={1}>
                {items[0].title}
              </Text>
            </View>

            <View style={styles.heartContainer}>
              <Text style={styles.heart}>❤️</Text>
            </View>

            <View style={styles.itemWrapper}>
              <Image source={{ uri: items[1].photoUrl }} style={styles.itemImage} />
              <Text style={styles.itemTitle} numberOfLines={1}>
                {items[1].title}
              </Text>
            </View>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.messageButton]}
              onPress={onSendMessage}
              activeOpacity={0.8}
            >
              <Text style={styles.messageButtonText}>Enviar Mensagem</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.keepSwipingButton]}
              onPress={onKeepSwiping}
              activeOpacity={0.8}
            >
              <Text style={styles.keepSwipingButtonText}>Continuar Navegando</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: SCREEN_WIDTH - 32,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 32,
  },
  itemsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  itemWrapper: {
    alignItems: 'center',
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#fff',
  },
  itemTitle: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    marginTop: 8,
    maxWidth: 100,
    textAlign: 'center',
  },
  heartContainer: {
    marginHorizontal: 16,
  },
  heart: {
    fontSize: 40,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  button: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageButton: {
    backgroundColor: '#fff',
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ec4899',
  },
  keepSwipingButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#fff',
  },
  keepSwipingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
