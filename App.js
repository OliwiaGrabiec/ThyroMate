import { useContext, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppLoading from "expo-app-loading";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { ScrollView } from "react-native";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import MedicineScreen from "./screens/MedicineScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import { Colors } from "./constants/styles";
import AuthContextProvider, { AuthContext } from "./store/auth-context";
import SymptonsScreen from "./screens/SymptomsScreen";
import RecScreen from "./screens/RecScreen";
import MonitoringScreen from "./screens/MonitoringScreen";
import JournalScreen from "./screens/JournalScreen";
import AppGuideScreen from "./screens/AppGuideScreen";
import IconButton from "./components/ui/IconButton";

const HomeStack = createNativeStackNavigator();
const Tab = createMaterialBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: "white",
      }}
    >
      <Stack.Screen
        name="Logowanie"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Rejestracja"
        component={SignupScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function AuthenticatedStack() {
  const authCtx = useContext(AuthContext);
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === "Ekran główny") {
            return <Ionicons name="home" size={25} color={color} />;
          } else if (route.name === "Leki") {
            return <AntDesign name="medicinebox" size={30} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen name="Ekran główny">
        {() => (
          <HomeStack.Navigator screenOptions={{ headerTintColor: "black" }}>
            <HomeStack.Screen
              name="WelcomeScreen"
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
            <HomeStack.Screen
              name="NotificationsScreen"
              component={NotificationsScreen}
              options={{
                title: "Wizyty",
                headerStyle: {
                  height: 150,
                },
              }}
            />
            <HomeStack.Screen
              name="SymptonsScreen"
              component={SymptonsScreen}
              options={{
                title: "Dodaj symptomy",
                headerStyle: {
                  height: 150,
                },
              }}
            />
            <HomeStack.Screen name="RecScreen" component={RecScreen} />
            <HomeStack.Screen
              name="MonitoringScreen"
              component={MonitoringScreen}
            />
            <HomeStack.Screen name="JournalScreen" component={JournalScreen} />
            <HomeStack.Screen
              name="AppGuideScreen"
              component={AppGuideScreen}
            />
          </HomeStack.Navigator>
        )}
      </Tab.Screen>
      <Tab.Screen name="Leki" component={MedicineScreen} />
    </Tab.Navigator>
  );
}

function Navigation() {
  const authCtx = useContext(AuthContext);

  return (
    <NavigationContainer>
      {!authCtx.isAuthenticated && <AuthStack />}
      {authCtx.isAuthenticated && <AuthenticatedStack />}
    </NavigationContainer>
  );
}

function Root() {
  const [isTryingLogin, setIsTryingLogin] = useState(true);

  const authCtx = useContext(AuthContext);

  useEffect(() => {
    async function fetchToken() {
      const storedToken = await AsyncStorage.getItem("token");

      if (storedToken) {
        authCtx.authenticate(storedToken);
      }

      setIsTryingLogin(false);
    }

    fetchToken();
  }, []);

  if (isTryingLogin) {
    return <AppLoading />;
  }

  return <Navigation />;
}

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <AuthContextProvider>
        <Root />
      </AuthContextProvider>
    </>
  );
}
