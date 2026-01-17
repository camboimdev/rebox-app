import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Create Supabase client without strict typing to avoid TypeScript issues
// Type safety is enforced in the service layer with explicit DbX interfaces
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Google OAuth configuration
const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'rebox',
  path: 'auth/callback',
});

export const googleAuthConfig = {
  // Web client ID (used by Supabase)
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  // iOS client ID
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  // Android client ID
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  redirectUri,
};

export function getGoogleClientId(): string {
  if (Platform.OS === 'ios') {
    return googleAuthConfig.iosClientId || googleAuthConfig.webClientId || '';
  }
  if (Platform.OS === 'android') {
    return googleAuthConfig.androidClientId || googleAuthConfig.webClientId || '';
  }
  return googleAuthConfig.webClientId || '';
}
