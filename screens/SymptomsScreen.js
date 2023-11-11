import * as React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Button,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {Agenda} from 'react-native-calendars';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useEffect, useState, useContext} from 'react';
import {addDays, format, parseISO} from 'date-fns';
import {useFocusEffect} from '@react-navigation/native';
import {
  Modal,
  Portal,
  IconButton,
  Surface,
  PaperProvider,
} from 'react-native-paper';
import {TextInput} from 'react-native-paper';
import {Buffer} from 'buffer';
import axios from 'axios';

import {AuthContext} from '../store/auth-context';

const BASE_URL = 'https://logow-576ee-default-rtdb.firebaseio.com/';

export default function SymptomsScreen({navigation}) {
  const [visible, setVisible] = React.useState(false);
  const [title, setTitle] = useState('');
  const [rate, setRate] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [symptoms, setSymptoms] = useState([]);
  const [user_id, setUserId] = useState('');
  const [items, setItems] = useState({});

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

  useFocusEffect(
    React.useCallback(() => {
      const userId = getUserIdFromToken(token);
      setUserId(userId);
    }, [token]),
  );

  const onDayPress = day => {
    setDate(new Date(day.timestamp));
    loadSymptomsForDay();
  };
  const parseAndFormatDate = dateString => {
    const [datePart, timePart] = dateString.split(', ');
    const [day, month, year] = datePart.split('/');
    const [hours, minutes, seconds] = timePart.split(':');

    const date = new Date(year, month - 1, day, hours, minutes, seconds);
    return format(date, 'yyyy-MM-dd');
  };
  const loadSymptomsForDay = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/users/${user_id}/symptoms.json`,
      );
      const symptomsForAgenda = {};
      const loadedSymptoms = [];
      for (const key in response.data) {
        loadedSymptoms.push({
          ...response.data[key],
          id: key,
        });

        const symptom = response.data[key];
        const formattedSymptomDate = parseAndFormatDate(symptom.date);

        if (!symptomsForAgenda[formattedSymptomDate]) {
          symptomsForAgenda[formattedSymptomDate] = [];
        }

        symptomsForAgenda[formattedSymptomDate].push({
          //...symptom,
          id: key,
          title: symptom.title,
          description: symptom.description,
          rate: symptom.rate,
        });
      }
      console.log(symptoms);
      console.log(JSON.stringify(symptomsForAgenda));
      setItems({...symptomsForAgenda});
      setSymptoms(loadedSymptoms);
    } catch (error) {
      console.error('Błąd podczas wczytywania objawów z Firebase:', error);
    }
  };

  const containerStyle = {backgroundColor: 'white', padding: 20};
  const addSymptoms = async () => {
    const identifier = new Date().getTime().toString();
    const newSymptom = {
      id: identifier,
      title,
      rate,
      description,
      date: date.toLocaleString(),
    };
    setSymptoms([...symptoms, newSymptom]);
    setTitle('');
    setRate('');
    setDescription('');
    setDate(new Date());
    try {
      const response = await axios.post(
        `${BASE_URL}/users/${user_id}/symptoms.json`,
        newSymptom,
      );
      newSymptom.id = response.data.name;
    } catch (error) {
      console.error('Błąd podczas zapisywania powiadomień w Firebase:', error);
    }
    setVisible(false);
  };

  const removeSymptoms = async id => {
    try {
      const symptomToDeleteIndex = symptoms.findIndex(
        symptom => symptom.id === id,
      );
      if (symptomToDeleteIndex !== -1) {
        const symptomToDelete = symptoms[symptomToDeleteIndex];
        const formattedSymptomDate = parseAndFormatDate(symptomToDelete.date);
        console.log(`Deleting symptom from date: ${formattedSymptomDate}`);

        await axios.delete(`${BASE_URL}/users/${user_id}/symptoms/${id}.json`);

        setSymptoms(currentSymptoms =>
          currentSymptoms.filter(symptom => symptom.id !== id),
        );

        setItems(currentItems => {
          const updatedItems = {...currentItems};
          updatedItems[formattedSymptomDate] = updatedItems[
            formattedSymptomDate
          ].filter(symptom => symptom.id !== id);

          if (updatedItems[formattedSymptomDate].length === 0) {
            delete updatedItems[formattedSymptomDate];
          }

          return updatedItems;
        });
      }
    } catch (error) {
      console.error('Error while removing symptom:', error);
    }
  };
  const levelStyles = {
    niski: 'lightblue',
    średni: 'orange',
    wysoki: 'red',
  };
  const defaultColor = 'gray';

  const renderItem = item => (
    <View style={{paddingVertical: 5}}>
      <Surface style={styles.surface} elevation={4}>
        <View>
          <View style={{}}>
            <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 5}}>
              {item.title}
            </Text>
            <Text>{item.description}</Text>
          </View>
          <View
            style={{
              //padding: 10,
              width: 80,
              height: 40,
              marginLeft: 200,
              marginBottom: 10,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 30,
              backgroundColor: levelStyles[item.rate] ?? defaultColor,
            }}>
            <Text>{item.rate}</Text>
          </View>
        </View>
        <Button
          title="Usuń"
          onPress={() => removeSymptoms(item.id)}
          color="red"
        />
      </Surface>
    </View>
  );

  const rowHasChanged = (r1, r2) => {
    return r1.name !== r2.name;
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <View
          style={{
            ...styles.shadow,
            position: 'absolute',
            bottom: 0,
            right: 10,
            zIndex: 999,
          }}>
          <IconButton
            icon="plus"
            mode="contained"
            iconColor="black"
            size={40}
            onPress={showModal}
            style={{
              backgroundColor: '#afeeee',
            }}
          />
        </View>
        <Agenda
          items={items}
          onDayPress={onDayPress}
          rowHasChanged={rowHasChanged}
          renderItem={renderItem}
          renderEmptyData={() => {
            return (
              <View style={styles.emptyDate}>
                <Text style={{textAlign: 'center'}}>
                  Brak symptomów na ten dzień.
                </Text>
              </View>
            );
          }}
          selected={format(new Date(), 'yyyy-MM-dd')}
          theme={{
            //agendaKnobColor: 'pink', // knob color
            // backgroundColor: 'pink', // background color below agenda
            agendaTodayColor: 'pink',
            todayTextColor: 'pink',
            //textSectionTitleColor: 'pink',
            selectedDayBackgroundColor: 'pink', // calendar sel date
            //dayTextColor: 'pink', // calendar day
            dotColor: 'pink', // dots
          }}
          style={styles.calendarWrapper}
          scrollEnabled={true}></Agenda>
        <Portal>
          <Modal
            visible={visible}
            onDismiss={hideModal}
            contentContainerStyle={containerStyle}>
            <TextInput
              mode="outlined"
              outlineColor="#8a66af"
              activeOutlineColor="#8a66af"
              label="Symptom"
              value={title}
              onChangeText={text => setTitle(text)}
              style={styles.text}
            />
            <Text style={styles.text}>Zaznacz stopień nasilenia: </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                padding: 10,
              }}>
              {['niski', 'średni', 'wysoki'].map(level => (
                <TouchableOpacity
                  key={level}
                  style={{
                    padding: 10,
                    width: 80,
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 20,
                    backgroundColor:
                      rate === level ? levelStyles[level] : defaultColor,
                  }}
                  onPress={() => setRate(level)}>
                  <Text style={{color: 'white'}}>{level.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              mode="outlined"
              outlineColor="#8a66af"
              activeOutlineColor="#8a66af"
              label="Opis"
              value={description}
              onChangeText={text => setDescription(text)}
              style={styles.text}
            />
            <Button
              title="Dodaj"
              onPress={addSymptoms}
              style={styles.button}
              color="pink"
            />
            <Button
              title="Zamknij"
              onPress={hideModal}
              style={styles.button}
              color="pink"
            />
          </Modal>
        </Portal>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  absolute: {
    height: 100,
  },
  container: {
    flex: 1,
  },
  calendarWrapper: {},
  items: {},
  dayPressColor: {
    backgroundColor: '#000000',
  },
  itemContainer: {
    backgroundColor: 'white',
    margin: 5,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  surface: {
    padding: 6,
    marginRight: 10,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    //shadowOffset: { width: 0, height: 4 },
    height: 130,
    marginTop: 10,
    backgroundColor: '#afeeee',
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  shadow: {
    shadowOpacity: 0.35,
    shadowRadius: 5,
    shadowColor: '#000000',
    shadowOffset: {height: 4, width: 0},
    elevation: 5,
    marginLeft: 30,
    marginBottom: 10,
    marginTop: 10,
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30,
  },
});
