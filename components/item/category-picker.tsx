import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CATEGORIES, type CategoryInfo } from '@/constants/categories';
import type { ItemCategory } from '@/types';

interface CategoryPickerProps {
  selectedCategory: ItemCategory | null;
  onSelectCategory: (category: ItemCategory) => void;
}

export function CategoryPicker({ selectedCategory, onSelectCategory }: CategoryPickerProps) {
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const tintColor = useThemeColor({}, 'tint');
  const cardBorderColor = useThemeColor({}, 'cardBorder');
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: textSecondaryColor }]}>Categoria</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                {
                  backgroundColor: isSelected ? tintColor : backgroundColor,
                  borderColor: isSelected ? tintColor : cardBorderColor,
                },
              ]}
              onPress={() => onSelectCategory(category.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: isSelected ? '#fff' : textColor },
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  scrollContent: {
    paddingRight: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
