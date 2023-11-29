import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  Button,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {StyleSheet} from 'react-native';
import {PaperProvider, IconButton} from 'react-native-paper';
import {TextInput} from 'react-native-paper';
import {Buffer} from 'buffer';
import {useFocusEffect} from '@react-navigation/native';
import axios from 'axios';
import {AuthContext} from '../store/auth-context';

const BASE_URL = 'https://logow-576ee-default-rtdb.firebaseio.com/';

export default function AddRec({route}) {
  const {title, date} = route.params || {};
  const [recommendations, setRecommendations] = useState([]);
  const [title2, setTitle2] = useState(title || '');
  const [description, setDescription] = useState('');
  const [date2, setDate2] = useState(date ? date : new Date());
  const [user_id, setUserId] = useState('');

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
  useFocusEffect(
    React.useCallback(() => {
      setUserId(getUserIdFromToken(token));
    }, [user_id]),
  );

  const addRecommendation = async () => {
    const identifier = new Date().getTime().toString();
    const newRecommendation = {
      id1: identifier,
      title: title2,
      description,
      date: date2.toLocaleString(),
    };
    console.log(date);
    setRecommendations([...recommendations, newRecommendation]);
    setTitle2('');
    setDescription('');
    setDate2(new Date());
    try {
      console.log(user_id);

      const response = await axios.post(
        `${BASE_URL}/users/${user_id}/recommendations.json`,
        newRecommendation,
      );
      newRecommendation.id = response.data.name;
    } catch (error) {
      console.error('Błąd podczas zapisywania powiadomień w Firebase:', error);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setDate2(selectedDate || date2);
  };
  return (
    <PaperProvider>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {!title && (
            <TextInput
              mode="outlined"
              outlineColor="#8a66af"
              activeOutlineColor="#8a66af"
              label="Tytuł wizyty"
              value={title2}
              onChangeText={text => setTitle2(text)}
              style={{width: Platform.OS === 'ios' ? 300 : null}}
            />
          )}

          {!date && (
            <>
              <Text style={{marginTop: 20}}>Wybierz datę wizyty: </Text>

              <DateTimePicker
                value={date2}
                mode="datetime"
                display="default"
                onChange={handleDateChange}
                style={{marginTop: 20}}
              />
            </>
          )}
          <TextInput
            multiline
            numberOfLines={6}
            maxLength={40}
            mode="outlined"
            outlineColor="#8a66af"
            activeOutlineColor="#8a66af"
            label="Opis"
            value={description}
            onChangeText={text => setDescription(text)}
            style={{
              height: Platform.OS === 'ios' ? 300 : null,
              width: Platform.OS === 'ios' ? 300 : null,
              marginTop: 20,
            }}
          />
          <Button
            title="Dodaj"
            onPress={async () => await addRecommendation()}
            style={{marginTop: 20}}
            color="purple"
          />
        </View>
      </TouchableWithoutFeedback>
    </PaperProvider>
  );
}
