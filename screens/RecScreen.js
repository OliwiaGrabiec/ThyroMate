import React, {useState, useEffect, useContext} from 'react';
import {View, Text, FlatList, ImageBackground, Button} from 'react-native';
import {StyleSheet} from 'react-native';
import {Portal, PaperProvider, Dialog, Surface} from 'react-native-paper';
import axios from 'axios';
import {AuthContext} from '../store/auth-context';
import {Buffer} from 'buffer';
import {useFocusEffect} from '@react-navigation/native';
import {ActionButton} from '../components/ui/ActionButton';

const BASE_URL = 'https://logow-576ee-default-rtdb.firebaseio.com/';

export default function RecScreen({navigation}) {
  const [recommendations, setRecommendations] = useState([]);
  const [recommendations2, setRecommendations2] = useState([]);
  const [user_id, setUserId] = useState('');
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const showDialog = item => {
    setSelectedItem(item);
    setIsDialogVisible(true);
  };

  const hideDialog = () => {
    setIsDialogVisible(false);
    setSelectedItem(null);
  };

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
  useFocusEffect(
    React.useCallback(() => {
      const loadRecommendations = async () => {
        try {
          await axios
            .get(`${BASE_URL}/users/${user_id}/recommendations.json`)
            .then(response => {
              const loadedRecommendations = [];
              for (const key in response.data) {
                loadedRecommendations.push({
                  ...response.data[key],
                  id: key,
                });
              }
              setRecommendations2(loadedRecommendations);
            })
            .catch(err => console.error('bladf', err));
        } catch (error) {
          console.error(
            'Błąd podczas wczytywania powiadomień z Firebase:',
            error,
          );
        }
      };

      loadRecommendations();
    }, [recommendations]),
  );

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        await axios
          .get(`${BASE_URL}/users/${user_id}/recommendations.json`)
          .then(response => {
            const loadedRecommendations = [];
            for (const key in response.data) {
              loadedRecommendations.push({
                ...response.data[key],
                id: key,
              });
            }
            setRecommendations2(loadedRecommendations);
          })
          .catch(err => console.error('bladf', err));
      } catch (error) {
        console.error(
          'Błąd podczas wczytywania powiadomień z Firebase:',
          error,
        );
      }
    };

    loadRecommendations();
  }, [user_id, recommendations]);

  // const loadRecommendations = async () => {
  //   try {
  //     await axios
  //       .get(`${BASE_URL}/users/${user_id}/recommendations.json`)
  //       .then(response => {
  //         const loadedRecommendations = [];
  //         for (const key in response.data) {
  //           loadedRecommendations.push({
  //             ...response.data[key],
  //             id: key,
  //           });
  //         }
  //         console.log('hej');
  //         setRecommendations(loadedRecommendations);
  //         console.log(recommendations);
  //       })
  //       .catch(err => console.error('bladf', err));
  //   } catch (error) {
  //     console.error('Błąd podczas wczytywania powiadomień z Firebase:', error);
  //   }
  // };
  const removeRecommendation = async id => {
    try {
      const recommendationToDelete = recommendations2.find(
        recommendation => recommendation.id === id,
      );

      if (recommendationToDelete) {
        console.log(recommendationToDelete);

        await axios.delete(
          `${BASE_URL}/users/${user_id}/recommendations/${id}.json`,
        );
        setRecommendations(prevRecommendations =>
          prevRecommendations.filter(
            recommendation => recommendation.id !== id,
          ),
        );
      }
    } catch (error) {
      console.error('Błąd podczas usuwania powiadomienia:', error);
    }
  };

  const renderItem = ({item}) => (
    <View style={{paddingVertical: 5}}>
      <Surface style={styles.surface} elevation={4}>
        <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 5}}>
          {item.title}
        </Text>
        <Text>{item.date}</Text>
        <Button
          title="Zobacz zalecenia"
          onPress={() => showDialog(item)}
          color="black"
        />
        <Button
          title="Usuń"
          onPress={() => removeRecommendation(item.id)}
          color="red"
        />
      </Surface>
    </View>
  );

  return (
    <PaperProvider>
      <ImageBackground
        source={require('../assets/Zaleceniatlo.png')}
        style={styles.rootContainer}>
        <ActionButton onPress={() => navigation.navigate('AddRec')} />
        <Portal.Host>
          <FlatList
            data={recommendations2}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            style={{marginTop: 20}}
          />
        </Portal.Host>
        <Portal>
          <Dialog
            visible={isDialogVisible}
            onDismiss={hideDialog}
            style={{borderRadius: 10}}>
            <Dialog.Title>Zalecenia:</Dialog.Title>
            <Dialog.Content>
              <Text>{selectedItem?.description}</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDialog} title="Zamknij" color="black" />
            </Dialog.Actions>
          </Dialog>
        </Portal>
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
