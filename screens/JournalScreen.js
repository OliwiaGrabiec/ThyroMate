// import React, {useState, useEffect, useContext} from 'react';
// import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import {Buffer} from 'buffer';
// import {useFocusEffect} from '@react-navigation/native';
// import axios from 'axios';
// import {AuthContext} from '../store/auth-context';
// import {Calendar} from 'react-native-calendars';

// const BASE_URL = 'https://logow-576ee-default-rtdb.firebaseio.com/';
// const JournalScreen = () => {
//   const [selectedMood, setSelectedMood] = useState(null);
//   const [date, setDate] = useState(new Date());
//   const [moodHistory, setMoodHistory] = useState({});
//   const [user_id, setUserId] = useState('');
//   const [days, setDays] = useState([]);

//   const authCtx = useContext(AuthContext);
//   const token = authCtx.token;

//   function decodeBase64Url(str) {
//     str = str.replace(/-/g, '+').replace(/_/g, '/');
//     const missingPadding = 4 - (str.length % 4);
//     if (missingPadding) {
//       str += new Array(missingPadding + 1).join('=');
//     }
//     return Buffer.from(str, 'base64').toString('utf8');
//   }

//   function getUserIdFromToken(token) {
//     const payloadPart = token.split('.')[1];
//     const decodedPayload = decodeBase64Url(payloadPart);
//     const jsonPayload = JSON.parse(decodedPayload);
//     return jsonPayload.user_id;
//   }

//   useEffect(
//     React.useCallback(() => {
//       setUserId(getUserIdFromToken(token));
//     }, [user_id]),
//   );

//   const moods = {
//     happy: 'yellow',
//     sad: 'blue',
//     angry: 'red',
//     relaxed: 'green',
//     excited: 'orange',
//   };

//   const selectMood = async mood => {
//     const moodDateISOString = date.toISOString();
//     const moodRecord = moodHistory[moodDateISOString];

//     if (moodRecord) {
//       try {
//         await axios.put(
//           `${BASE_URL}/users/${user_id}/moods/${moodRecord.id}.json?auth=${token}`,
//           {
//             mood,
//             date: moodDateISOString,
//           },
//         );

//         setMoodHistory(prevMoodHistory => ({
//           ...prevMoodHistory,
//           [moodDateISOString]: {...prevMoodHistory[moodDateISOString], mood},
//         }));
//       } catch (error) {
//         console.error('Error while updating mood data:', error);
//       }
//     } else {
//       try {
//         const response = await axios.post(
//           `${BASE_URL}/users/${user_id}/moods.json`,
//           {
//             mood,
//             date: moodDateISOString,
//           },
//         );

//         setMoodHistory(prevMoodHistory => ({
//           ...prevMoodHistory,
//           [moodDateISOString]: {id: response.data.name, mood},
//         }));

//         setDate(date);
//       } catch (error) {
//         console.error('Error while saving mood data:', error);
//       }
//     }
//   };
//   const loadMoods = async () => {
//     try {
//       const response = await axios.get(
//         `${BASE_URL}/users/${user_id}/moods.json?auth=${token}`,
//       );
//       const loadedMoods = response.data || {};

//       const transformedMoods = {};
//       Object.entries(loadedMoods).forEach(([key, value]) => {
//         const dateKey = new Date(value.date).toISOString().split('T')[0];
//         transformedMoods[dateKey] = {...value, id: key};
//       });

//       setMoodHistory(transformedMoods);
//     } catch (error) {
//       console.error('Error while loading mood data:', error);
//     }
//   };
//   const renderCalendar = () => {
//     let days = [];
//     let startDate = new Date(date.getFullYear(), date.getMonth(), 1);
//     let endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

//     for (let currentDay = 1; currentDay < 30; ++currentDay) {
//       const currentDate = new Date(
//         date.getFullYear(),
//         date.getMonth(),
//         currentDay,
//       );
//       const isoDate = currentDate.toISOString().split('T')[0];
//       const moodRecord = moodHistory[isoDate];
//       const backgroundColor = moodRecord
//         ? moods[moodRecord.mood]
//         : 'transparent';

//       console.log(currentDate);
//       days.push(
//         <View
//           key={currentDate.toDateString()}
//           style={[styles.day, {backgroundColor}]}
//           onPress={() => setDate(currentDate)}>
//           <Text style={styles.dayText}>{currentDate.getDate()}</Text>
//         </View>,
//       );
//     }
//     setDays(days);
//   };
//   return (
//     <View style={styles.container}>
//       <DateTimePicker
//         value={date}
//         mode="date"
//         display="default"
//         onChange={(event, selectedDate) => setDate(selectedDate || date)}
//       />

//       <View style={styles.moodsContainer}>
//         {Object.keys(moods).map(mood => (
//           <TouchableOpacity
//             key={mood}
//             style={[styles.moodButton, {backgroundColor: moods[mood]}]}
//             onPress={() => selectMood(mood)}>
//             <Text style={styles.moodText}>{mood}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <View style={styles.calendar}>{days.map(day => day)}</View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 20,
//   },
//   moodsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     paddingVertical: 20,
//   },
//   moodButton: {
//     padding: 10,
//     borderRadius: 5,
//   },
//   moodText: {
//     color: 'white',
//   },
//   calendar: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'center',
//   },
//   day: {
//     width: 48,
//     height: 48,
//     alignItems: 'center',
//     justifyContent: 'center',
//     margin: 2,
//   },
//   dayText: {
//     color: 'black',
//   },
// });

// export default JournalScreen;
import React, {useState, useEffect, useContext} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Buffer} from 'buffer';
import {useFocusEffect} from '@react-navigation/native';
import axios from 'axios';
import {AuthContext} from '../store/auth-context';
import {Calendar} from 'react-native-calendars';

const BASE_URL = 'https://logow-576ee-default-rtdb.firebaseio.com/';
const JournalScreen = () => {
  //const [selectedMood, setSelectedMood] = useState(null);
  const [date, setDate] = useState(new Date());
  const [moodHistory, setMoodHistory] = useState({});
  const [user_id, setUserId] = useState('');
  //const [days, setDays] = useState([]);
  const [markedDates, setMarkedDates] = useState({});

  const authCtx = useContext(AuthContext);
  const token = authCtx.token;

  function decodeBase64Url(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    const missingPadding = 4 - (str.length % 4);
    if (missingPadding) {
      str += new Array(missingPadding + 1).join('=');
    }
    return Buffer.from(str, 'base64').toString('utf8');
  }

  function getUserIdFromToken(token) {
    const payloadPart = token.split('.')[1];
    const decodedPayload = decodeBase64Url(payloadPart);
    const jsonPayload = JSON.parse(decodedPayload);
    return jsonPayload.user_id;
  }

  useEffect(
    React.useCallback(() => {
      setUserId(getUserIdFromToken(token));
    }, [user_id]),
  );
  // useEffect(() => {
  //   loadMoods();
  // }, [markedDates]);
  const moods = {
    happy: 'yellow',
    sad: 'blue',
    angry: 'red',
    relaxed: 'green',
    excited: 'orange',
  };

  const selectMood = async mood => {
    const moodDateISOString = date.toISOString();
    const moodRecord = moodHistory[moodDateISOString];

    if (moodRecord) {
      try {
        await axios.put(
          `${BASE_URL}/users/${user_id}/moods/${moodRecord.id}.json`,
          {
            mood,
            date: moodDateISOString,
          },
        );

        setMoodHistory(prevMoodHistory => ({
          ...prevMoodHistory,
          [moodDateISOString]: {...prevMoodHistory[moodDateISOString], mood},
        }));
      } catch (error) {
        console.error('Error while updating mood data:', error);
      }
    } else {
      try {
        const response = await axios.post(
          `${BASE_URL}/users/${user_id}/moods.json`,
          {
            mood,
            date: moodDateISOString,
          },
        );

        setMoodHistory(prevMoodHistory => ({
          ...prevMoodHistory,
          [moodDateISOString]: {id: response.data.name, mood},
        }));

        setDate(date);
      } catch (error) {
        console.error('Error while saving mood data:', error);
      }
    }
  };
  const loadMoods = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/users/${user_id}/moods.json?auth=${token}`,
      );
      const loadedMoods = response.data || {};

      const transformedMoods = {};
      Object.entries(loadedMoods).forEach(([key, value]) => {
        const dateKey = new Date(value.date).toISOString().split('T')[0];
        transformedMoods[dateKey] = {...value, id: key};
      });

      setMoodHistory(transformedMoods);
    } catch (error) {
      console.error('Error while loading mood data:', error);
    }
    // const newMarkedDates = {};
    // Object.entries(transformedMoods).forEach(([date, moodData]) => {
    //   newMarkedDates[date] = {
    //     marked: true,
    //     dotColor: moods[moodData.mood],
    //   };
    // });
    // setMarkedDates(newMarkedDates);
  };

  return (
    <View style={styles.container}>
      <View style={styles.moodsContainer}>
        {Object.keys(moods).map(mood => (
          <TouchableOpacity
            key={mood}
            style={[styles.moodButton, {backgroundColor: moods[mood]}]}
            onPress={() => selectMood(mood)}>
            <Text style={styles.moodText}>{mood}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Calendar markedDates={markedDates} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  moodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  moodButton: {
    padding: 10,
    borderRadius: 5,
  },
  moodText: {
    color: 'white',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  day: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  dayText: {
    color: 'black',
  },
});

export default JournalScreen;
