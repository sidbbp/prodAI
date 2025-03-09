import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Text, IconButton, useTheme } from 'react-native-paper';
import { Task } from '../../types/supabase';

interface TaskListProps {
  tasks: Task[];
  onTaskPress: (task: Task) => void;
  onTaskComplete: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskPress,
  onTaskComplete,
  onTaskDelete,
}) => {
  const theme = useTheme();

  const renderTask = ({ item: task }: { item: Task }) => (
    <Card style={styles.taskCard} onPress={() => onTaskPress(task)}>
      <Card.Content style={styles.taskContent}>
        <View style={styles.taskInfo}>
          <IconButton
            icon={task.status === 'completed' ? 'check-circle' : 'circle-outline'}
            size={24}
            onPress={() => onTaskComplete(task.id)}
            iconColor={task.status === 'completed' ? theme.colors.primary : theme.colors.outline}
          />
          <View style={styles.taskTextContainer}>
            <Text
              variant="titleMedium"
              style={[
                styles.taskTitle,
                task.status === 'completed' && styles.completedTask,
              ]}
            >
              {task.title}
            </Text>
            {task.description && (
              <Text
                variant="bodyMedium"
                style={[
                  styles.taskDescription,
                  task.status === 'completed' && styles.completedTask,
                ]}
                numberOfLines={2}
              >
                {task.description}
              </Text>
            )}
            {task.due_date && (
              <Text
                variant="bodySmall"
                style={[
                  styles.dueDate,
                  new Date(task.due_date) < new Date() && styles.overdue,
                ]}
              >
                Due: {new Date(task.due_date).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
        <IconButton
          icon="delete"
          size={20}
          onPress={() => onTaskDelete(task.id)}
          iconColor={theme.colors.error}
        />
      </Card.Content>
    </Card>
  );

  return (
    <FlatList
      data={tasks}
      renderItem={renderTask}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text variant="bodyLarge">No tasks yet. Add one to get started!</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  taskCard: {
    marginBottom: 8,
    elevation: 2,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  taskTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  taskTitle: {
    marginBottom: 4,
  },
  taskDescription: {
    marginBottom: 4,
  },
  dueDate: {
    opacity: 0.7,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  overdue: {
    color: '#B00020',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
}); 