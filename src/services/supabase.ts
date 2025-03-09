import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'
import * as Linking from 'expo-linking'
import Constants from 'expo-constants'

// Get environment variables from Expo Constants
const getSupabaseConfig = () => {
  const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
  const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

  // Log configuration for debugging
  console.log('Supabase Config:', {
    url: supabaseUrl ? 'Set' : 'Not Set',
    key: supabaseAnonKey ? 'Set' : 'Not Set',
    rawUrl: supabaseUrl,
    rawKey: supabaseAnonKey
  });

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Check that you have .env file with the required variables.');
  }

  return { url: supabaseUrl, anonKey: supabaseAnonKey };
};

// Get the redirect URL for auth
const getRedirectUrl = () => {
  return Linking.createURL('auth/callback');
};

const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseConfig();

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      debug: __DEV__,
    },
  }
);

// Export the redirect URL so it can be used in the signup process
export const redirectUrl = getRedirectUrl(); 