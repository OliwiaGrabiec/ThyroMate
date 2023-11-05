import { useContext, useState } from 'react';
import { Alert } from 'react-native';
import AuthContent from '../components/Auth/AuthContent';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { AuthContext } from '../store/auth-context';
import { createUser } from '../util/auth';
import { LinearGradient } from 'expo-linear-gradient';
function SignupScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authCtx = useContext(AuthContext);

  async function signupHandler({ email, password }) {
    setIsAuthenticating(true);
    try {
      const token = await createUser(email, password);
      authCtx.authenticate(token);
    } catch (error) {
      Alert.alert(
        'Błąd uwierzytelniania!',
        'Nie udało się utworzyć użytkownika. Proszę sprawdź swoje dane wejściowe i spróbuj ponownie później.'
      );
      setIsAuthenticating(false);
    }
  }

  if (isAuthenticating) {

    return <LinearGradient
    colors={['#2D9F8E', '#8a66af']}
    style={{ flex: 1 }}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    >
    <LoadingOverlay message="Rejestracja trwa..." />
    </LinearGradient>;
  }

  return <AuthContent onAuthenticate={signupHandler} />;
}

export default SignupScreen;