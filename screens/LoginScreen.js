import { useContext, useState } from 'react';
import { Alert } from 'react-native';
import AuthContent from '../components/Auth/AuthContent';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { AuthContext } from '../store/auth-context';
import { login } from '../util/auth';
import { LinearGradient } from 'expo-linear-gradient';
function LoginScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authCtx = useContext(AuthContext);

  async function loginHandler({ email, password }) {
    setIsAuthenticating(true);
    try {
      const token = await login(email, password);
      authCtx.authenticate(token);
    } catch (error) {
      Alert.alert(
        'Błąd uwierzytelniania!',
        'Nie udało się zalogować. Proszę sprawdź swoje dane uwierzytelniające lub spróbuj ponownie później!'
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
    <LoadingOverlay message="Logowanie trwa..." 
    />
    </LinearGradient>;
  }


  return <AuthContent isLogin onAuthenticate={loginHandler} />;
}

export default LoginScreen;