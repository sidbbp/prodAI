import React, { useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { TaskItem } from './TaskItem';
import { TaskPriority } from '../../services/ai';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: Date;
}

interface TaskListProps {
  tasks: Task[];
  onEditTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
}) => {
  // Sort tasks by priority (HIGH > MEDIUM > LOW)
  const sortedTasks = useMemo(() => {
    const priorityOrder = {
      [TaskPriority.HIGH]: 0,
      [TaskPriority.MEDIUM]: 1,
      [TaskPriority.LOW]: 2,
    };

    return [...tasks].sort((a, b) => {
      // First sort by priority
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then sort by due date if available
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      
      // Tasks with due dates come before tasks without
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      
      return 0;
    });
  }, [tasks]);

  const renderItem = ({ item }: { item: Task }) => (
    <TaskItem
      title={item.title}
      description={item.description}
      priority={item.priority}
      dueDate={item.dueDate}
      onEdit={onEditTask ? () => onEditTask(item.id) : undefined}
      onDelete={onDeleteTask ? () => onDeleteTask(item.id) : undefined}
    />
  );

  if (tasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="bodyLarge">No tasks yet</Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          Add your first task to get started
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={sortedTasks}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: '#666666',
    marginTop: 8,
  },
}); 