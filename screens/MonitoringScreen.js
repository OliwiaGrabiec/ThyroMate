import React, {useContext, useState, useEffect} from 'react';
import {View, Text, FlatList, Button, Platform, Pressable} from 'react-native';
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

const BASE_URL = 'https://logow-576ee-default-rtdb.firebaseio.com/';

export default function MonitoringScreen({navigation}) {
  const [title, setTitle] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [user_id, setUserId] = useState('');
  const [tests, setTests] = useState([]);
  const [id, setId] = useState('');

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
      loadTests();
    }, [user_id]),
  );
  const loadTests = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/users/${user_id}/tests.json`,
      );
      const loadedTests = [];
      for (const key in response.data) {
        loadedTests.push({
          ...response.data[key],
          id: key,
        });
      }
      setTests(loadedTests);
    } catch (error) {
      console.error('Błąd podczas wczytywania powiadomień z Firebase:', error);
    }
  };

  const addTests = async () => {
    const identifier = new Date().getTime().toString();
    const newTest = {
      id1: identifier,
      title,
    };
    setTests([...tests, newTest]);
    setTitle('');
    try {
      console.log(user_id);

      const response = await axios.post(
        `${BASE_URL}/users/${user_id}/tests.json`,
        newTest,
      );
      newTest.id = response.data.name;
      console.log(newTest.id);
      navigation.navigate('DetailScreen', {idN: newTest.id});
    } catch (error) {
      console.error('Błąd podczas zapisywania powiadomień w Firebase:', error);
    }
    setDialogVisible(false);
  };

  const removeTests = async id => {
    try {
      await axios.delete(`${BASE_URL}/users/${user_id}/tests/${id}.json`);
      setTests(prevTests => prevTests.filter(test => test.id !== id));
    } catch (error) {
      console.error('Błąd podczas usuwania powiadomienia:', error);
    }
  };
  const renderItem = ({item}) => (
    <Pressable
      onPress={() => navigation.navigate('DetailScreen', {title: item.title})}>
      <View style={{paddingVertical: 5}}>
        <Surface style={styles.surface} elevation={4}>
          <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 5}}>
            {item.title}
          </Text>
          <Button
            title="Usuń"
            onPress={() => removeTests(item.id)}
            color="red"
          />
        </Surface>
      </View>
    </Pressable>
  );
  return (
    <PaperProvider>
      <View style={{flex: 1, padding: 30}}>
        <View style={styles.shadow}>
          <IconButton
            icon="plus"
            mode="contained"
            iconColor="black"
            size={40}
            onPress={showDialog}
            style={{backgroundColor: '#ece6f2'}}
          />
        </View>

        <Portal>
          <Dialog
            visible={dialogVisible}
            style={{borderRadius: 10}}
            onDismiss={hideDialog}>
            <Dialog.Title>Dodaj nowe wyniki badań: </Dialog.Title>
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
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                title="Dodaj"
                onPress={addTests}
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
            data={tests}
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
