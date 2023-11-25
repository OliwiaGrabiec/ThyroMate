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
import {StyleSheet} from 'react-native';
import {Portal, PaperProvider, Dialog, Surface} from 'react-native-paper';
import {TextInput} from 'react-native-paper';
import axios from 'axios';
import {AuthContext} from '../store/auth-context';
import {Buffer} from 'buffer';
import {useFocusEffect} from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker';
import Checkbox from 'expo-checkbox';
import {ActionButton} from '../components/ui/ActionButton';

export default function AppGuideScreen({navigation}) {
  const [description2, setDescription2] = useState('');
  const [dialogVisible2, setDialogVisible2] = useState(false);
  const showDialog2 = () => setDialogVisible2(true);

  const hideDialog2 = () => setDialogVisible2(false);
  useEffect(() => {
    console.log(description2);
  }, [description2]);
  return (
    <PaperProvider>
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Text>Profile Screen</Text>
        <ActionButton onPress={showDialog2} />
        <Portal>
          <Dialog
            visible={dialogVisible2}
            style={{borderRadius: 10, width: 300}}
            onDismiss={hideDialog2}>
            <Dialog.Title>Dodaj nowe zalecenia: </Dialog.Title>
            <Dialog.Content>
              <Text>Zalecenia: </Text>

              <TextInput
                multiline
                mode="outlined"
                outlineColor="#8a66af"
                activeOutlineColor="#8a66af"
                label="Opis"
                value={description2}
                onChangeText={text => setDescription2(text)}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                title="Zamknij"
                onPress={() => setDialogVisible2(false)}
                color="black"
              />
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </PaperProvider>
  );
}
