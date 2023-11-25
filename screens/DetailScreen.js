import React, {useContext, useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  Alert,
  Platform,
  Pressable,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {StyleSheet} from 'react-native';
import {
  Portal,
  PaperProvider,
  Dialog,
  Surface,
  IconButton,
} from 'react-native-paper';
import {TextInput} from 'react-native-paper';
import {Buffer} from 'buffer';
import {useFocusEffect} from '@react-navigation/native';
import axios from 'axios';
import {AuthContext} from '../store/auth-context';
import {LineChart} from 'react-native-chart-kit';

const BASE_URL = 'https://logow-576ee-default-rtdb.firebaseio.com/';

export default function DetailScreen({route}) {
  const {title} = route.params;

  const [title1, setTitle1] = useState('');
  const [date, setDate] = useState(new Date());
  const [dialogVisible, setDialogVisible] = useState(false);
  const [user_id, setUserId] = useState('');
  const [testsDetail, setTestsDetail] = useState([]);
  const [testsDetail2, setTestsDetail2] = useState([]);
  const [testResult, setTestResult] = useState([]);

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
      loadDetail();
    }, [user_id]),
  );

  // useEffect(() => {
  //   setUserId(getUserIdFromToken(token));
  // }, []);
  useEffect(() => {
    loadDetail();
  }, [testsDetail]);

  const handleTitle1Change = text => {
    const formattedText = text.replace(',', '.');
    const value = parseFloat(formattedText);
    if (!isNaN(value)) {
      setTitle1(formattedText);
    } else {
      setTitle1('');
    }
  };

  const data = {
    labels:
      testsDetail.length > 0
        ? testsDetail2.map(detail => {
            const [datePart] = detail.date.split(', ');
            const [day, month] = datePart.split('/');
            return `${day}/${month}`;
          })
        : ['1', '2', '3', '4', '5'],
    datasets: [
      {
        data:
          testsDetail2.length > 0
            ? testsDetail2.map(detail => parseFloat(detail.title1))
            : [0, 0, 0, 0, 0],
      },
    ],
  };
  const loadDetail = async () => {
    console.log('hej');
    try {
      const response = await axios.get(
        `${BASE_URL}/users/${user_id}/history/${title}.json`,
      );
      const loadedTestsDetail = [];
      for (const key in response.data) {
        loadedTestsDetail.push({
          ...response.data[key],
          id: key,
        });
      }
      console.log(testsDetail2);
      setTestsDetail2(loadedTestsDetail);
    } catch (error) {
      console.error('Błąd podczas wczytywania powiadomień z Firebase:', error);
    }
  };

  const addDetail = async () => {
    if (!title1.trim()) {
      Alert.alert('Błąd', 'Nie możesz dodać pustej wartości');
      return;
    }
    const identifier = new Date().getTime().toString();
    const newTestDetail = {
      id: identifier,
      title1: parseFloat(title1),
      date: date.toLocaleString(),
    };
    setTestsDetail([...testsDetail, newTestDetail]);
    setTitle1('');
    setDate(new Date());
    setTestResult([...testResult, parseFloat(title1)]);
    try {
      const response = await axios.post(
        `${BASE_URL}/users/${user_id}/history/${title}.json`,
        newTestDetail,
      );
      newTestDetail.id = response.data.name;
    } catch (error) {
      console.error('Błąd podczas zapisywania powiadomień w Firebase:', error);
    }
    setDialogVisible(false);
  };
  const removeDetail = async id => {
    try {
      await axios.delete(
        `${BASE_URL}/users/${user_id}/history/${title}/${id}.json`,
      );
      setTestsDetail2(prevTestsDetail =>
        prevTestsDetail.filter(testDetail => testDetail.id !== id),
      );
    } catch (error) {
      console.error('Błąd podczas usuwania powiadomienia:', error);
    }
  };
  const renderItem = ({item}) => (
    <View style={{paddingVertical: 5}}>
      <Surface style={styles.surface} elevation={4}>
        <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 5}}>
          {item.title1?.toString() || 'No value'}
        </Text>
        <Text>{item.date}</Text>
        <Button
          title="Usuń"
          onPress={() => removeDetail(item.id)}
          color="red"
        />
      </Surface>
    </View>
  );
  return (
    <PaperProvider>
      <View style={{flex: 1, padding: 5}}>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{fontSize: 20, fontWeight: 'bold'}}>{title}</Text>
          <LineChart
            data={data}
            width={370}
            height={300}
            yAxisInterval={1}
            chartConfig={{
              backgroundGradientFrom: '#8a66af',
              backgroundGradientTo: '#8a66af',
              backgroundGradientToOpacity: 0.7,
              color: (opacity = 1) => `rgba(35, 26, 44, ${opacity})`,
              strokeWidth: 2,
              barPercentage: 0.5,
              useShadowColorFromDataset: false,

              style: {},
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#c5b3d7',
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 10,
            }}
          />
        </View>
        <View
          style={{
            ...styles.shadow,
            position: 'absolute',
            bottom: 10,
            right: 10,
            zIndex: 999,
          }}>
          <IconButton
            icon="plus"
            mode="contained"
            iconColor="black"
            size={35}
            onPress={showDialog}
            style={{backgroundColor: '#8a66af'}}
          />
        </View>
        <Portal>
          <Dialog
            visible={dialogVisible}
            style={{borderRadius: 10}}
            onDismiss={hideDialog}>
            <Dialog.Title>Dodaj wyniki badań: </Dialog.Title>
            <Dialog.Content>
              <TextInput
                mode="outlined"
                outlineColor="#8a66af"
                activeOutlineColor="#8a66af"
                label="Wynik Badania"
                value={title1}
                keyboardType="numeric"
                onChangeText={handleTitle1Change}
                style={styles.text}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                title="Dodaj"
                onPress={addDetail}
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
          <Text style={{fontSize: 18, marginLeft: 10}}>Historia wyników:</Text>
          <FlatList
            data={testsDetail2}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            style={{marginTop: 20}}
          />
        </Portal.Host>
      </View>
    </PaperProvider>
  );
}
const styles = StyleSheet.create({
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
    height: 100,
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
