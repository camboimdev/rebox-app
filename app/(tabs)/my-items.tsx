import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useItems } from '@/hooks/use-items';
import { ItemCard } from '@/components/item';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function MyItemsScreen() {
  const { userItems, deleteItem, isLoading } = useItems();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const tintColor = useThemeColor({}, 'tint');

  const handleDeleteItem = (itemId: string, itemTitle: string) => {
    Alert.alert(
      'Remover item',
      `Tem certeza que deseja remover "${itemTitle}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => deleteItem(itemId),
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: typeof userItems[0] }) => (
    <ItemCard
      item={item}
      showActions
      onDelete={() => handleDeleteItem(item.id, item.title)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol name="square.grid.2x2" size={64} color={textSecondaryColor} />
      <Text style={[styles.emptyTitle, { color: textColor }]}>
        Nenhum item cadastrado
      </Text>
      <Text style={[styles.emptySubtitle, { color: textSecondaryColor }]}>
        Adicione itens que você deseja trocar
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Meus Itens</Text>
        <Link href="/add-item" asChild>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: tintColor }]}>
            <IconSymbol name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </Link>
      </View>

      <FlatList
        data={userItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          userItems.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
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
