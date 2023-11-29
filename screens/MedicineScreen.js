import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Keyboard,
  Button,
  FlatList,
  TouchableWithoutFeedback,
  ImageBackground,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {AuthContext} from '../store/auth-context';
import {Buffer} from 'buffer';
import * as Notifications from 'expo-notifications';
import {Switch} from 'react-native-paper';
import {
  Portal,
  PaperProvider,
  Dialog,
  Surface,
  TextInput,
} from 'react-native-paper';
import {ActionButton} from '../components/ui/ActionButton';
import {useRegisterNotifications} from '../hooks/useRegisterNotifications';

const BASE_URL = 'https://logow-576ee-default-rtdb.firebaseio.com/';

export default function MedicineScreen({navigation}) {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [tookMedicine, setTookMedicine] = useState(false);
  const [] = useRegisterNotifications();
  const [user_id, setUserId] = useState('');
  const [notifyId, setNotifyId] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notifications2, setNotifications2] = useState([]);
  const [medications, setMedications] = useState([]);
  const authCtx = useContext(AuthContext);
  const token = authCtx.token;

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
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  useEffect(() => {
    const userId = getUserIdFromToken(token);
    setUserId(userId);
  }, [user_id]);

  useEffect(() => {
    const loadMedicine = async () => {
      try {
        await await axios
          .get(`${BASE_URL}/users/${user_id}/medicine.json`)
          .then(response => {
            const loadedNotifications = [];
            for (const key in response.data) {
              loadedNotifications.push({
                ...response.data[key],
                id: key,
              });
            }
            console.log(response.data);
            setNotifications2(loadedNotifications);
          })
          .catch(err => console.error('bladf', err));
      } catch (error) {
        console.error(
          'Błąd podczas wczytywania powiadomień z Firebase:',
          error,
        );
      }
    };

    loadMedicine();
    console.log(user_id);
  }, [user_id, notifications]);
  const addMedicine = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        date: date,
        sound: 'notifications-sound-127856.wav',
      },
      trigger: {repeats: true, hour: 20, minute: 12, channelId: 'new-emails'},
    })
      .then(async notifyId => {
        console.log('ahs', notifyId);
        setNotifyId(notifyId);
        const newNotification = {
          id1: notifyId ? notifyId : ' ',
          title,
          date: date.toLocaleString(),
        };
        setNotifications([...notifications, newNotification]);
        setTitle('');
        setDate(new Date());
        try {
          console.log(user_id);

          const response = await axios.post(
            `${BASE_URL}/users/${user_id}/medicine.json`,
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

    setVisible(false);
  };

  const removeMedicine = async id => {
    try {
      const notificationToDelete = notifications2.find(
        notification => notification.id === id,
      );
      if (!notificationToDelete) return;

      console.log(notificationToDelete);

      const scheduledId = notificationToDelete.id1;
      console.log(scheduledId);
      if (scheduledId) {
        await Notifications.cancelScheduledNotificationAsync(scheduledId);
      }
      await axios.delete(`${BASE_URL}/users/${user_id}/medicine/${id}.json`);
      setNotifications2(prevNotifications =>
        prevNotifications.filter(notification => notification.id !== id),
      );
    } catch (error) {
      console.error('Błąd podczas usuwania powiadomienia:', error);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setDate(selectedDate || date);
  };

  const handleToggleMedication = async id => {
    const updatedMedications = notifications2.map(med => {
      if (med.id === id) {
        return {...med, taken: !med.taken};
      }
      return med;
    });
    console.log(updatedMedications);
    setNotifications2(updatedMedications);
    await AsyncStorage.setItem(
      'medications',
      JSON.stringify(updatedMedications),
    );
  };

  const renderItem = ({item}) => (
    <View style={{paddingVertical: 5}}>
      <Surface style={styles.surface} elevation={4}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 5,
            marginHorizontal: 10,
          }}>
          {item.title}
        </Text>
        <Text>{item.date}</Text>
        <Text style={styles.text}>Odznacz wzięcie leków:</Text>
        <Switch
          value={item.taken}
          onValueChange={() => handleToggleMedication(item.id)}
        />
        <Button
          title="Usuń"
          onPress={async () => await removeMedicine(item.id)}
          color="red"
        />
      </Surface>
    </View>
  );

  return (
    <PaperProvider>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ImageBackground
          source={require('../assets/Leki.png')}
          style={styles.rootContainer}>
          <View style={styles.overlay} />
          <ActionButton onPress={showModal} />
          <Portal>
            <Dialog
              visible={visible}
              onDismiss={hideModal}
              style={{
                borderRadius: 10,

                justifyContent: 'center',
                alignContent: 'center',
              }}>
              <TouchableWithoutFeedback
                onPress={Keyboard.dismiss}
                accessible={false}>
                <View>
                  <Dialog.Content>
                    <TextInput
                      mode="outlined"
                      outlineColor="#8a66af"
                      activeOutlineColor="#8a66af"
                      label="Lek"
                      value={title}
                      onChangeText={text => setTitle(text)}
                      style={styles.text}
                    />
                    <DateTimePicker
                      value={date}
                      mode="datetime"
                      display="default"
                      onChange={handleDateChange}
                      style={styles.czasdata}
                    />
                  </Dialog.Content>
                  <Dialog.Actions>
                    <Button
                      title="Dodaj"
                      onPress={async () => await addMedicine()}
                      style={styles.button}
                      color="pink"
                    />
                    <Button
                      title="Zamknij"
                      onPress={hideModal}
                      style={styles.button}
                      color="pink"
                    />
                  </Dialog.Actions>
                </View>
              </TouchableWithoutFeedback>
            </Dialog>
          </Portal>
          <Portal.Host>
            <FlatList
              data={notifications2}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              style={{marginTop: 20}}
            />
          </Portal.Host>
          {/* <View style={styles.buttonContainer}>
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
          </View> */}
        </ImageBackground>
      </TouchableWithoutFeedback>
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
    fontSize: 10,
  },
});
