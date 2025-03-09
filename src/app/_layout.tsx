import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { supabase } from '../services/supabase';
import { Session } from '@supabase/supabase-js';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session ? 'Session exists' : 'No session');
      setSession(session);
      setIsLoading(false);
      
      // Redirect based on session
      if (session) {
        router.replace('/(app)/dashboard');
      } else {
        router.replace('/(auth)/login');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session ? 'Session exists' : 'No session');
      setSession(session);
      
      // Redirect based on session change
      if (session) {
        router.replace('/(app)/dashboard');
      } else {
        router.replace('/(auth)/login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {!session ? (
          // Auth stack
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        ) : (
          // App stack
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        )}
      </Stack>
    </PaperProvider>
  );
} 