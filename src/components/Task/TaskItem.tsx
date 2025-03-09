import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton, useTheme } from 'react-native-paper';
import { TaskPriority } from '../../services/ai';

interface TaskItemProps {
  id: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: Date;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const getPriorityColor = (priority: TaskPriority | undefined) => {
  switch (priority) {
    case TaskPriority.HIGH:
      return '#ff4444';
    case TaskPriority.MEDIUM:
      return '#ffbb33';
    case TaskPriority.LOW:
      return '#00C851';
    default:
      return '#757575';
  }
};

const getPriorityLabel = (priority: TaskPriority | undefined) => {
  return priority || TaskPriority.MEDIUM;
};

export const TaskItem: React.FC<TaskItemProps> = ({
  id,
  title,
  description,
  priority,
  dueDate,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();

  return (
    <Card style={styles.card} mode="outlined">
      <Card.Content style={styles.content}>
        <View style={styles.titleContainer}>
          <Text variant="titleMedium" style={styles.title}>{title}</Text>
          <View 
            style={[
              styles.priorityBadge, 
              { backgroundColor: getPriorityColor(priority) }
            ]}
          >
            <Text style={styles.priorityText}>
              {getPriorityLabel(priority)}
            </Text>
          </View>
        </View>
        
        {description && (
          <Text variant="bodyMedium" style={styles.description}>
            {description}
          </Text>
        )}
        
        {dueDate && (
          <Text variant="bodySmall" style={styles.dueDate}>
            Due: {dueDate.toLocaleDateString()}
          </Text>
        )}
      </Card.Content>

      <Card.Actions style={styles.actions}>
        <IconButton
          icon="pencil"
          size={20}
          onPress={() => onEdit?.(id)}
        />
        <IconButton
          icon="delete"
          size={20}
          onPress={() => onDelete?.(id)}
        />
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  content: {
    paddingBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    marginBottom: 8,
    color: '#666',
  },
  dueDate: {
    color: '#888',
  },
  actions: {
    justifyContent: 'flex-end',
    paddingTop: 0,
  },
}); 