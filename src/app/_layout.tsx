import { useEffect, useState, useRef } from 'react';
import { Stack, router } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { supabase } from '../services/supabase';
import { Session } from '@supabase/supabase-js';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(false); // Track if the layout is mounted

  useEffect(() => {
    isMounted.current = true; // Mark as mounted

    async function fetchSession() {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Initial session check:', session ? 'Session exists' : 'No session');
      setSession(session);
      setIsLoading(false);
    }

    fetchSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session ? 'Session exists' : 'No session');
      setSession(session);
    });

    return () => {
      isMounted.current = false; // Mark as unmounted
      subscription.unsubscribe();
    };
  }, []);

  // **Separate useEffect for navigation**
  useEffect(() => {
    if (!isLoading && isMounted.current) {
      if (session) {
        router.replace('/(app)/dashboard');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [session, isLoading]);

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
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        ) : (
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        )}
      </Stack>
    </PaperProvider>
  );
}
