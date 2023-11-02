import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useNavigation } from "@react-navigation/native";
import {View, Text, Button, StyleSheet, Pressable,Image} from 'react-native';


import IconButton from '../components/ui/IconButton';
import { Colors } from '../constants/styles';
import { AuthContext } from '../store/auth-context';



export default function WelcomeScreen({ navigation }) {

  const [fetchedMessage, setFetchedMesssage] = useState('');

  const authCtx = useContext(AuthContext);
  const token = authCtx.token;

  
 

  return (
    <View>
      <View style={styles.rootContainer}>
        <View style={styles.headerContainer}>
         <View style={styles.cos}>
          <Image  source={require('../assets/thyromate.png')}  style={{ width: 125, height: 125, paddingRight: 150 }}/>
          <IconButton
            icon="exit"
            color='white'
            size={24}
            onPress={authCtx.logout}
          />
          </View>
      </View>
    </View>
    
    <View style={styles.buttonContainer}>
     <View style={styles.buttonRow}>
        <Pressable style={styles.button}
        onPress={() => navigation.navigate('NotificationsScreen')}>
          <Text style={styles.text}>Wizyty</Text>
        </Pressable>
        <Pressable style={styles.button}
        onPress={() => navigation.navigate('SymptonsScreen')}>
          <Text style={styles.text}>Symptony</Text>
        </Pressable>
        </View>
      <View style={styles.buttonRow}>
        <Pressable style={styles.button}
        onPress={() => navigation.navigate('RecScreen')}>
          <Text style={styles.text}>Notatki</Text>
        </Pressable>
        <Pressable style={styles.button}
        onPress={() => navigation.navigate('MonitoringScreen')}>
          <Text style={styles.text}>Badania</Text>
        </Pressable>
      </View>
      <View style={styles.buttonRow}>
        <Pressable style={styles.button}
        onPress={() => navigation.navigate('JournalScreen')}>
          <Text style={styles.text}>Dziennik nastrojów</Text>
        </Pressable>
        <Pressable style={styles.button}
        onPress={() => navigation.navigate('AppGuideScreen')}>
          <Text style={styles.text}>Poradnik</Text>
        </Pressable>
    </View>
    </View>
  
  </View>
  );
}



const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 100,
    backgroundColor:  '#2D9F8E',
    elevation: 5, 
    shadowColor: 'black', 
    shadowOffset: { width: 0, height: -4 }, 
    shadowOpacity: 0.2, 
  },
  title: {
    fontSize: 20,
    marginBottom: 0,
    marginLeft:0,
    marginTop:0,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 400,
    height: 400,
    position: 'absolute',
    top:-90,
    right: 40,
  },
buttonContainer: {
  marginTop: -20,
  backgroundColor: 'white',
  borderRadius: 30,
  height: 800,
  elevation: 5, 
  shadowColor: 'black', 
  shadowOffset: { width: 0, height: -4 }, 
  shadowOpacity: 0.2, 
},
buttonRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 20,
  marginTop:20,
  marginLeft:10,
  alignContent:'center'
},
iconContainer:{
  
},
button: {
  alignItems: 'center',
  justifyContent: 'center',
  width:150,
  height:100,
  paddingVertical: 20,
  paddingHorizontal: 10,
  borderRadius: 10,
  elevation: 3,
  backgroundColor: '#afeeee',
  elevation: 5, 
  shadowColor: 'black', 
  shadowOffset: { width: 0, height: 4 }, 
  shadowOpacity: 0.2, 
  marginTop:30,
  marginHorizontal:20
  
},
text: {
  fontSize: 16,
  lineHeight: 21,
  letterSpacing: 0.25,
  color: 'black',
  
},
cos: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginRight: 40,
},
cos2: {
  flexDirection: 'row',
  justifyContent: 'space-between',
}
});