import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Surface, Text, ProgressBar, useTheme } from 'react-native-paper';

interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  productivityScore: number;
  tasksByPriority: Record<number, number>;
  tasksByCategory: Record<string, number>;
  averageCompletionTime: number;
  focusInterruptions: number;
}

interface TaskAnalyticsProps {
  data: AnalyticsData;
}

export const TaskAnalytics: React.FC<TaskAnalyticsProps> = ({ data }) => {
  const theme = useTheme();

  const renderPriorityDistribution = () => (
    <Surface style={styles.section}>
      <Text variant="titleMedium">Priority Distribution</Text>
      {Object.entries(data.tasksByPriority).map(([priority, count]) => (
        <View key={priority} style={styles.progressItem}>
          <View style={styles.progressLabel}>
            <Text>Priority {priority}</Text>
            <Text>{count} tasks</Text>
          </View>
          <ProgressBar
            progress={count / data.totalTasks}
            color={getPriorityColor(Number(priority))}
            style={styles.progressBar}
          />
        </View>
      ))}
    </Surface>
  );

  const renderCategoryDistribution = () => (
    <Surface style={styles.section}>
      <Text variant="titleMedium">Category Distribution</Text>
      {Object.entries(data.tasksByCategory).map(([category, count]) => (
        <View key={category} style={styles.progressItem}>
          <View style={styles.progressLabel}>
            <Text>{category}</Text>
            <Text>{count} tasks</Text>
          </View>
          <ProgressBar
            progress={count / data.totalTasks}
            color={theme.colors.primary}
            style={styles.progressBar}
          />
        </View>
      ))}
    </Surface>
  );

  const getPriorityColor = (priority: number): string => {
    switch (priority) {
      case 5: return '#FF0000';
      case 4: return '#FF4500';
      case 3: return '#FFA500';
      case 2: return '#FFD700';
      case 1: return '#90EE90';
      default: return '#808080';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.section}>
        <Text variant="titleMedium">Overall Progress</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text variant="displaySmall">{data.completedTasks}</Text>
            <Text variant="bodySmall">Completed Tasks</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="displaySmall">
              {((data.completedTasks / data.totalTasks) * 100).toFixed(0)}%
            </Text>
            <Text variant="bodySmall">Completion Rate</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="displaySmall">
              {data.productivityScore.toFixed(0)}
            </Text>
            <Text variant="bodySmall">Productivity Score</Text>
          </View>
        </View>
      </Surface>

      {renderPriorityDistribution()}
      {renderCategoryDistribution()}

      <Surface style={styles.section}>
        <Text variant="titleMedium">Focus Metrics</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text variant="titleLarge">
              {data.averageCompletionTime} min
            </Text>
            <Text variant="bodySmall">Avg. Completion Time</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="titleLarge">
              {data.focusInterruptions}
            </Text>
            <Text variant="bodySmall">Focus Interruptions</Text>
          </View>
        </View>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
    margin: 8,
    borderRadius: 8,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  progressItem: {
    marginTop: 12,
  },
  progressLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
}); 