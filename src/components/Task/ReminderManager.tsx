import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Platform, Alert } from 'react-native';
import { Text, Button, List, IconButton, Portal, Modal, TextInput, Snackbar } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../../services/supabase';
import { Reminder } from '../../types/supabase';
import { scheduleNotification, cancelNotification, showInAppNotification } from '../../services/notifications';

interface ReminderManagerProps {
  taskId: string;
  taskTitle: string;
}

export const ReminderManager: React.FC<ReminderManagerProps> = ({ taskId, taskTitle }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(() => {
    const date = new Date();
    date.setHours(date.getHours() + 1, 0, 0, 0);
    return date;
  });
  const [customMessage, setCustomMessage] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [upcomingReminder, setUpcomingReminder] = useState<Reminder | null>(null);

  const fetchReminders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('task_id', taskId)
        .order('reminder_time', { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      Alert.alert('Error', 'Failed to fetch reminders');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const validateDateTime = useCallback((dateTime: Date) => {
    const now = new Date();
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    if (dateTime <= now) {
      throw new Error('Reminder time must be in the future');
    }

    if (dateTime > twoWeeksFromNow) {
      throw new Error('Reminder cannot be set more than 14 days in advance');
    }

    const exists = reminders.some(reminder => {
      const reminderTime = new Date(reminder.reminder_time);
      const diffInHours = Math.abs(dateTime.getTime() - reminderTime.getTime()) / (1000 * 60 * 60);
      return diffInHours < 1;
    });

    if (exists) {
      throw new Error('A reminder already exists within 1 hour of this time');
    }
  }, [reminders]);

  const handleAddReminder = async () => {
    try {
      validateDateTime(selectedDateTime);

      const notificationTitle = 'Task Reminder';
      const notificationBody = customMessage.trim() 
        ? `${taskTitle}\n${customMessage.trim()}`
        : taskTitle;

      const notificationId = await scheduleNotification(
        notificationTitle,
        notificationBody,
        selectedDateTime,
        { taskId, taskTitle }
      );

      const { data, error } = await supabase
        .from('reminders')
        .insert([{
          task_id: taskId,
          reminder_time: selectedDateTime.toISOString(),
          custom_message: customMessage.trim() || null,
          status: 'pending',
          notification_id: notificationId,
        }])
        .select()
        .single();

      if (error) {
        await cancelNotification(notificationId);
        throw error;
      }

      setReminders([...reminders, data]);
      setShowAddModal(false);
      resetForm();
      Alert.alert('Success', 'Reminder set successfully');
    } catch (error) {
      console.error('Error in handleAddReminder:', error);
      Alert.alert('Error', error.message || 'Failed to add reminder');
    }
  };

  const handleDeleteReminder = async (reminder: Reminder) => {
    try {
      if (reminder.notification_id) {
        await cancelNotification(reminder.notification_id);
      }

      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminder.id);

      if (error) throw error;
      setReminders(reminders.filter(r => r.id !== reminder.id));
    } catch (error) {
      console.error('Error deleting reminder:', error);
      Alert.alert('Error', 'Failed to delete reminder');
    }
  };

  const handleDateTimeChange = useCallback((event: any, selected?: Date, isDate = true) => {
    const picker = isDate ? setShowDatePicker : setShowTimePicker;
    picker(false);

    if (selected) {
      const newDateTime = new Date(selectedDateTime);
      if (isDate) {
        newDateTime.setFullYear(selected.getFullYear());
        newDateTime.setMonth(selected.getMonth());
        newDateTime.setDate(selected.getDate());
        if (Platform.OS === 'android') setShowTimePicker(true);
      } else {
        newDateTime.setHours(selected.getHours());
        newDateTime.setMinutes(selected.getMinutes());
      }
      setSelectedDateTime(newDateTime);
    }
  }, [selectedDateTime]);

  const checkUpcomingReminders = useCallback(() => {
    const now = new Date();
    const upcoming = reminders.find(reminder => {
      const reminderTime = new Date(reminder.reminder_time);
      const timeDiff = reminderTime.getTime() - now.getTime();
      return timeDiff > 0 && timeDiff <= 5 * 60 * 1000;
    });

    if (upcoming && (!upcomingReminder || upcoming.id !== upcomingReminder.id)) {
      setUpcomingReminder(upcoming);
      showInAppNotification(
        'Upcoming Reminder',
        `${taskTitle}\n${upcoming.custom_message || ''}`,
        { taskId, taskTitle }
      );
    } else if (!upcoming) {
      setUpcomingReminder(null);
    }
  }, [reminders, taskTitle, taskId, upcomingReminder]);

  useEffect(() => { fetchReminders(); }, [fetchReminders]);
  
  useEffect(() => {
    if (isKeyboardVisible) {
      setShowDatePicker(false);
      setShowTimePicker(false);
    }
  }, [isKeyboardVisible]);

  useEffect(() => {
    const interval = setInterval(checkUpcomingReminders, 60000);
    checkUpcomingReminders();
    return () => clearInterval(interval);
  }, [checkUpcomingReminders]);

  const resetForm = useCallback(() => {
    setCustomMessage('');
    const newDate = new Date();
    newDate.setHours(newDate.getHours() + 1, 0, 0, 0);
    setSelectedDateTime(newDate);
  }, []);

  const formatReminderTime = useCallback((date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Loading reminders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium">Reminders</Text>
        <Button mode="outlined" onPress={() => setShowAddModal(true)} icon="plus">
          Add Reminder
        </Button>
      </View>

      {reminders.length === 0 ? (
        <Text style={styles.emptyText}>No reminders set</Text>
      ) : (
        <List.Section>
          {reminders.map(reminder => (
            <List.Item
              key={reminder.id}
              title={formatReminderTime(reminder.reminder_time)}
              description={reminder.custom_message}
              right={props => (
                <IconButton
                  {...props}
                  icon="delete"
                  onPress={() => handleDeleteReminder(reminder)}
                />
              )}
            />
          ))}
        </List.Section>
      )}

      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => {
            setShowAddModal(false);
            resetForm();
          }}
          contentContainerStyle={[
            styles.modal,
            isKeyboardVisible && styles.modalWithKeyboard
          ]}
        >
          <Text variant="titleMedium" style={styles.modalTitle}>Add Reminder</Text>
          
          {!isKeyboardVisible && (
            <View style={styles.dateTimeButtons}>
              <Button
                mode="outlined"
                onPress={() => setShowDatePicker(true)}
                style={styles.dateButton}
              >
                {`Date: ${selectedDateTime.toLocaleDateString()}`}
              </Button>
              <Button
                mode="outlined"
                onPress={() => setShowTimePicker(true)}
                style={styles.dateButton}
              >
                {`Time: ${selectedDateTime.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}`}
              </Button>
            </View>
          )}

          {(showDatePicker || showTimePicker) && !isKeyboardVisible && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={selectedDateTime}
                mode={showDatePicker ? "date" : "time"}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(e, d) => handleDateTimeChange(e, d, showDatePicker)}
                minimumDate={new Date()}
                maximumDate={showDatePicker ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : undefined}
              />
            </View>
          )}

          <TextInput
            label="Custom Message (optional)"
            value={customMessage}
            onChangeText={setCustomMessage}
            onFocus={() => setIsKeyboardVisible(true)}
            onBlur={() => setIsKeyboardVisible(false)}
            style={styles.input}
            mode="outlined"
            multiline
            blurOnSubmit
            maxLength={100}
            numberOfLines={2}
            placeholder="Add a custom message"
          />

          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => {
                setShowAddModal(false);
                resetForm();
              }}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAddReminder}
              style={styles.modalButton}
            >
              Add
            </Button>
          </View>
        </Modal>

        <Snackbar
          visible={!!upcomingReminder}
          onDismiss={() => setUpcomingReminder(null)}
          duration={300000}
          action={{
            label: 'Dismiss',
            onPress: () => setUpcomingReminder(null),
          }}
          style={styles.snackbar}
        >
          {upcomingReminder && (
            <Text>
              Upcoming reminder at {formatReminderTime(upcomingReminder.reminder_time)}
              {upcomingReminder.custom_message ? `\n${upcomingReminder.custom_message}` : ''}
            </Text>
          )}
        </Snackbar>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 8,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalWithKeyboard: {
    maxHeight: '50%',
  },
  modalTitle: {
    marginBottom: 16,
  },
  dateTimeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  pickerContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  input: {
    marginBottom: 16,
    fontSize: 16,
    paddingVertical: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    marginLeft: 8,
  },
  snackbar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
}); 