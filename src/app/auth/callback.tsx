import { useEffect } from 'react';
import { Text } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { supabase } from '../../services/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth callback:', { event, session: session ? 'exists' : 'none' });
      
      if (event === 'SIGNED_IN' && session) {
        // Redirect to the main app
        router.replace('/(app)/dashboard');
      } else if (event === 'SIGNED_OUT') {
        // Redirect to auth
        router.replace('/(auth)/login');
      }
    });
  }, [router]);

  return <Text>Processing authentication...</Text>;
} 