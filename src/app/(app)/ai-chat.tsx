import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import { TextInput, IconButton, Text, useTheme, Surface } from 'react-native-paper';
import { getAIResponse, Message } from '../../services/ai';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AIChatScreen() {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;

  const animateTyping = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(typingAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(typingAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputText.trim(),
    };

    try {
      setIsLoading(true);
      setError(null);
      setInputText('');
      
      // Add user message immediately
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      animateTyping();

      // Get AI response
      const response = await getAIResponse(newMessages);

      // Add AI response
      const aiMessage: Message = {
        role: 'assistant',
        content: response,
      };
      
      setMessages([...newMessages, aiMessage]);

      // Scroll to bottom again
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      setError(error.message);
      console.error('Chat Error:', error);
    } finally {
      setIsLoading(false);
      typingAnimation.setValue(0);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message, index) => (
            <Animated.View
              key={index}
              style={[
                styles.messageWrapper,
                message.role === 'user' ? styles.userMessageWrapper : styles.aiMessageWrapper,
                { opacity: message.role === 'assistant' ? 1 : 1 }
              ]}
            >
              <Surface
                style={[
                  styles.messageBubble,
                  message.role === 'user' ? styles.userMessage : styles.aiMessage,
                ]}
                elevation={2}
              >
                <Text style={styles.messageText}>{message.content}</Text>
              </Surface>
            </Animated.View>
          ))}
          {isLoading && (
            <Animated.View
              style={[
                styles.messageWrapper,
                styles.aiMessageWrapper,
                {
                  opacity: typingAnimation,
                }
              ]}
            >
              <Surface style={[styles.messageBubble, styles.aiMessage]} elevation={2}>
                <Text style={styles.typingIndicator}>AI is thinking...</Text>
              </Surface>
            </Animated.View>
          )}
          {error && (
            <Surface style={[styles.messageBubble, styles.errorMessage]} elevation={2}>
              <Text style={styles.errorText}>{error}</Text>
            </Surface>
          )}
        </ScrollView>
        <View style={styles.inputContainer}>
          <TextInput
            mode="outlined"
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me anything about task management..."
            multiline
            style={styles.input}
            disabled={isLoading}
            right={
              <TextInput.Icon
                icon="send"
                disabled={!inputText.trim() || isLoading}
                onPress={handleSend}
                color={theme.colors.primary}
              />
            }
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 16,
  },
  messageWrapper: {
    maxWidth: '80%',
    marginVertical: 4,
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
  },
  aiMessageWrapper: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    elevation: 2,
  },
  userMessage: {
    backgroundColor: '#e3f2fd',
  },
  aiMessage: {
    backgroundColor: '#ffffff',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  errorMessage: {
    alignSelf: 'center',
    backgroundColor: '#ffebee',
    marginVertical: 8,
  },
  errorText: {
    color: '#c62828',
    fontSize: 16,
  },
  typingIndicator: {
    fontSize: 16,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    maxHeight: 120,
    fontSize: 16,
  },
}); 