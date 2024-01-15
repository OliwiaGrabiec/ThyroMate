import * as React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Button,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {Agenda} from 'react-native-calendars';
import {useEffect, useState, useContext} from 'react';
import {format} from 'date-fns';
import {useFocusEffect} from '@react-navigation/native';
import {Modal, Portal, Dialog, PaperProvider} from 'react-native-paper';
import {TextInput} from 'react-native-paper';
import {Buffer} from 'buffer';
import axios from 'axios';
import {AuthContext} from '../store/auth-context';
import {ActionButton} from '../components/ui/ActionButton';
import {LocaleConfig} from 'react-native-calendars';

const BASE_URL = 'https://logow-576ee-default-rtdb.firebaseio.com/';

LocaleConfig.locales['pl'] = {
  monthNames: [
    'Styczeń',
    'Luty',
    'Marzec',
    'Kwiecień',
    'Maj',
    'Czerwiec',
    'Lipiec',
    'Sierpień',
    'Wrzesień',
    'Październik',
    'Listopad',
    'Grudzień',
  ],
  dayNames: [
    'Poniedziałek',
    'Wtorek',
    'Środa',
    'Czwartek',
    'Piątek',
    'Sobota',
    'Niedziela',
  ],
  dayNamesShort: ['Pon.', 'Wt.', 'Śr.', 'Czw.', 'Pią.', 'Sob.', 'Niedz.'],
};
LocaleConfig.defaultLocale = 'pl';

export default function SymptomsScreen({navigation}) {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [rate, setRate] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [symptoms, setSymptoms] = useState([]);
  const [symptoms2, setSymptoms2] = useState([]);
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

  useEffect(() => {
    const userId = getUserIdFromToken(token);
    setUserId(userId);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await axios
          .get(`${BASE_URL}/users/${user_id}/symptoms.json`)
          .then(response => {
            if (response.data === null) return;
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
                id: key,
                title: symptom.title,
                description: symptom.description,
                rate: symptom.rate,
              });
            }
            setItems({...symptomsForAgenda});
            setSymptoms2(loadedSymptoms);
          });
      } catch (error) {
        console.error('Błąd podczas wczytywania objawów z Firebase:', error);
      }
    })();
  }, [user_id, date, symptoms]);

  const onDayPress = day => {
    setDate(new Date(day.timestamp));
  };

  const parseAndFormatDate = dateString => {
    const [datePart, timePart] = dateString.split(', ');
    const [day, month, year] = datePart.split('/');
    const [hours, minutes, seconds] = timePart.split(':');

    const date = new Date(year, month - 1, day, hours, minutes, seconds);
    return format(date, 'yyyy-MM-dd');
  };

  const containerStyle = {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignContent: 'center',
  };

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
      const symptomToDeleteIndex = symptoms2.findIndex(
        symptom => symptom.id === id,
      );

      if (symptomToDeleteIndex !== -1) {
        const symptomToDelete = symptoms2[symptomToDeleteIndex];
        const formattedSymptomDate = parseAndFormatDate(symptomToDelete.date);

        await axios.delete(`${BASE_URL}/users/${user_id}/symptoms/${id}.json`);

        setSymptoms2(currentSymptoms =>
          currentSymptoms.filter(symptom => symptom.id !== id),
        );

        setItems(currentItems => {
          const updatedItems = {...currentItems};

          if (updatedItems[formattedSymptomDate]) {
            updatedItems[formattedSymptomDate] = updatedItems[
              formattedSymptomDate
            ].filter(symptom => symptom.id !== id);

            if (updatedItems[formattedSymptomDate].length === 0) {
              delete updatedItems[formattedSymptomDate];
            }
          }

          return updatedItems;
        });
      }
    } catch (error) {
      console.error('Error while removing symptom:', error);
    }
  };
  const levelStyles = {
    niski: '#afeeee',
    średni: '#FFE4B5',
    wysoki: '#FF6347',
  };
  const defaultColor = 'gray';

  const renderItem = item => (
    <View
      style={{
        padding: 10,
        backgroundColor: '#e5e4e2',
        borderRadius: 30,
        marginTop: 10,
        marginHorizontal: 10,
      }}>
      <View style={{marginHorizontal: 10, marginTop: 5}}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 5,
          }}>
          {item.title}
        </Text>
        <Text>{item.description}</Text>
      </View>
      <View
        style={{
          width: 70,
          height: 30,
          marginLeft: 200,
          marginBottom: 10,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 30,
          backgroundColor: levelStyles[item.rate] ?? defaultColor,
        }}>
        <Text>{item.rate}</Text>
      </View>
      <Button
        title="Usuń"
        onPress={() => removeSymptoms(item.id)}
        color="red"
      />
    </View>
  );

  return (
    <PaperProvider>
      <View style={styles.container}>
        <ActionButton onPress={showModal} />
        <Agenda
          items={items}
          onDayPress={onDayPress}
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
            agendaTodayColor: '#77d4d4',
            todayTextColor: '#77d4d4',
            selectedDayBackgroundColor: '#77d4d4',
            dotColor: '#77d4d4',
          }}
          style={styles.calendarWrapper}
          scrollEnabled={true}></Agenda>
        <Portal>
          <Dialog
            visible={visible}
            onDismiss={hideModal}
            contentContainerStyle={containerStyle}>
            <TouchableWithoutFeedback
              onPress={Keyboard.dismiss}
              accessible={false}>
              <View>
                <Dialog.Content>
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
                        <Text style={{color: 'white'}}>
                          {level.toUpperCase()}
                        </Text>
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
                </Dialog.Content>
                <Dialog.Actions>
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
                </Dialog.Actions>
              </View>
            </TouchableWithoutFeedback>
          </Dialog>
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
    padding: 40,
    marginRight: 10,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
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
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30,
  },
});
