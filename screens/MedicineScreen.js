import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Button,
  FlatList,
  TouchableWithoutFeedback,
  ImageBackground,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {Switch} from 'react-native-paper';
import {DateTime} from 'luxon';
import {PaperProvider} from 'react-native-paper';
import {useRegisterNotifications} from '../hooks/useRegisterNotifications';

export default function MedicineScreen({navigation}) {
  const [wantsNotification, setWantsNotification] = useState(false);
  const [notificationTime, setNotificationTime] = useState('');
  const [tookMedicine, setTookMedicine] = useState(false);
  const [notificationId, setNotificationId] = useState(null);
  const [pickerTime, setPickerTime] = useState(new Date());
  const [] = useRegisterNotifications();

  useEffect(() => {
    const loadInitialState = async () => {
      const storedTookMedicine = await AsyncStorage.getItem('tookMedicine');
      const storedNotificationTime =
        await AsyncStorage.getItem('notificationTime');
      if (storedTookMedicine !== null) {
        setTookMedicine(JSON.parse(storedTookMedicine));
      }
      if (storedNotificationTime !== null) {
        setNotificationTime(storedNotificationTime);
      }
    };

    loadInitialState();
  }, []);

  useEffect(() => {
    if (wantsNotification && notificationTime) {
      const updateNotification = async () => {
        if (notificationId) {
          await Notifications.cancelScheduledNotificationAsync(notificationId);
        }
        const [hour, minute] = notificationTime.split(':');
        const newNotificationId = await scheduleDailyNotification(
          Number(hour),
          Number(minute),
        );
        setNotificationId(newNotificationId);
      };

      updateNotification();
    }
  }, [wantsNotification, notificationTime]);

  const scheduleDailyNotification = async (hour, minute) => {
    // await Notifications.scheduleNotificationAsync({
    //   content: {title: title, body: description},
    //   trigger: {seconds: 10},
    //   //{seconds: triggerTime / 1000},
    // })
    //   .then(async notifyId => {
    //     console.log('ahs', notifyId);
    //   })
    //   .catch(err => console.error('bladf', err));
    const triggerTime = new Date();
    triggerTime.setHours(hour, minute, 0, 0);
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Czas na leki',
        body: 'Zaznacz, że wziąłeś leki.',
      },
      trigger: {
        hour: triggerTime.getHours(),
        minute: triggerTime.getMinutes(),
        repeats: true,
      },
    })
      .then(notifyId => {
        console.log('ahs', notifyId);
        AsyncStorage.setItem('notifyId', notifyId);
      })
      .catch(err => console.error('bladf', err));

    setNotificationId(id);

    AsyncStorage.setItem('notificationTime', `${hour}:${minute}`);
    return id;
  };

  const handleTimeChange = async (event, selectedTime) => {
    const currentTime = selectedTime || pickerTime;
    console.log(selectedTime, pickerTime);
    setPickerTime(currentTime);
    if (currentTime) {
      const timeString = currentTime.toLocaleTimeString().slice(0, 5);
      setNotificationTime(timeString);
      if (wantsNotification) {
        //await handleNotificationUpdate(timeString);
      }
    }
  };

  const handleNotificationUpdate = async timeString => {
    try {
      const id = AsyncStorage.getItem('notifyId');
      if (id) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
      const [hour, minute] = timeString.split(':');
      await scheduleDailyNotification(Number(hour), Number(minute))
        .then(notifyId => {
          console.log('ahs', notifyId);
          AsyncStorage.setItem('notifyId', notifyId);
        })
        .catch(err => console.error('bladf', err));
      // await setNotificationId(newNotificationId);
      AsyncStorage.setItem('notificationTime', timeString);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTookMedicineChange = value => {
    setTookMedicine(value);
    AsyncStorage.setItem('tookMedicine', JSON.stringify(value));
  };
  return (
    <PaperProvider>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ImageBackground
          source={require('../assets/Leki.png')}
          style={styles.rootContainer}>
          <View style={styles.overlay} />
          <View style={styles.buttonContainer}>
            <Text style={styles.text}>Odznacz wzięcie leków:</Text>
            <Switch
              value={tookMedicine}
              onValueChange={handleTookMedicineChange}
              style={styles.checkbox}
              color={tookMedicine ? 'blue' : undefined}
            />
            <Text style={styles.text}>
              Czy chcesz codziennie dostawać powiadomienie o przyjmowaniu leków?
            </Text>
            <Switch
              value={wantsNotification}
              onValueChange={value => setWantsNotification(value)}
              style={styles.checkbox}
              color={wantsNotification ? 'blue' : undefined}
            />
            {wantsNotification && (
              <View>
                <Text style={styles.text}>Wybierz godzinę:</Text>
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={handleTimeChange}
                />
              </View>
            )}
          </View>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </PaperProvider>
  );
}

const commonShadow = {
  elevation: 5,
  shadowColor: 'black',
  shadowOffset: {width: 0, height: 4},
  shadowOpacity: 0.2,
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',

    alignItems: 'center',
    ...commonShadow,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'stretch',
  },
  buttonContainer: {
    marginTop: 100,
    marginHorizontal: 20,
  },
  checkbox: {
    alignSelf: 'center',
    marginVertical: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 100,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#afeeee',
    ...commonShadow,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 21,
    letterSpacing: 0.25,
    color: 'black',
    marginVertical: 10,
  },
});
