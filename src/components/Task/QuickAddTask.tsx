import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, IconButton, Surface } from 'react-native-paper';
import { Task } from '../../types/task';

interface QuickAddTaskProps {
  onAddTask: (task: Partial<Task>) => void;
  onCancel?: () => void;
}

export const QuickAddTask: React.FC<QuickAddTaskProps> = ({
  onAddTask,
  onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(3);
  const [showDescription, setShowDescription] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) return;

    const newTask: Partial<Task> = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status: 'pending',
    };

    onAddTask(newTask);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority(3);
    setShowDescription(false);
  };

  const handleCancel = () => {
    resetForm();
    onCancel?.();
  };

  return (
    <Surface style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          mode="outlined"
          placeholder="Add a new task..."
          value={title}
          onChangeText={setTitle}
          style={styles.titleInput}
          right={
            <TextInput.Icon
              icon={showDescription ? 'chevron-up' : 'chevron-down'}
              onPress={() => setShowDescription(!showDescription)}
            />
          }
        />
        <IconButton
          icon="plus"
          mode="contained"
          onPress={handleSubmit}
          disabled={!title.trim()}
          style={styles.addButton}
        />
      </View>

      {showDescription && (
        <View style={styles.expandedSection}>
          <TextInput
            mode="outlined"
            placeholder="Add description (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
            style={styles.descriptionInput}
          />

          <View style={styles.priorityContainer}>
            {[1, 2, 3, 4, 5].map((p) => (
              <IconButton
                key={p}
                icon={priority === p ? 'star' : 'star-outline'}
                size={24}
                onPress={() => setPriority(p)}
                mode={priority === p ? 'contained' : 'outlined'}
                style={styles.priorityButton}
              />
            ))}
          </View>

          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={handleCancel}
              style={styles.actionButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              disabled={!title.trim()}
              style={styles.actionButton}
            >
              Add Task
            </Button>
          </View>
        </View>
      )}
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    elevation: 2,
    borderRadius: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleInput: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    margin: 4,
  },
  expandedSection: {
    marginTop: 16,
  },
  descriptionInput: {
    marginBottom: 16,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  priorityButton: {
    margin: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: 8,
  },
}); 