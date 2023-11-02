import React, { useContext, useState, useEffect } from 'react';
import { View, Text,  Button, StyleSheet } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../store/auth-context';

export default function SymptomsScreen({ navigation }) {

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Profile Screen</Text>
      <Button
        title="Go to home"
        onPress={() => navigation.navigate('WelcomeScreen')}
      />
    </View>
  );
}