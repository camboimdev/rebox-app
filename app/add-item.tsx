import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useItems } from '@/hooks/use-items';
import { AuthInput, AuthButton } from '@/components/auth';
import { CategoryPicker } from '@/components/item';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { ItemCategory } from '@/types';

export default function AddItemScreen() {
  const { addItem } = useItems();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const cardBorderColor = useThemeColor({}, 'cardBorder');
  const backgroundSecondary = useThemeColor({}, 'backgroundSecondary');

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ItemCategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    photo?: string;
    title?: string;
    description?: string;
    category?: string;
  }>({});

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para adicionar fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUrl(result.assets[0].uri);
      setErrors((prev) => ({ ...prev, photo: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!photoUrl) {
      newErrors.photo = 'Adicione uma foto do item';
    }

    if (!title.trim()) {
      newErrors.title = 'Título é obrigatório';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Título deve ter pelo menos 3 caracteres';
    } else if (title.trim().length > 50) {
      newErrors.title = 'Título deve ter no máximo 50 caracteres';
    }

    if (!description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Descrição deve ter pelo menos 10 caracteres';
    } else if (description.trim().length > 200) {
      newErrors.description = 'Descrição deve ter no máximo 200 caracteres';
    }

    if (!category) {
      newErrors.category = 'Selecione uma categoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!photoUrl || !category) return;

    setIsLoading(true);
    try {
      await addItem({
        title: title.trim(),
        description: description.trim(),
        category,
        photoUrl,
      });
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar o item. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={[
            styles.imageContainer,
            {
              backgroundColor: backgroundSecondary,
              borderColor: errors.photo ? '#ef4444' : cardBorderColor,
            },
          ]}
          onPress={pickImage}
          activeOpacity={0.7}
        >
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <IconSymbol name="camera" size={48} color={textSecondaryColor} />
              <Text style={[styles.imagePlaceholderText, { color: textSecondaryColor }]}>
                Adicionar foto
              </Text>
            </View>
          )}
        </TouchableOpacity>
        {errors.photo && <Text style={styles.errorText}>{errors.photo}</Text>}

        <View style={styles.form}>
          <AuthInput
            label="Título"
            placeholder="Ex: iPhone 12 Pro"
            value={title}
            onChangeText={setTitle}
            error={errors.title}
            maxLength={50}
          />

          <AuthInput
            label="Descrição"
            placeholder="Descreva o estado e detalhes do item"
            value={description}
            onChangeText={setDescription}
            error={errors.description}
            multiline
            numberOfLines={4}
            style={styles.descriptionInput}
            maxLength={200}
          />

          <CategoryPicker
            selectedCategory={category}
            onSelectCategory={(cat) => {
              setCategory(cat);
              setErrors((prev) => ({ ...prev, category: undefined }));
            }}
          />
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

          <AuthButton
            title="Adicionar Item"
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  imageContainer: {
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 16,
    marginTop: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginBottom: 8,
  },
  form: {
    marginTop: 16,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  submitButton: {
    marginTop: 24,
  },
});
