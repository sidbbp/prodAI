import React, { useState, useEffect } from 'react'
import { View, StyleSheet, FlatList } from 'react-native'
import { Text, FAB, Card, IconButton, useTheme } from 'react-native-paper'
import { useAuth } from '../../src/stores/AuthContext'
import { supabase } from '../../src/services/supabase'
import { Database } from '../../src/types/supabase'
import CreateTaskModal from '../../src/components/CreateTaskModal'

type Task = Database['public']['Tables']['tasks']['Row']

export default function Dashboard() {
  const { signOut } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const theme = useTheme()

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleTaskCompletion = async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)

      if (error) throw error
      fetchTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const renderTask = ({ item }: { item: Task }) => (
    <Card style={styles.taskCard}>
      <Card.Content>
        <View style={styles.taskHeader}>
          <Text variant="titleMedium">{item.title}</Text>
          <IconButton
            icon={item.status === 'completed' ? 'check-circle' : 'circle-outline'}
            size={20}
            onPress={() => handleTaskCompletion(item.id, item.status)}
          />
        </View>
        {item.description && (
          <Text variant="bodyMedium">{item.description}</Text>
        )}
        {item.due_date && (
          <Text variant="bodySmall" style={styles.dueDate}>
            Due: {new Date(item.due_date).toLocaleDateString()}
          </Text>
        )}
      </Card.Content>
    </Card>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">My Tasks</Text>
        <IconButton
          icon="logout"
          size={24}
          onPress={handleSignOut}
        />
      </View>

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={fetchTasks}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setModalVisible(true)}
      />

      <CreateTaskModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        onTaskCreated={fetchTasks}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 4,
  },
  list: {
    padding: 16,
  },
  taskCard: {
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDate: {
    marginTop: 8,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}) 