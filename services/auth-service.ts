import { supabase, getGoogleClientId, googleAuthConfig } from '@/lib/supabase';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import type { User } from '@/types';

// Ensure browser auth session completes properly
WebBrowser.maybeCompleteAuthSession();

// Discovery document for Google OAuth
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

// Database row type for users table
interface DbUser {
  id: string;
  email: string;
  name: string;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export const authService = {
  async signInWithGoogle(): Promise<User> {
    // Generate PKCE code verifier and challenge
    const codeVerifier = Crypto.getRandomBytes(32)
      .reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');

    const codeChallenge = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      codeVerifier,
      { encoding: Crypto.CryptoEncoding.BASE64 }
    ).then((hash) =>
      hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    );

    const clientId = getGoogleClientId();

    if (!clientId) {
      throw new Error('Google Client ID not configured');
    }

    // Create auth request
    const request = new AuthSession.AuthRequest({
      clientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: googleAuthConfig.redirectUri,
      codeChallenge,
      codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    });

    // Prompt user to sign in
    const result = await request.promptAsync(discovery);

    if (result.type !== 'success') {
      throw new Error('Google sign-in was cancelled or failed');
    }

    const { code } = result.params;

    // Exchange code for session with Supabase
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('No user returned from authentication');
    }

    // Create or update user profile in public.users table
    const user = await this.ensureUserProfile(data.user);

    return user;
  },

  async ensureUserProfile(authUser: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      name?: string;
      avatar_url?: string;
      picture?: string;
    };
  }): Promise<User> {
    const email = authUser.email || '';
    const name = authUser.user_metadata?.full_name ||
                 authUser.user_metadata?.name ||
                 email.split('@')[0];
    const photoUrl = authUser.user_metadata?.avatar_url ||
                     authUser.user_metadata?.picture ||
                     null;

    // Check if user profile exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (existingUser) {
      const user = existingUser as DbUser;
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        photoUrl: user.photo_url,
        isAnonymous: false,
        createdAt: new Date(user.created_at).getTime(),
        updatedAt: new Date(user.updated_at).getTime(),
      };
    }

    // Create new user profile
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        email,
        name,
        photo_url: photoUrl,
      } as DbUser)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user profile: ${error.message}`);
    }

    const user = newUser as DbUser;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      photoUrl: user.photo_url,
      isAnonymous: false,
      createdAt: new Date(user.created_at).getTime(),
      updatedAt: new Date(user.updated_at).getTime(),
    };
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return null;
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!userProfile) {
      // User is authenticated but profile doesn't exist yet
      // This might happen during the first login
      return await this.ensureUserProfile(session.user);
    }

    const user = userProfile as DbUser;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      photoUrl: user.photo_url,
      isAnonymous: false,
      createdAt: new Date(user.created_at).getTime(),
      updatedAt: new Date(user.updated_at).getTime(),
    };
  },

  async updateProfile(userId: string, updates: Partial<Pick<User, 'name' | 'photoUrl'>>): Promise<User> {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user || session.user.id !== userId) {
      throw new Error('Usuário não autorizado');
    }

    const dbUpdates: Partial<DbUser> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.photoUrl !== undefined) dbUpdates.photo_url = updates.photoUrl;

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(dbUpdates as DbUser)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    const user = updatedUser as DbUser;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      photoUrl: user.photo_url,
      isAnonymous: false,
      createdAt: new Date(user.created_at).getTime(),
      updatedAt: new Date(user.updated_at).getTime(),
    };
  },

  async getUserById(userId: string): Promise<User | null> {
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!userProfile) {
      return null;
    }

    const user = userProfile as DbUser;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      photoUrl: user.photo_url,
      isAnonymous: false,
      createdAt: new Date(user.created_at).getTime(),
      updatedAt: new Date(user.updated_at).getTime(),
    };
  },

  // Subscribe to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const user = await this.getCurrentUser();
          callback(user);
        } catch {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  },
};
