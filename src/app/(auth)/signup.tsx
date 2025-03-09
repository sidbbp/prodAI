import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { router } from 'expo-router';
import { supabase, redirectUrl } from '../../services/supabase';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            email: email.trim(),
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data?.user) {
        if (data.user.identities?.length === 0) {
          throw new Error('Email already registered. Please try logging in.');
        }
        
        alert('Please check your email for the confirmation link. Once confirmed, you can log in to your account.');
        router.push('/login');
      } else {
        throw new Error('No user data received from signup');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Create Account
      </Text>
      <Text variant="bodyMedium" style={styles.description}>
        Sign up with your email to get started
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
        onPress={handleSignUp}
        loading={loading}
        disabled={loading || !email || !password}
        style={styles.button}
      >
        Sign Up
      </Button>
      <Button
        mode="text"
        onPress={() => router.push('/login')}
        style={styles.button}
        disabled={loading}
      >
        Already have an account? Log In
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