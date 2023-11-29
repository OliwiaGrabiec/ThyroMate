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
import Swiper from 'react-native-swiper';

export default function AppGuideScreen({navigation}) {
  return (
    <View style={{paddingVertical: 5}}>
      <Surface style={styles.surface} elevation={4}>
        <View style={{flex: 1, flexDirection: 'row'}}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              marginBottom: 5,
              marginHorizontal: 10,
            }}>
            Dieta
          </Text>
        </View>
      </Surface>
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {},
  slide1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
  },
  slide2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#97CAE5',
  },
  slide3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#92BBD9',
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
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
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30,
  },
});
