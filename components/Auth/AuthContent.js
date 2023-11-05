import { useState } from 'react';
import {Pressable, StyleSheet, Text,  Alert,  View,Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import AuthForm from './AuthForm';

function AuthContent({ isLogin, onAuthenticate }) {
  const navigation = useNavigation();

  const [credentialsInvalid, setCredentialsInvalid] = useState({
    email: false,
    password: false,
    confirmEmail: false,
    confirmPassword: false,
  });

  function switchAuthModeHandler() {
    if (isLogin) {
      navigation.replace('Rejestracja');
    } else {
      navigation.replace('Logowanie');
    }
  }

  function submitHandler(credentials) {
    let { email, confirmEmail, password, confirmPassword } = credentials;

    email = email.trim();
    password = password.trim();

    const emailIsValid = email.includes('@');
    const passwordIsValid = password.length > 6;
    const emailsAreEqual = email === confirmEmail;
    const passwordsAreEqual = password === confirmPassword;

    if (
      !emailIsValid ||
      !passwordIsValid ||
      (!isLogin && (!emailsAreEqual || !passwordsAreEqual))
    ) {
      Alert.alert('Błędne dane wejściowe', 'Sprawdź poprawność podanych danych uwierzytelniających.');
      setCredentialsInvalid({
        email: !emailIsValid,
        confirmEmail: !emailIsValid || !emailsAreEqual,
        password: !passwordIsValid,
        confirmPassword: !passwordIsValid || !passwordsAreEqual,
      });
      return;
    }
    onAuthenticate({ email, password });
  }

  return (
    <LinearGradient
    colors={['#2D9F8E', '#8a66af']}
    style={{ flex: 1 }}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
  >
      <View style={styles.authContent}>
          <View style={styles.cos}>
            <Image  source={require('../../assets/thyromate2.png')}  style={{ width: 200, height: 200 }}/>
          </View>
          <View style={styles.authContent1}>
            <AuthForm
              isLogin={isLogin}
              onSubmit={submitHandler}
              credentialsInvalid={credentialsInvalid}
            />
            <View style={styles.buttons}>
              <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.pressed]}
              onPress={switchAuthModeHandler}
              >
                <View>
                  <Text style={styles.buttonText}>{isLogin ? 'Zarejestruj się' : 'Zaloguj się jako istniejący użytkownik'}</Text>
                </View>
              </Pressable>
            </View>
        </View>
      </View>
      
    </LinearGradient>
  );
}

export default AuthContent;

const styles = StyleSheet.create({
  authContent: {
    flex: 1,
    marginTop: 150,
    
  },
  cos:{
    justifyContent: 'center',
    alignItems: 'center',
  },
  authContent1: {
  marginHorizontal: 20,
   padding: 20,
  },
  buttons: {
    marginTop: 8,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white'
  },
});