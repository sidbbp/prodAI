import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { FAB, Text, useTheme, IconButton, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import { TaskList } from '../../components/Task/TaskList';
import { QuickAddTask } from '../../components/Dashboard/QuickAddTask';
import { supabase } from '../../services/supabase';
import { TaskPriority } from '../../services/ai';

interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: string;
  priority: number;
}

const priorityMap = {
  3: 'HIGH',
  2: 'MEDIUM',
  1: 'LOW',
};

export default function Dashboard() {
  const theme = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const tasksWithDates = (data || []).map(task => ({
        ...task,
        priority: priorityMap[task.priority] || 'MEDIUM',
        dueDate: task.due_date ? new Date(task.due_date) : undefined,
      }));
      
      setTasks(tasksWithDates);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (
    title: string, 
    description?: string, 
    dueDate?: Date,
    priority: TaskPriority = TaskPriority.MEDIUM
  ) => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const priorityMapReverse = {
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1,
      };

      const taskData = {
        user_id: user.id,
        title,
        description,
        due_date: dueDate?.toISOString(),
        status: 'pending',
        priority: priorityMapReverse[priority], // Convert priority to numeric value
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;

      const newTask = {
        ...data,
        priority: priorityMap[data.priority] || 'MEDIUM',
        dueDate: data.due_date ? new Date(data.due_date) : undefined,
      };
      
      setTasks(prevTasks => [newTask, ...prevTasks]);
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleTaskEdit = (taskId: string) => {
    router.push({
      pathname: '/task/[id]',
      params: { id: taskId },
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" />
        <Text>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          My Tasks
        </Text>
        <IconButton
          icon="robot"
          size={24}
          onPress={() => router.push('/ai-chat')}
        />
      </View>
      
      <TaskList
        tasks={tasks}
        onEditTask={handleTaskEdit}
        onDeleteTask={handleTaskDelete}
      />

      <QuickAddTask
        visible={showQuickAdd}
        onDismiss={() => setShowQuickAdd(false)}
        onAdd={handleAddTask}
        isLoading={saving}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setShowQuickAdd(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 4,
  },
  title: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});