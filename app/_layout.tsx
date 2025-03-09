import { useEffect } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { Slot, useRouter, useSegments, Stack } from 'expo-router'
import { PaperProvider, Text } from 'react-native-paper'
import { AuthProvider, useAuth } from '../src/stores/AuthContext'
import { useNotifications } from '../src/hooks/useNotifications'

function RootLayoutNav() {
  const { session, loading } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    console.log('RootLayoutNav: Current state:', { loading, session: !!session, segments })
    
    if (loading) return

    const inAuthGroup = segments[0] === '(auth)'

    if (!session && !inAuthGroup) {
      console.log('RootLayoutNav: Redirecting to sign-in')
      router.replace('/sign-in')
    } else if (session && inAuthGroup) {
      console.log('RootLayoutNav: Redirecting to app')
      router.replace('/(app)')
    }
  }, [session, loading, segments])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  return <Slot />
}

const RootLayout = () => {
  // Initialize notifications
  useNotifications()

  return (
    <PaperProvider>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <RootLayoutNav />
        </Stack>
      </AuthProvider>
    </PaperProvider>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
})

export default RootLayout 