import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, ScrollView, Animated, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { TextInput, Text, useTheme, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAIResponse, Message } from '../../services/ai';
import { supabase } from '../../services/supabase';
import { Constants } from 'expo-constants';

interface TaskPriorityInput {
  title: string;
  description?: string;
  due_date?: string;
  category?: string;
}

export default function AIChatScreen() {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [tasks, setTasks] = useState<TaskPriorityInput[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchUserTasks();
  }, []);

  const fetchUserTasks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated.');

      const { data: tasks, error: taskError } = await supabase
        .from('tasks')
        .select('title, description, due_date, category')
        .eq('user_id', user.id);

      if (taskError) throw new Error('Failed to load tasks.');

      setTasks(tasks || []); // Store fetched tasks

      const taskList = tasks.length
        ? tasks.map(task => `- ${task.title}`).join('\n')
        : '';

      const greetingMessage: Message = {
        role: 'assistant',
        content: taskList
          ? `Hi! These are your current tasks:\n${taskList}`
          : `Hi! You have no tasks currently.`,
      };

      setMessages([greetingMessage]);
    } catch (err: any) {
      setError(err.message);
      console.error('Task Fetch Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: inputText.trim() };

    try {
      setIsLoading(true);
      setError(null);
      setInputText('');

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      scrollViewRef.current?.scrollToEnd({ animated: true });

      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(typingAnimation, { toValue: 0, duration: 500, useNativeDriver: true }),
        ])
      ).start();

      const response = await getAIResponse(newMessages, tasks); // Pass tasks

      setMessages([...newMessages, { role: 'assistant', content: response }]);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    } catch (err: any) {
      setError(err.message);
      console.error('Chat Error:', err);
    } finally {
      setIsLoading(false);
      typingAnimation.setValue(0);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior="padding" style={styles.container}>
          <ScrollView ref={scrollViewRef} style={styles.messagesContainer} contentContainerStyle={styles.messagesContent} keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior="automatic">
            {messages.map((message, index) => (
              <Surface key={index} style={[styles.messageBubble, message.role === 'user' ? styles.userMessage : styles.aiMessage]}>
                <Text style={styles.messageText}>{message.content}</Text>
              </Surface>
            ))}
            {error && <Text style={styles.errorText}>{error}</Text>}
          </ScrollView>
          <View style={styles.inputContainer}>
            <TextInput
              mode="outlined"
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me anything about tasks..."
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
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 16, gap: 16 },
  messageBubble: { padding: 12, borderRadius: 16, elevation: 2 },
  userMessage: { alignSelf: 'flex-end', backgroundColor: '#e3f2fd' },
  aiMessage: { alignSelf: 'flex-start', backgroundColor: '#ffffff' },
  messageText: { fontSize: 16, lineHeight: 24 },
  errorText: { color: '#c62828', fontSize: 16, textAlign: 'center', marginVertical: 10 },
  inputContainer: { padding: 16, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  input: { maxHeight: 120, fontSize: 16 },
});
