import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Button,
  FlatList,
  TouchableWithoutFeedback,
  ImageBackground,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Switch, TextInput } from "react-native-paper";
import { DateTime } from "luxon";
import {
  Portal,
  PaperProvider,
  Dialog,
  Surface,
  IconButton,
} from "react-native-paper";

export default function MedicineScreen({ navigation }) {
  const [wantsNotification, setWantsNotification] = useState(false);
  const [notificationTime, setNotificationTime] = useState("");
  const [tookMedicine, setTookMedicine] = useState(false);
  const [notificationId, setNotificationId] = useState(null);
  const [tabletsCount, setTabletsCount] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [title, setTitle] = useState("");
  const [count, setCount] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  const showDialog = () => setDialogVisible(true);

  const hideDialog = () => setDialogVisible(false);

  const loadInitialState = async () => {
    const storedTookMedicine = await AsyncStorage.getItem("tookMedicine");
    const storedNotificationTime =
      await AsyncStorage.getItem("notificationTime");
    if (storedTookMedicine !== null)
      setTookMedicine(JSON.parse(storedTookMedicine));
    if (storedNotificationTime !== null)
      setNotificationTime(storedNotificationTime);
  };
  const loadStartDate = async () => {
    const storedStartDate = await AsyncStorage.getItem("startDate");
    if (storedStartDate) setStartDate(storedStartDate);
  };
  useEffect(() => {
    loadNotifications();
    loadStartDate();
    loadInitialState();
  }, []);

  useEffect(() => {
    const updateTabletsCount = async () => {
      if (tabletsCount > 0) {
        const updatedCount = tabletsCount - 1;
        setTabletsCount(updatedCount);
        await AsyncStorage.setItem("tabletsCount", String(updatedCount));
      }
    };

    const checkTimeAndUpdateCount = async () => {
      const now = DateTime.local().setZone("Europe/Warsaw");
      if (now.hour === 0 && now.minute === 0) {
        await updateTabletsCount();
        setTookMedicine(false);
        AsyncStorage.setItem("tookMedicine", "false");
      }
    };

    const intervalId = setInterval(checkTimeAndUpdateCount, 60000);

    return () => {
      clearInterval(intervalId);
    };
  }, [tabletsCount]);

  const calculateNotificationDate = (count) => {
    const daysBeforeEnd = count - 10;
    const currentDate = DateTime.local().setZone("Europe/Warsaw");
    const notificationDate = currentDate.plus({ days: daysBeforeEnd });
    return notificationDate;
  };

  const scheduleTabletNotification = async (date) => {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Zapas leków kończy się",
        body: "Pozostało 10 dni zapasu leków.",
      },
      trigger: {
        year: date.year,
        month: date.month,
        day: date.day,
        hour: 10,
        minute: 42,
        repeats: false,
      },
    });
    return id;
  };
  const scheduleDailyNotification = async (hour, minute) => {
    const now = DateTime.local();
    const triggerTime = now.set({ hour, minute });

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Czas na leki",
        body: "Zaznacz, że wziąłeś leki.",
      },
      trigger: {
        hour: triggerTime.hour,
        minute: triggerTime.minute,
        repeats: true,
      },
    });

    setNotificationId(id);
    AsyncStorage.setItem("notificationTime", `${hour}:${minute}`);
    return id;
  };

  const handleTimeChange = async (event, selectedTime) => {
    setTimePickerVisible(false);
    if (selectedTime) {
      const timeString = selectedTime.toLocaleTimeString().slice(0, 5);
      setNotificationTime(timeString);
      if (wantsNotification) {
        try {
          if (notificationId) {
            await Notifications.cancelScheduledNotificationAsync(
              notificationId,
            );
          }
          const [hour, minute] = timeString.split(":");
          const newNotificationId = await scheduleDailyNotification(
            Number(hour),
            Number(minute),
          );

          // Check that newNotificationId is not undefined before attempting to set it in AsyncStorage
          if (newNotificationId) {
            setNotificationId(newNotificationId);
            await AsyncStorage.setItem("notificationTime", `${hour}:${minute}`);
            await AsyncStorage.setItem(
              "notificationId",
              newNotificationId.toString(),
            ); // Make sure to convert to string
          } else {
            // Handle the case where newNotificationId is undefined
            console.error("Failed to get a new notification ID");
          }
        } catch (e) {
          // Handle the error
          console.error(e);
        }
      }
    }
  };

  useEffect(() => {
    const polandTime = DateTime.local().setZone("Europe/Warsaw");
    const midnightResetTimer = setInterval(() => {
      const now = DateTime.local().setZone("Europe/Warsaw");
      if (now.hour === 0 && now.minute === 0) {
        setTookMedicine(false);
        AsyncStorage.setItem("tookMedicine", "false");
      }
    }, 60000);

    return () => {
      clearInterval(midnightResetTimer);
    };
  }, []);

  useEffect(() => {
    if (wantsNotification && notificationTime) {
      const updateNotification = async () => {
        if (notificationId) {
          await Notifications.cancelScheduledNotificationAsync(notificationId);
        }
        const [hour, minute] = notificationTime.split(":");
        const newNotificationId = await scheduleDailyNotification(
          Number(hour),
          Number(minute),
        );
        setNotificationId(newNotificationId);
      };

      updateNotification();
    }
  }, [wantsNotification, notificationTime]);

  const handleTookMedicineChange = (value) => {
    setTookMedicine(value);
    AsyncStorage.setItem("tookMedicine", JSON.stringify(value));
  };

  const handleTabletsCountChange = async (count) => {
    setTabletsCount(count);
    const currentCount = parseInt(count, 10);
    const storedNotificationId = await AsyncStorage.getItem(
      "tabletNotificationId",
    );
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(
        storedNotificationId,
      );
    }

    if (currentCount === 10) {
      const currentDate = DateTime.local().setZone("Europe/Warsaw");
      AsyncStorage.setItem("startDate", currentDate.toString());
      setStartDate(currentDate.toString());

      const notificationDate = calculateNotificationDate(currentCount);
      const id = await scheduleTabletNotification(notificationDate);
      setNotificationId(id);
      await AsyncStorage.setItem("tabletNotificationId", id);
    }
  };

  useEffect(() => {
    // Funkcja do przywrócenia ID powiadomienia z AsyncStorage
    const restoreTabletNotificationId = async () => {
      try {
        const storedTookMedicine = await AsyncStorage.getItem("tookMedicine");
        if (storedTookMedicine !== null) {
          setTookMedicine(JSON.parse(storedTookMedicine));
        }
      } catch (error) {
        console.error("Error parsing tookMedicine:", error);
        // Handle the error, for example by resetting the stored value
      }
    };
    restoreTabletNotificationId();
  }, []);

  const renderItem = ({ item }) => (
    <View style={{ paddingVertical: 5 }}>
      <Surface style={styles.surface} elevation={4}>
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 5 }}>
          {item.title}
        </Text>
        <Text>{item.count}</Text>
        <Button
          title="Usuń"
          onPress={() => removeMedicine(item.id)}
          color="red"
        />
      </Surface>
    </View>
  );

  const addMedicine = async () => {
    const newMedicine = {
      id: Date.now().toString(),
      title,
      count: count,
    };
    setMedicines([...medicines, newMedicine]);
    setTitle("");
    setCount("");
    try {
      await AsyncStorage.setItem("medicines", JSON.stringify(medicines));
    } catch (error) {
      console.error(
        "Błąd podczas zapisywania powiadomień w async storage",
        error,
      );
    }
    if (count <= 10) {
      await scheduleTabletNotification(newMedicine);
    }
    setDialogVisible(false);
  };
  const removeMedicine = async (id) => {
    try {
      const medicineToDelete = medicines.find((medicine) => medicine.id === id);

      if (medicineToDelete) {
        const scheduledId = medicineToDelete.data?.identifier;

        if (scheduledId) {
          await Notifications.cancelScheduledNotificationAsync(scheduledId);
        }

        setNotifications((prevMedicines) =>
          prevMedicines.filter((medicine) => medicine.id !== id),
        );
      }
    } catch (error) {
      console.error("Błąd podczas usuwania powiadomienia:", error);
    }
  };
  // const loadNotifications = async () => {
  //   try {
  //     const response = await axios.get(`${BASE_URL}/users/${user_id}/medicines.json`);
  //     const loadedNotifications = [];
  //     for (const key in response.data) {
  //       loadedNotifications.push({
  //         ...response.data[key],
  //         id: key
  //       });
  //     }
  //     setMedicines(loadedNotifications);
  //   } catch (error) {
  //     console.error('Błąd podczas wczytywania powiadomień z Firebase:', error);
  //   }
  // };
  return (
    <PaperProvider>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ImageBackground
          source={require("../assets/Leki.png")}
          style={styles.rootContainer}
        >
          <View style={styles.overlay} />
          <View style={styles.buttonContainer}>
            <Text style={styles.text}>Odznacz wzięcie leków:</Text>
            <Switch
              value={tookMedicine}
              onValueChange={handleTookMedicineChange}
              style={styles.checkbox}
              color={tookMedicine ? "blue" : undefined}
            />
            <Text style={styles.text}>
              Czy chcesz codziennie dostawać powiadomienie o przyjmowaniu leków?
            </Text>
            <Switch
              value={wantsNotification}
              onValueChange={(value) => setWantsNotification(value)}
              style={styles.checkbox}
              color={wantsNotification ? "blue" : undefined}
            />
            {wantsNotification && (
              <View>
                <Text style={styles.text}>Wybierz godzinę:</Text>
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={handleTimeChange}
                  style={{}}
                />
              </View>
            )}
            <Text style={styles.text}>Dodaj leki i ich ilość:</Text>
            <IconButton
              icon="plus"
              mode="contained"
              iconColor="black"
              size={40}
              onPress={showDialog}
              style={{ backgroundColor: "#ece6f2" }} // Set the background color here
            />
            {/* <TextInput
            value={tabletsCount}
            onChangeText={handleTabletsCountChange}
            style={styles.input}
            keyboardType="numeric"
          /> */}
          </View>

          <Portal>
            <Dialog
              visible={dialogVisible}
              style={{ borderRadius: 10 }}
              onDismiss={hideDialog}
            >
              <Dialog.Title>Dodaj nowe leki i ich ilość: </Dialog.Title>
              <Dialog.Content>
                <TextInput
                  mode="outlined"
                  outlineColor="#8a66af"
                  activeOutlineColor="#8a66af"
                  label="Nazwa leku"
                  value={title}
                  onChangeText={(text) => setTitle(text)}
                  style={styles.text}
                />
                <TextInput
                  mode="outlined"
                  outlineColor="#8a66af"
                  activeOutlineColor="#8a66af"
                  label="Opis"
                  value={description}
                  onChangeText={(text) => setDescription(text)}
                  style={styles.text}
                />
              </Dialog.Content>
              <Dialog.Actions>
                <Button
                  title="Dodaj"
                  onPress={addMedicine}
                  style={styles.button}
                  color="black"
                />
                <Button
                  title="Zamknij"
                  onPress={() => setDialogVisible(false)}
                  style={styles.button}
                  color="black"
                />
              </Dialog.Actions>
            </Dialog>
          </Portal>
          <Portal.Host>
            <FlatList
              data={medicines}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              style={{ marginTop: 20 }}
            />
          </Portal.Host>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </PaperProvider>
  );
}

const commonShadow = {
  elevation: 5,
  shadowColor: "black",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
    backgroundColor: "rgba(0, 0, 0, 0.1)",

    alignItems: "center",
    ...commonShadow,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  headerContainer: {
    flex: 1,
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    alignSelf: "stretch",
  },
  buttonContainer: {
    marginTop: 100,
    marginHorizontal: 20,
  },
  checkbox: {
    alignSelf: "center",
    marginVertical: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    width: 150,
    height: 100,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#afeeee",
    ...commonShadow,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 21,
    letterSpacing: 0.25,
    color: "black",
    marginVertical: 10,
  },
});
