import React from 'react';
import {View, Text} from 'react-native';
import {StyleSheet, TouchableWithoutFeedback} from 'react-native';
import {Surface} from 'react-native-paper';

export default function AppGuideScreen({navigation}) {
  return (
    <View style={{paddingVertical: 5}}>
      <TouchableWithoutFeedback
        onPress={() => navigation.navigate('AppSwiper', {text: 'Diet'})}>
        <Surface style={styles.surface} elevation={4}>
          <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 5,
                marginHorizontal: 10,
              }}>
              Dieta
            </Text>
          </View>
        </Surface>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback
        onPress={() => navigation.navigate('AppSwiper', {text: 'Daily'})}>
        <Surface style={styles.surface} elevation={4}>
          <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 5,
                marginHorizontal: 10,
              }}>
              Codzienne życie
            </Text>
          </View>
        </Surface>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback
        onPress={() => navigation.navigate('AppSwiper', {text: 'Cos'})}>
        <Surface style={styles.surface} elevation={4}>
          <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 5,
                marginHorizontal: 10,
              }}>
              Stres i pamięć
            </Text>
          </View>
        </Surface>
      </TouchableWithoutFeedback>
    </View>
  );
}
const styles = StyleSheet.create({
  surface: {
    padding: 20,
    marginRight: 10,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: ' center',
    borderRadius: 10,
    height: 180,
    marginTop: 10,
    backgroundColor: '#afeeee',
  },
});
