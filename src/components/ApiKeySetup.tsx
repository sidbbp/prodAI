import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { saveApiKey, getAIResponse } from '../services/ai';

interface ApiKeySetupProps {
  onSetupComplete: () => void;
}

export default function ApiKeySetup({ onSetupComplete }: ApiKeySetupProps) {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateApiKey = async (key: string) => {
    try {
      // Test the API key with a simple request
      await getAIResponse([
        {
          role: 'user',
          content: 'Hello',
        },
      ]);
      return true;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your key and try again.');
      }
      throw error;
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your DeepSeek API key');
      return;
    }

    if (!apiKey.startsWith('dsk-')) {
      setError('Invalid API key format. The key should start with "dsk-"');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // First save the API key
      await saveApiKey(apiKey.trim());
      
      // Then validate it with a test request
      await validateApiKey(apiKey.trim());
      
      onSetupComplete();
    } catch (error: any) {
      setError(error.message);
      console.error('API Key Setup Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        DeepSeek API Setup
      </Text>
      <Text variant="bodyMedium" style={styles.description}>
        Please enter your DeepSeek API key to continue. The key should start with "dsk-".
      </Text>
      <TextInput
        label="API Key"
        value={apiKey}
        onChangeText={(text) => {
          setApiKey(text);
          setError(null);
        }}
        secureTextEntry
        style={styles.input}
        mode="outlined"
        error={!!error}
        disabled={loading}
      />
      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>
      <Button
        mode="contained"
        onPress={handleSaveApiKey}
        loading={loading}
        disabled={loading || !apiKey.trim()}
        style={styles.button}
      >
        {loading ? 'Validating...' : 'Save API Key'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 4,
  },
  button: {
    marginTop: 16,
  },
}); 