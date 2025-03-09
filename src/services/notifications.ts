import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

// Configure notification handler once
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

// Initialize notifications with permissions and channel setup
export const initializeNotifications = async () => {
  try {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push notification permissions');
      return false;
    }

    // Setup Android channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: true,
        enableVibrate: true,
        showBadge: true,
      });
    }

    return true;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return false;
  }
};

// Common notification content creator
const createNotificationContent = (title: string, body: string, data?: any) => ({
  title,
  body,
  data,
  sound: true,
  priority: Notifications.AndroidNotificationPriority.HIGH,
  badge: 1,
});

// Schedule a notification
export const scheduleNotification = async (
  title: string,
  body: string,
  trigger: Date,
  data?: any
) => {
  try {
    const hasPermission = await initializeNotifications();
    if (!hasPermission) throw new Error('No notification permission');

    const now = new Date();
    if (trigger.getTime() <= now.getTime()) {
      throw new Error('Cannot schedule notification in the past');
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: createNotificationContent(title, body, { 
        ...data, 
        scheduledTime: trigger.toISOString() 
      }),
      trigger: { date: trigger },
    });

    console.log('Scheduled notification:', {
      id,
      title,
      body,
      scheduledTime: trigger.toISOString(),
    });

    return id;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    throw error;
  }
};

// Show immediate in-app notification
export const showInAppNotification = async (
  title: string,
  body: string,
  data?: any
) => {
  try {
    const hasPermission = await initializeNotifications();
    if (!hasPermission) throw new Error('No notification permission');

    return await Notifications.presentNotificationAsync(
      createNotificationContent(title, body, data)
    );
  } catch (error) {
    console.error('Error showing in-app notification:', error);
    throw error;
  }
};

// Cancel notification(s)
export const cancelNotification = async (notificationId: string) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
    throw error;
  }
};

// Add notification listeners
export const addNotificationListeners = (
  onReceive: (notification: Notifications.Notification) => void,
  onResponse: (response: Notifications.NotificationResponse) => void
) => {
  const receiveListener = Notifications.addNotificationReceivedListener(onReceive);
  const responseListener = Notifications.addNotificationResponseReceivedListener(onResponse);
  
  return () => {
    Notifications.removeNotificationSubscription(receiveListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}; 