import React from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { TaskCard } from '../Task/TaskCard';
import { Task } from '../../types/task';

interface TaskGridProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
}

export const TaskGrid: React.FC<TaskGridProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onCompleteTask,
}) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const groupedTasks = tasks.reduce((acc, task) => {
    const status = task.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const getStatusTitle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'To Do';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'archived':
        return 'Archived';
      default:
        return status;
    }
  };

  return (
    <ScrollView 
      horizontal={isTablet}
      contentContainerStyle={[
        styles.container,
        isTablet && styles.tabletContainer
      ]}
    >
      {Object.entries(groupedTasks).map(([status, statusTasks]) => (
        <View 
          key={status}
          style={[
            styles.column,
            isTablet && styles.tabletColumn
          ]}
        >
          <Text variant="titleMedium" style={styles.columnTitle}>
            {getStatusTitle(status)} ({statusTasks.length})
          </Text>
          <ScrollView
            nestedScrollEnabled
            style={styles.taskList}
            contentContainerStyle={styles.taskListContent}
          >
            {statusTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onComplete={onCompleteTask}
              />
            ))}
          </ScrollView>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  tabletContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  column: {
    flex: 1,
    minHeight: 300,
    marginBottom: 16,
  },
  tabletColumn: {
    marginHorizontal: 8,
    width: 320,
    maxWidth: 320,
  },
  columnTitle: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  taskList: {
    flex: 1,
  },
  taskListContent: {
    paddingBottom: 16,
  },
}); 