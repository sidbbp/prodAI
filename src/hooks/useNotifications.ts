import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { initializeNotifications } from '../services/notifications';

export const useNotifications = () => {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Initialize notifications on app start
    initializeNotifications();

    // This listener is fired whenever a notification is received while the app is in the foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // This listener is fired whenever a user taps on or interacts with a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Handle notification interaction here
      // You can navigate to specific screens or perform actions based on the notification data
      const data = response.notification.request.content.data;
      console.log('Notification data:', data);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);
}; 