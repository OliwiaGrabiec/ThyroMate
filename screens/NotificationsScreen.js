import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  FlatList,
  ImageBackground,
  Button,
  Platform,
  Pressable,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import {StyleSheet, Modal} from 'react-native';
import {Portal, PaperProvider, Dialog, Surface} from 'react-native-paper';
import {TextInput} from 'react-native-paper';
import axios from 'axios';
import {AuthContext} from '../store/auth-context';
import {Buffer} from 'buffer';
import {useFocusEffect} from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker';
import Checkbox from 'expo-checkbox';
import {ActionButton} from '../components/ui/ActionButton';
import {useRegisterNotifications} from '../hooks/useRegisterNotifications';

const BASE_URL = 'https://logow-576ee-default-rtdb.firebaseio.com/';

export default function NotificationsScreen({navigation}) {
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [dialogVisible, setDialogVisible] = useState(false);
  const [user_id, setUserId] = useState('');
  const [isReminderSet, setIsReminderSet] = useState(false);
  const [reminderTime, setReminderTime] = useState('0');
  const [notifyId, setNotifyId] = useState('');
  const [] = useRegisterNotifications();

  const authCtx = useContext(AuthContext);
  const token = authCtx.token;

  const showDialog = () => setDialogVisible(true);

  const hideDialog = () => setDialogVisible(false);

  function decodeBase64Url(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    const missingPadding = 4 - (str.length % 4);
    if (missingPadding) {
      str += new Array(missingPadding + 1).join('=');
    }
    return Buffer.from(str, 'base64').toString('utf8');
  }

  function getUserIdFromToken(token) {
    const payloadPart = token.split('.')[1];
    const decodedPayload = decodeBase64Url(payloadPart);
    const jsonPayload = JSON.parse(decodedPayload);
    return jsonPayload.user_id;
  }

  useFocusEffect(
    React.useCallback(() => {
      setUserId(getUserIdFromToken(token));
      //loadNotifications();
    }, [user_id]),
  );
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        await await axios
          .get(`${BASE_URL}/users/${user_id}/notifications.json`)
          .then(response => {
            const loadedNotifications = [];
            for (const key in response.data) {
              loadedNotifications.push({
                ...response.data[key],
                id: key,
              });
            }
            console.log('hej');
            setNotifications(loadedNotifications);
          })
          .catch(err => console.error('bladf', err));
      } catch (error) {
        console.error(
          'Błąd podczas wczytywania powiadomień z Firebase:',
          error,
        );
      }
    };

    loadNotifications();
    console.log(user_id);
  }, [user_id]);
  // const loadNotifications = async () => {
  //   try {
  //     const response = await axios.get(
  //       `${BASE_URL}/users/${user_id}/notifications.json`,
  //     );
  //     const loadedNotifications = [];
  //     for (const key in response.data) {
  //       loadedNotifications.push({
  //         ...response.data[key],
  //         id: key,
  //       });
  //     }
  //     setNotifications(loadedNotifications);
  //   } catch (error) {
  //     console.error('Błąd podczas wczytywania powiadomień z Firebase:', error);
  //   }
  // };
  const scheduleNotification = async () => {
    const notificationTime = new Date(date);
    if (reminderTime !== '0') {
      notificationTime.setHours(
        notificationTime.getHours() - parseInt(reminderTime, 10),
      );
    }
    const triggerTime = notificationTime.getTime() - new Date().getTime();
    const identifier = new Date().getTime().toString();
    const trigger = date.getTime() - new Date().getTime();

    if (isReminderSet) {
      await Notifications.scheduleNotificationAsync({
        content: {title: title, body: description},
        trigger: {seconds: 10},
        //{seconds: triggerTime / 1000},
      })
        .then(async notifyId => {
          console.log('ahs', notifyId);
          setNotifyId(notifyId);

          const newNotification = {
            id1: notifyId ? notifyId : ' ',
            title,
            description,
            date: date.toLocaleString(),
            trigger: trigger,
          };
          setNotifications([...notifications, newNotification]);
          setTitle('');
          setDescription('');
          setDate(new Date());
          try {
            console.log(user_id);

            const response = await axios.post(
              `${BASE_URL}/users/${user_id}/notifications.json`,
              newNotification,
            );
            newNotification.id = response.data.name;
          } catch (error) {
            console.error(
              'Błąd podczas zapisywania powiadomień w Firebase:',
              error,
            );
          }
        })
        .catch(err => console.error('bladf', err));
    }

    setDialogVisible(false);
  };

  const removeNotification = async id => {
    try {
      const notificationToDelete = notifications.find(
        notification => notification.id === id,
      );
      if (!notificationToDelete) return;

      console.log(notificationToDelete);

      const scheduledId = notificationToDelete.id1;
      console.log(scheduledId);
      if (scheduledId) {
        await Notifications.cancelScheduledNotificationAsync(scheduledId);
      }
      await axios.delete(
        `${BASE_URL}/users/${user_id}/notifications/${id}.json`,
      );
      setNotifications(prevNotifications =>
        prevNotifications.filter(notification => notification.id !== id),
      );
    } catch (error) {
      console.error('Błąd podczas usuwania powiadomienia:', error);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setDate(selectedDate || date);
  };

  const renderItem = ({item}) => (
    <View style={{paddingVertical: 5}}>
      <Surface style={styles.surface} elevation={4}>
        <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 5}}>
          {item.title}
        </Text>
        <Text>{item.description}</Text>
        <Text>{item.date}</Text>
        <Button
          title="Usuń"
          onPress={async () => await removeNotification(item.id)}
          color="red"
        />
        <Button
          title="Dodaj zalecenia"
          onPress={() =>
            navigation.navigate('AddRec', {title: item.title, date: item.date})
          }
          style={styles.button}
          color="black"
        />
      </Surface>
    </View>
  );

  return (
    <PaperProvider>
      <ImageBackground
        source={require('../assets/tlo.png')}
        style={styles.rootContainer}>
        <ActionButton onPress={showDialog} />

        <Portal>
          <Dialog
            visible={dialogVisible}
            style={{borderRadius: 10}}
            onDismiss={hideDialog}>
            <Dialog.Title>Dodaj nową wizytę: </Dialog.Title>
            <Dialog.Content>
              <TextInput
                mode="outlined"
                outlineColor="#8a66af"
                activeOutlineColor="#8a66af"
                label="Tytuł"
                value={title}
                onChangeText={text => setTitle(text)}
                style={styles.text}
              />
              <TextInput
                mode="outlined"
                outlineColor="#8a66af"
                activeOutlineColor="#8a66af"
                label="Opis"
                value={description}
                onChangeText={text => setDescription(text)}
                style={styles.text}
              />
              <DateTimePicker
                value={date}
                mode="datetime"
                display="default"
                onChange={handleDateChange}
                style={styles.czasdata}
              />
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.text}>Chcesz dostać powiadomienie?</Text>
                <Checkbox
                  value={isReminderSet}
                  color={isReminderSet ? 'pink' : 'unchecked'}
                  onValueChange={() => {
                    setIsReminderSet(!isReminderSet);
                  }}
                  style={{marginLeft: 25, marginTop: 15}}
                />
              </View>
              {isReminderSet && (
                <Picker
                  selectedValue={reminderTime}
                  onValueChange={(itemValue, itemIndex) =>
                    setReminderTime(itemValue)
                  }
                  style={styles.picker}>
                  <Picker.Item label="W czasie wizyty" value="0" />
                  <Picker.Item label="1 godzina przed" value="1" />
                  <Picker.Item label="2 godziny przed" value="2" />
                  <Picker.Item label="3 godziny przed" value="3" />
                  <Picker.Item label="4 godziny przed" value="4" />
                </Picker>
              )}
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                title="Dodaj"
                onPress={async () => await scheduleNotification()}
                style={styles.button}
                color="black"
              />
              <Button
                title="Zamknij"
                onPress={() => setDialogVisible(false)}
                style={styles.button}
                color="black"
              />
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <Portal.Host>
          <FlatList
            data={notifications}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            style={{marginTop: 20}}
          />
        </Portal.Host>
      </ImageBackground>
    </PaperProvider>
  );
}
const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    marginBottom: 10,
    marginTop: 15,
    borderWidth: 2,
    borderColor: 'blue',
    backgroundColor: 'blue',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    color: 'black',
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  czasdata: {
    alignContent: 'center',
    justifyContent: 'center',
    width: 260,
    marginTop: 20,
    paddingRight: 50,
  },
  delete: {},
  surface: {
    padding: 6,
    marginRight: 10,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    shadowOffset: {width: 0, height: 4},
    height: 150,
  },
  shadow: {
    shadowOpacity: 0.35,
    shadowRadius: 5,
    shadowColor: '#000000',
    shadowOffset: {height: 4, width: 0},
    elevation: 5,
  },
  text: {
    marginTop: 15,
    fontSize: 16,
  },
  picker: {
    height: 200,
    fontSize: 16,
  },
});
