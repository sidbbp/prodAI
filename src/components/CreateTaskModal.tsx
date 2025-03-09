import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Modal, Portal, TextInput, Button, Text } from 'react-native-paper'
import { supabase } from '../services/supabase'
import { Database } from '../types/supabase'

type Task = Database['public']['Tables']['tasks']['Insert']

interface CreateTaskModalProps {
  visible: boolean
  onDismiss: () => void
  onTaskCreated: () => void
}

export default function CreateTaskModal({ visible, onDismiss, onTaskCreated }: CreateTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateTask = async () => {
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const newTask: Task = {
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        status: 'pending',
        priority: 0,
      }

      const { error: insertError } = await supabase
        .from('tasks')
        .insert(newTask)

      if (insertError) throw insertError

      setTitle('')
      setDescription('')
      onTaskCreated()
      onDismiss()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <Text variant="headlineSmall" style={styles.title}>Create New Task</Text>

        {error && (
          <Text style={styles.error}>{error}</Text>
        )}

        <TextInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        <View style={styles.buttons}>
          <Button
            mode="outlined"
            onPress={onDismiss}
            style={styles.button}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleCreateTask}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Create
          </Button>
        </View>
      </Modal>
    </Portal>
  )
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 15,
  },
  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  button: {
    marginLeft: 10,
  },
}) 