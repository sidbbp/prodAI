import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, IconButton, useTheme, Portal, Modal } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../../../services/supabase';
import { Task } from '../../../types/supabase';
import { ReminderManager } from '../../../components/Task/ReminderManager';

export default function TaskDetail() {
  const theme = useTheme();
  const { id } = useLocalSearchParams();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setTask(data);
      setTitle(data.title);
      setDescription(data.description || '');
      setDueDate(data.due_date ? new Date(data.due_date) : undefined);
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          title,
          description,
          due_date: dueDate?.toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setTask(data);
      setEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      router.back();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.container}>
        <Text>Task not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => router.back()}
        />
        <Text variant="headlineMedium" style={styles.title}>
          Task Details
        </Text>
        <IconButton
          icon={editing ? 'check' : 'pencil'}
          size={24}
          onPress={() => {
            if (editing) {
              handleSave();
            } else {
              setEditing(true);
            }
          }}
        />
      </View>

      <View style={styles.content}>
        {editing ? (
          <>
            <TextInput
              label="Title"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={4}
            />
            <Button
              mode="outlined"
              onPress={() => setShowDatePicker(true)}
              style={styles.dateButton}
            >
              {dueDate
                ? `Due: ${dueDate.toLocaleDateString()}`
                : 'Set Due Date'}
            </Button>
            {showDatePicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setDueDate(selectedDate);
                  }
                }}
                minimumDate={new Date()}
              />
            )}
          </>
        ) : (
          <>
            <Text variant="headlineSmall" style={styles.taskTitle}>
              {task.title}
            </Text>
            {task.description && (
              <Text variant="bodyLarge" style={styles.description}>
                {task.description}
              </Text>
            )}
            {task.due_date && (
              <Text variant="bodyMedium" style={styles.dueDate}>
                Due: {new Date(task.due_date).toLocaleDateString()}
              </Text>
            )}
            <Text variant="bodyMedium" style={styles.status}>
              Status: {task.status}
            </Text>
          </>
        )}
      </View>

      <ReminderManager taskId={task.id} />

      <View style={styles.footer}>
        <Button
          mode="contained-tonal"
          onPress={handleDelete}
          style={styles.deleteButton}
          textColor={theme.colors.error}
        >
          Delete Task
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  content: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  dateButton: {
    marginBottom: 16,
  },
  taskTitle: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
  },
  dueDate: {
    marginBottom: 8,
  },
  status: {
    marginBottom: 16,
  },
  footer: {
    padding: 16,
    paddingTop: 0,
  },
  deleteButton: {
    marginTop: 16,
  },
}); 