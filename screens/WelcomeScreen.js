import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useNavigation } from "@react-navigation/native";
import {View, Text, Button, StyleSheet, Pressable,Image} from 'react-native';


import IconButton from '../components/ui/IconButton';
import { AuthContext } from '../store/auth-context';
import { LinearGradient } from 'expo-linear-gradient';


export default function WelcomeScreen({ navigation }) {
  const authCtx = useContext(AuthContext);

  return (
    <LinearGradient
    colors={['#2D9F8E', '#8a66af']}
    style={{ flex: 1 }}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    >
    <View style={styles.rootContainer}>
      <View style={styles.headerContainer}>
        <Image  source={require('../assets/thyromate.png')}  style={{ width: 150, height: 150 }}/>
        <View style={styles.iconColumn}>
            <IconButton
                icon="exit"
                color='white'
                size={40}
                onPress={authCtx.logout} 
            />
            <Text style={styles.iconLabel}>Wyloguj się</Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <View style={styles.buttonRow}>
          <Pressable style={styles.button}
          onPress={() => navigation.navigate('NotificationsScreen')}>
            <Image source={require('../assets/reminders.png')} style={{width: 100, height:100}}/>
            <Text style={styles.text}>Wizyty</Text>
          </Pressable>
          <Pressable style={styles.button}
          onPress={() => navigation.navigate('SymptonsScreen')}>
           <Image source={require('../assets/symptoms.png')} style={{width: 100, height:100}}/>
            <Text style={styles.text}>Symptomy</Text>
          </Pressable>
        </View>
        <View style={styles.buttonRow}>
          <Pressable style={styles.button}
          onPress={() => navigation.navigate('RecScreen')}>
            <Image source={require('../assets/zalecenia.png')} style={{width: 100, height:100}}/>
            <Text style={styles.text}>Zalecenia</Text>
          </Pressable>
          <Pressable style={styles.button}
          onPress={() => navigation.navigate('MonitoringScreen')}>
            <Image source={require('../assets/badania.png')} style={{width: 100, height:100}}/>
            <Text style={styles.text}>Badania</Text>
          </Pressable>
        </View>
        <View style={styles.buttonRow}>
          <Pressable style={styles.button}
          onPress={() => navigation.navigate('JournalScreen')}>
            <Image source={require('../assets/moods.png')} style={{width: 90, height:90}}/>
            <Text style={styles.text}>Dziennik </Text>
            <Text style={styles.text}>nastrojów</Text>
          </Pressable>
          <Pressable style={styles.button}
          onPress={() => navigation.navigate('AppGuideScreen')}>
            <Image source={require('../assets/guide.png')} style={{width: 100, height:100}}/>
            <Text style={styles.text}>Poradnik</Text>
          </Pressable>
      </View>
    </View>
  </View>
  </LinearGradient>
    
  );
}



const styles = StyleSheet.create({
  rootContainer: {
    flex: 1, 
    marginTop:5
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 40,
    marginTop: 60,
  },
buttonContainer: {
  backgroundColor: 'white',
  borderRadius: 30,
  height: 800,
  elevation: 5, 
  shadowColor: 'black', 
  shadowOffset: { width: 0, height: -4 }, 
  shadowOpacity: 0.2, 
  marginTop: -20
},
buttonRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: -10,
  marginTop:10,
  marginLeft:10,
  marginRight:10,
  alignContent:'center'
},
button: {
  width: '40%', 
  aspectRatio: 1,
  justifyContent: 'center', 
  alignItems: 'center', 
  marginBottom:0, 
  margin: '5%',
  borderRadius: 10,
  backgroundColor: '#afeeee',
  elevation:5,
  shadowColor: 'black', 
  shadowOffset: { width: 0, height: 4 }, 
  shadowOpacity: 0.2, 
  shadowRadius: 4,
},
text: {
  fontSize: 16,
  lineHeight: 21,
  letterSpacing: 0.25,
  color: 'black',
},
iconColumn:{
  flexDirection: 'column',
  alignContent: 'center',
  justifyContent: 'space-between',
  marginBottom:40 ,
},
iconLabel:{
  color: 'white',
  textAlign: 'center',
  fontSize: 16,
  marginLeft: -15
}
});