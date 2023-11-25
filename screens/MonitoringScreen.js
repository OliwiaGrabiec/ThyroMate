import React, {useContext, useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  ImageBackground,
  Alert,
  Pressable,
} from 'react-native';
import {StyleSheet} from 'react-native';
import {Portal, PaperProvider, Dialog, Surface} from 'react-native-paper';
import {TextInput} from 'react-native-paper';
import {Buffer} from 'buffer';
import {useFocusEffect} from '@react-navigation/native';
import axios from 'axios';
import {AuthContext} from '../store/auth-context';
import {ActionButton} from '../components/ui/ActionButton';

const BASE_URL = 'https://logow-576ee-default-rtdb.firebaseio.com/';

export default function MonitoringScreen({navigation}) {
  const [title, setTitle] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [user_id, setUserId] = useState('');
  const [tests, setTests] = useState([]);
  const [tests2, setTests2] = useState([]);

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

  // useFocusEffect(
  //   React.useCallback(() => {
  //     setUserId(getUserIdFromToken(token));
  //     loadTests();
  //   }, [user_id]),
  // );
  useEffect(() => {
    setUserId(getUserIdFromToken(token));
  }, []);
  useEffect(() => {
    loadTests();
  }, [tests]);

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
      setTests2(loadedTests);
    } catch (error) {
      console.error('Błąd podczas wczytywania powiadomień z Firebase:', error);
    }
  };

  const addTests = async () => {
    if (!title.trim()) {
      Alert.alert('Błąd', 'Nie możesz dodać pustej wartości');
      return;
    }
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
      setTests2(prevTests => prevTests.filter(test => test.id !== id));
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
      <ImageBackground
        source={require('../assets/Monitoring.png')}
        style={styles.rootContainer}>
        <View style={styles.overlay} />

        <ActionButton onPress={showDialog} />
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
            data={tests2}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            style={{marginTop: 20}}
          />
        </Portal.Host>
      </ImageBackground>
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
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    //alignItems: 'center',
    ...commonShadow,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
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
