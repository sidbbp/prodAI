import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { router } from 'expo-router';

export default function VerifyEmail() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Verify Your Email
      </Text>
      <Text variant="bodyLarge" style={styles.description}>
        We've sent you a confirmation email. Please check your inbox and click the verification link to complete your registration.
      </Text>
      <Text variant="bodyMedium" style={styles.note}>
        If you don't see the email, please check your spam folder.
      </Text>
      <Button
        mode="contained"
        onPress={() => router.push('/login')}
        style={styles.button}
      >
        Return to Login
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    textAlign: 'center',
    marginBottom: 16,
  },
  note: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  button: {
    width: '100%',
    marginTop: 8,
  },
}); 