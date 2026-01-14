import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/hooks/use-auth';
import { useItems } from '@/hooks/use-items';
import { useMatches } from '@/hooks/use-matches';
import { AuthButton } from '@/components/auth';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ProfileScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const cardBackgroundColor = useThemeColor({}, 'card');
  const cardBorderColor = useThemeColor({}, 'cardBorder');
  const tintColor = useThemeColor({}, 'tint');

  const { user, logout, updateProfile, isLoading } = useAuth();
  const { userItems } = useItems();
  const { matches } = useMatches();

  const handleChangePhoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para mudar a foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        await updateProfile({ photoUrl: result.assets[0].uri });
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível atualizar a foto.');
      }
    }
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Perfil</Text>
      </View>

      <View style={styles.content}>
        {/* Avatar */}
        <TouchableOpacity style={styles.avatarContainer} onPress={handleChangePhoto}>
          {user?.photoUrl ? (
            <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: tintColor }]}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </Text>
            </View>
          )}
          <View style={[styles.editBadge, { backgroundColor: tintColor }]}>
            <IconSymbol name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Name */}
        <Text style={[styles.name, { color: textColor }]}>{user?.name ?? 'Usuário'}</Text>
        <Text style={[styles.email, { color: textSecondaryColor }]}>
          {user?.email ?? 'Conta anônima'}
        </Text>

        {/* Stats */}
        <View style={[styles.statsContainer, { backgroundColor: cardBackgroundColor, borderColor: cardBorderColor }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: textColor }]}>{userItems.length}</Text>
            <Text style={[styles.statLabel, { color: textSecondaryColor }]}>Itens</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: cardBorderColor }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: textColor }]}>{matches.length}</Text>
            <Text style={[styles.statLabel, { color: textSecondaryColor }]}>Matches</Text>
          </View>
        </View>

        {/* Account type badge */}
        {user?.isAnonymous && (
          <View style={[styles.badge, { backgroundColor: cardBackgroundColor, borderColor: cardBorderColor }]}>
            <IconSymbol name="person.fill.questionmark" size={16} color={textSecondaryColor} />
            <Text style={[styles.badgeText, { color: textSecondaryColor }]}>
              Conta anônima - seus dados serão perdidos ao sair
            </Text>
          </View>
        )}

        {/* Logout button */}
        <AuthButton
          title="Sair da conta"
          variant="secondary"
          onPress={handleLogout}
          loading={isLoading}
          style={styles.logoutButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    width: '100%',
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    marginHorizontal: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    gap: 8,
  },
  badgeText: {
    fontSize: 13,
    flex: 1,
  },
  logoutButton: {
    width: '100%',
    marginTop: 'auto',
    marginBottom: 24,
  },
});
