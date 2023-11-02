import React, { useState, useEffect,useContext } from 'react';
import { View, Text, FlatList,  Button, Platform, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { StyleSheet } from "react-native";
import {Portal, PaperProvider, Dialog,  Surface, IconButton, MD3Colors   } from 'react-native-paper';
import { TextInput } from 'react-native-paper';
import axios from 'axios';
import { AuthContext } from '../store/auth-context';
import { Buffer } from 'buffer';

const BASE_URL ='https://logow-576ee-default-rtdb.firebaseio.com/';

export default function App() {
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);

  const authCtx = useContext(AuthContext);

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

const token = authCtx.token; // Zakładając, że masz już token
const userId = getUserIdFromToken(token);
console.log(userId);



  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/notifications/${token}.json`);
      const loadedNotifications = [];
      for (const key in response.data) {
        loadedNotifications.push({
          ...response.data[key],
          id: key
        });
      }
      setNotifications(loadedNotifications);
    } catch (error) {
      console.error('Błąd podczas wczytywania powiadomień z Firebase:', error);
    }
  };

  const addNotification = async () => {
   
  const identifier = new Date().getTime().toString();
  const trigger = date.getTime() - new Date().getTime();
  const notificationContent = {
    title,
    body: description,
    data: { identifier },
  };
  await Notifications.scheduleNotificationAsync({
    content: notificationContent,
    trigger: { seconds: trigger / 1000 },
  });
  const newNotification = {
    id: identifier,
    title,
    description,
    date: date.toLocaleString(),
  };
  setNotifications([...notifications, newNotification]);
  setTitle('');
  setDescription('');
  setDate(new Date());
  try {
    const response = await axios.post(`${BASE_URL}/users/notifications.json`, newNotification);
    newNotification.id = response.data.name;
  } catch (error) {
    console.error('Błąd podczas zapisywania powiadomień w Firebase:', error);
    if (error.response) {
      // Błąd odpowiedzi serwera
      console.error('Data:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // Żądanie zostało zrobione, ale nie otrzymaliśmy odpowiedzi
      console.error('Request:', error.request);
    } else {
      // Coś poszło źle w trakcie tworzenia żądania
      console.error('Error:', error.message);
    }
  
  }
  setDialogVisible(false);
};

const removeNotification = async (id) => {
  try {
    const notificationToDelete = notifications.find((notification) => notification.id === id);

    if (notificationToDelete) {
      const scheduledId = notificationToDelete.data?.identifier;

      if (scheduledId) {
        await Notifications.cancelScheduledNotificationAsync(scheduledId);
      }
      await axios.delete(`${BASE_URL}/notifications/${token}/${id}.json`);
      setNotifications((prevNotifications) => prevNotifications.filter((notification) => notification.id !== id));
    }
  } catch (error) {
    console.error('Błąd podczas usuwania powiadomienia:', error);
  }
};

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    setDate(selectedDate || date);
  };


  const showDialog = () => setDialogVisible(true);

  const hideDialog = () => setDialogVisible(false);

  const renderItem = ({ item }) => (
    <View style={{  paddingVertical:5 }}>
      <Surface style={styles.surface} elevation={4}>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.title}</Text>
        <Text>{item.description}</Text>
        <Text>{item.date}</Text>
        <Button title="Usuń" onPress={() => removeNotification(item.id)} color="black"/>
      </Surface>
    </View>
  );

  return (
    <PaperProvider>
    <View style={{ flex: 1, padding: 30 }}>
    
      <IconButton
              icon="plus"
              mode='contained'
              iconColor={MD3Colors.error50}
              containerColor='blue'
              size={40}
              onPress={showDialog}
              />
        
          <Portal>
            <Dialog visible={dialogVisible}  onDismiss={hideDialog}>
              <Dialog.Title>Dodaj nowe powiadomienie</Dialog.Title>
               <Dialog.Content>
                  <TextInput
            mode="outlined"
            outlineColor='#008080'
            activeOutlineColor='#008080'
          
              label="Tytuł"
              value={title}
              onChangeText={(text) => setTitle(text)}
              style={styles.text}
            />
            <TextInput
            mode="outlined"
            outlineColor='#008080'
            activeOutlineColor='#008080'
          
              label="Opis"
              value={description}
              onChangeText={(text) => setDescription(text)}
              style={styles.text}
            
            />

            <Button title="Wybierz date" onPress={showDatepicker} style={styles.button} color="black"/>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="datetime"
                display="default"
                onChange={handleDateChange}
                style={styles.czasdata}
              />
            )}
            </Dialog.Content>
            <Dialog.Actions>
              <Button title="Dodaj" onPress={addNotification} style={styles.button} color="black"/>
              <Button title="Zamknij" onPress={() => setDialogVisible(false)} style={styles.button} color="black"/>
            </Dialog.Actions>
          </Dialog>
      </Portal>
      <Portal.Host>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 20 }}
      />
      </Portal.Host>
      
    </View>
    </PaperProvider>
  );
}
const styles = StyleSheet.create({
text: {
 

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
  color: 'black'
},
buttonText: {
  color: 'black',
  fontWeight: 'bold',
  fontSize: 16,
},
czasdata: {
  justifyContent: 'center',
  width: 260,
  marginTop: 10,
  paddingRight:50
},
delete: {

},
surface: {
  padding: 6,
  marginRight:10,
  marginLeft:10,
  alignItems: 'center',
  justifyContent: 'center',
},
});