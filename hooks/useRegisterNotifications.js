import {useEffect, useState, useRef} from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

export const useRegisterNotifications = () => {
  const [notification, setNotification] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();

  async function registerForPushNotificationsAsync() {
    let token;

    if (Device.isDevice) {
      const {status: existingStatus} =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const {status} = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig.extra.eas.projectId,
        })
      ).data;
      console.log(token);
    } else {
      alert('Must use physical device for Push Notifications');
    }

    return token;
  }

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    Notifications.setNotificationChannelAsync('new-emails', {
      name: 'E-mail notifications',
      sound: 'notifications-sound-127856.wav',
    });
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current =
      Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(response => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current,
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return [expoPushToken];
};
