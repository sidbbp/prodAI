import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton, ProgressBar, Chip } from 'react-native-paper';
import { Task } from '../../types/task';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onComplete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onComplete,
}) => {
  const getDueDate = () => {
    if (!task.due_date) return '';
    const date = new Date(task.due_date);
    return date.toLocaleDateString();
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 5: return '#FF0000';
      case 4: return '#FF4500';
      case 3: return '#FFA500';
      case 2: return '#FFD700';
      case 1: return '#90EE90';
      default: return '#808080';
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text variant="titleMedium" style={styles.title}>{task.title}</Text>
            <Chip 
              style={[styles.priorityChip, { backgroundColor: getPriorityColor() }]}
              textStyle={styles.priorityText}
            >
              P{task.priority}
            </Chip>
          </View>
          <View style={styles.actions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => onEdit(task)}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => onDelete(task.id)}
            />
            <IconButton
              icon={task.status === 'completed' ? 'check-circle' : 'circle-outline'}
              size={20}
              onPress={() => onComplete(task.id)}
            />
          </View>
        </View>
        
        {task.description && (
          <Text variant="bodyMedium" style={styles.description}>
            {task.description}
          </Text>
        )}
        
        <View style={styles.footer}>
          {task.due_date && (
            <Text variant="bodySmall" style={styles.dueDate}>
              Due: {getDueDate()}
            </Text>
          )}
          {task.estimated_duration && (
            <Text variant="bodySmall" style={styles.duration}>
              Est: {task.estimated_duration}min
            </Text>
          )}
        </View>

        {task.status === 'in_progress' && (
          <ProgressBar
            progress={0.5}
            color={getPriorityColor()}
            style={styles.progressBar}
          />
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
    marginHorizontal: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  priorityChip: {
    height: 24,
    marginLeft: 8,
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  description: {
    marginTop: 8,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dueDate: {
    color: '#666',
  },
  duration: {
    color: '#666',
  },
  progressBar: {
    marginTop: 8,
    height: 4,
  },
}); 