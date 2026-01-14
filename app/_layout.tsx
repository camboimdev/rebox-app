import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { ItemsProvider } from '@/contexts/items-context';
import { MatchesProvider } from '@/contexts/matches-context';
import { Colors } from '@/constants/theme';
import { seedDemoData } from '@/utils/seed-data';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [isSeeding, setIsSeeding] = useState(true);

  // Seed demo data on first launch
  useEffect(() => {
    const initSeedData = async () => {
      try {
        await seedDemoData();
      } catch (error) {
        console.error('Error seeding demo data:', error);
      } finally {
        setIsSeeding(false);
      }
    };
    initSeedData();
  }, []);

  useEffect(() => {
    if (isLoading || isSeeding) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if authenticated and in auth group
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, isSeeding, segments]);

  if (isLoading || isSeeding) {
    return (
      <View style={[styles.loading, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="add-item"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Adicionar Item',
          }}
        />
        <Stack.Screen
          name="chat/[matchId]"
          options={{
            headerShown: true,
            title: 'Chat',
          }}
        />
        <Stack.Screen
          name="item/[itemId]"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Detalhes do Item',
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ItemsProvider>
        <MatchesProvider>
          <RootLayoutNav />
        </MatchesProvider>
      </ItemsProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
