import { Stack } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function AuthLayout() {
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor },
      }}
    >
      <Stack.Screen name="login" />
    </Stack>
  );
}
