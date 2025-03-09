import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, TextInput, Button, Text } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import debounce from 'lodash/debounce';

interface QuickAddTaskProps {
  visible: boolean;
  onDismiss: () => void;
  onAdd: (title: string, description?: string, dueDate?: Date) => void;
  isLoading?: boolean;
}

export function QuickAddTask({ visible, onDismiss, onAdd, isLoading }: QuickAddTaskProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), description.trim() || undefined, dueDate);
    handleDismiss();
  };

  const handleDismiss = () => {
    setTitle('');
    setDescription('');
    setDueDate(undefined);
    onDismiss();
  };

  // Debounced text input handlers
  const debouncedSetTitle = useCallback(
    debounce((text: string) => {
      setTitle(text);
    }, 100),
    []
  );

  const debouncedSetDescription = useCallback(
    debounce((text: string) => {
      setDescription(text);
    }, 100),
    []
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={styles.modal}
      >
        <Text variant="titleLarge" style={styles.title}>Add New Task</Text>
        
        <TextInput
          mode="outlined"
          label="Task Title"
          defaultValue={title}
          onChangeText={debouncedSetTitle}
          style={styles.input}
          autoFocus
          returnKeyType="next"
          blurOnSubmit={false}
          maxLength={100}
          autoCapitalize="sentences"
          dense
        />

        <TextInput
          mode="outlined"
          label="Description (optional)"
          defaultValue={description}
          onChangeText={debouncedSetDescription}
          style={styles.input}
          multiline
          numberOfLines={3}
          maxLength={500}
          dense
        />

        <Button
          mode="outlined"
          onPress={() => setShowDatePicker(true)}
          style={styles.dateButton}
        >
          {dueDate ? dueDate.toLocaleDateString() : 'Set Due Date (optional)'}
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

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={handleDismiss}
            style={styles.button}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            loading={isLoading}
            disabled={!title.trim() || isLoading}
          >
            Add Task
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  dateButton: {
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    minWidth: 100,
  },
}); 