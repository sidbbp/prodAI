import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { router } from 'expo-router';
import { supabase } from '../../services/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (signInError) {
        if (signInError.message.includes('Email not confirmed')) {
          setError('Please confirm your email before logging in. Check your inbox for the confirmation link.');
          return;
        }
        throw signInError;
      }

      if (!data.session) {
        throw new Error('No session created after login');
      }

      // The root layout will automatically redirect to the app
      console.log('Login successful, session created');
    } catch (error: any) {
      console.error('Login error:', error.message);
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password');
      } else if (error.message.includes('Email not confirmed')) {
        setError('Please confirm your email before logging in');
      } else {
        setError(error.message || 'Failed to sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Welcome Back
      </Text>
      <Text variant="bodyMedium" style={styles.description}>
        Log in to your account
      </Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text.trim());
          setError(null);
        }}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        mode="outlined"
        error={!!error}
        disabled={loading}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setError(null);
        }}
        secureTextEntry
        style={styles.input}
        mode="outlined"
        error={!!error}
        disabled={loading}
      />
      {error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}
      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        disabled={loading || !email || !password}
        style={styles.button}
      >
        Log In
      </Button>
      <Button
        mode="text"
        onPress={() => router.push('/signup')}
        style={styles.button}
        disabled={loading}
      >
        Don't have an account? Sign Up
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  input: {
    marginBottom: 16,
  },
  error: {
    color: '#B00020',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
  },
}); 