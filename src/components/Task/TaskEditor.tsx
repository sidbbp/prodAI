import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, SegmentedButtons, Text } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { calculateTaskPriority, TaskPriority, calculateFallbackPriority } from '../../services/ai';

interface TaskEditorProps {
  initialTask?: {
    title: string;
    description?: string;
    dueDate?: Date;
    priority?: TaskPriority;
    category?: string;
  };
  onSave: (task: any) => void;
  onCancel: () => void;
}

export const TaskEditor: React.FC<TaskEditorProps> = ({
  initialTask,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(initialTask?.dueDate);
  const [priority, setPriority] = useState<TaskPriority | null>(initialTask?.priority || null);
  const [category, setCategory] = useState(initialTask?.category || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isCalculatingPriority, setIsCalculatingPriority] = useState(false);

  useEffect(() => {
    calculateAIPriority();
  }, [title, description, dueDate, category]);

  const calculateAIPriority = async () => {
    if (!title) return;

    setIsCalculatingPriority(true);
    try {
      const aiPriority = await calculateTaskPriority({
        title,
        description,
        dueDate,
        category,
      });

      if (!aiPriority) {
        // If AI couldn't determine priority, try fallback
        const fallbackPriority = calculateFallbackPriority({
          title,
          description,
          dueDate,
          category,
        });
        setPriority(fallbackPriority);
      } else {
        setPriority(aiPriority);
      }
    } catch (error) {
      console.error('Error calculating priority:', error);
    } finally {
      setIsCalculatingPriority(false);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      dueDate,
      priority: priority || TaskPriority.MEDIUM,
      category: category.trim(),
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Task Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        mode="outlined"
      />

      <TextInput
        label="Description (optional)"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        mode="outlined"
        multiline
        numberOfLines={3}
      />

      <TextInput
        label="Category (optional)"
        value={category}
        onChangeText={setCategory}
        style={styles.input}
        mode="outlined"
      />

      <Button
        mode="outlined"
        onPress={() => setShowDatePicker(true)}
        style={styles.input}
      >
        {dueDate ? dueDate.toLocaleDateString() : 'Set Due Date'}
      </Button>

      {showDatePicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="date"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDueDate(selectedDate);
            }
          }}
          minimumDate={new Date()}
        />
      )}

      <View style={styles.prioritySection}>
        <Text>Priority {isCalculatingPriority ? '(Calculating...)' : ''}</Text>
        <SegmentedButtons
          value={priority || TaskPriority.MEDIUM}
          onValueChange={setPriority}
          buttons={[
            { value: TaskPriority.LOW, label: 'Low' },
            { value: TaskPriority.MEDIUM, label: 'Medium' },
            { value: TaskPriority.HIGH, label: 'High' },
          ]}
          style={styles.priorityButtons}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button mode="outlined" onPress={onCancel} style={styles.button}>
          Cancel
        </Button>
        <Button mode="contained" onPress={handleSave} style={styles.button}>
          Save
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  prioritySection: {
    marginBottom: 16,
  },
  priorityButtons: {
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    marginLeft: 8,
  },
}); 