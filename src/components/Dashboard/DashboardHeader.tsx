import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Avatar, useTheme } from 'react-native-paper';
import { Task } from '../../types/task';

interface DashboardHeaderProps {
  userName: string;
  avatarUrl?: string;
  taskStats: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
  };
  onAddTask: () => void;
  onOpenAIChat: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName,
  avatarUrl,
  taskStats,
  onAddTask,
  onOpenAIChat,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.userInfo}>
          <Avatar.Image
            size={40}
            source={avatarUrl ? { uri: avatarUrl } : require('../../../assets/default-avatar.png')}
          />
          <View style={styles.welcomeText}>
            <Text variant="titleMedium">Welcome back,</Text>
            <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
              {userName}
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={onAddTask}
            icon="plus"
            style={styles.actionButton}
          >
            Add Task
          </Button>
          <Button
            mode="contained-tonal"
            onPress={onOpenAIChat}
            icon="robot"
            style={styles.actionButton}
          >
            AI Assistant
          </Button>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.primaryContainer }]}>
          <Text variant="titleLarge">{taskStats.total}</Text>
          <Text variant="bodyMedium">Total Tasks</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.secondaryContainer }]}>
          <Text variant="titleLarge">{taskStats.completed}</Text>
          <Text variant="bodyMedium">Completed</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.tertiaryContainer }]}>
          <Text variant="titleLarge">{taskStats.inProgress}</Text>
          <Text variant="bodyMedium">In Progress</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="titleLarge">{taskStats.pending}</Text>
          <Text variant="bodyMedium">Pending</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    marginLeft: 12,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 8,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
}); 