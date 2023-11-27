import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {Buffer} from 'buffer';
import {useFocusEffect} from '@react-navigation/native';
import axios from 'axios';
import {AuthContext} from '../store/auth-context';
import {Calendar} from 'react-native-calendars';
import {FontAwesome5} from '@expo/vector-icons';
import {PieChart} from 'react-native-chart-kit';
import {LocaleConfig} from 'react-native-calendars';

const BASE_URL = 'https://logow-576ee-default-rtdb.firebaseio.com/';

LocaleConfig.locales['pl'] = {
  monthNames: [
    'Styczeń',
    'Luty',
    'Marzec',
    'Kwiecień',
    'Maj',
    'Czerwiec',
    'Lipiec',
    'Sierpień',
    'Wrzesień',
    'Październik',
    'Listopad',
    'Grudzień',
  ],
  dayNames: [
    'Poniedziałek',
    'Wtorek',
    'Środa',
    'Czwartek',
    'Piątek',
    'Sobota',
    'Niedziela',
  ],
  dayNamesShort: ['Pon.', 'Wt.', 'Śr.', 'Czw.', 'Pią.', 'Sob.', 'Niedz.'],
};
LocaleConfig.defaultLocale = 'pl';

const JournalScreen = () => {
  //const [selectedMood, setSelectedMood] = useState(null);
  const [date, setDate] = useState(new Date());
  const [moodHistory, setMoodHistory] = useState({});
  const [moodHistory2, setMoodHistory2] = useState({});
  const [user_id, setUserId] = useState('');
  //const [days, setDays] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

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
  useFocusEffect(
    React.useCallback(() => {
      setUserId(getUserIdFromToken(token));
      //  loadMoods();
    }, [user_id]),
  );
  // useEffect(() => {
  //   loadMoods();
  //   console.log(moodHistory);
  // }, [moodHistory]);
  useEffect(() => {
    const loadMoods = async () => {
      try {
        await axios
          .get(`${BASE_URL}/users/${user_id}/moods.json`)
          .then(response => {
            const loadedMoods = response.data || {};

            const transformedMoods = {};
            Object.entries(loadedMoods).forEach(([key, value]) => {
              const dateKey = new Date(value.date).toISOString().split('T')[0];
              transformedMoods[dateKey] = {...value, id: key};
            });

            setMoodHistory2(transformedMoods);
            const newMarkedDates = {};
            Object.entries(transformedMoods).forEach(([date, moodData]) => {
              newMarkedDates[date] = {
                marked: true,
                dotColor: moods[moodData.mood],
              };
            });
            setMarkedDates(newMarkedDates);
          });
      } catch (error) {
        console.error('Error while loading mood data:', error);
      }
    };
    loadMoods();
  }, [user_id, moodHistory]);
  const moodNamesMap = {
    happy: 'szczęśliwy',
    tired: 'zmęczony',
    excited: 'podekscytowany',
    sad: 'smutny',
    angry: 'zły',
  };
  const moods = {
    happy: '#D0BBE6',
    tired: '#D6BAF1',
    excited: '#C59CEB',
    sad: '#8A6DA5',
    angry: '#634E76',
  };
  const moodIcons = {
    happy: 'smile',
    tired: 'tired',
    excited: 'meh',
    sad: 'frown',
    angry: 'angry',
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
  // const loadMoods = async () => {
  //   try {
  //     const response = await axios.get(
  //       `${BASE_URL}/users/${user_id}/moods.json`,
  //     );
  //     const loadedMoods = (await response.data) || {};

  //     const transformedMoods = {};
  //     Object.entries(loadedMoods).forEach(([key, value]) => {
  //       const dateKey = new Date(value.date).toISOString().split('T')[0];
  //       transformedMoods[dateKey] = {...value, id: key};
  //     });

  //     setMoodHistory2(transformedMoods);
  //     const newMarkedDates = {};
  //     Object.entries(transformedMoods).forEach(([date, moodData]) => {
  //       newMarkedDates[date] = {
  //         marked: true,
  //         dotColor: moods[moodData.mood],
  //       };
  //     });
  //     setMarkedDates(newMarkedDates);
  //   } catch (error) {
  //     console.error('Error while loading mood data:', error);
  //   }
  // };
  const prepareChartData = (moods, selectedMonth) => {
    let moodCounts = {};
    Object.entries(moods).forEach(([date, moodData]) => {
      if (new Date(date).getMonth() === selectedMonth) {
        moodCounts[moodData.mood] = (moodCounts[moodData.mood] || 0) + 1;
      }
    });

    return Object.keys(moodCounts).map(mood => {
      let moodColor;
      switch (mood) {
        case 'happy':
          moodColor = '#D0BBE6';
          break;
        case 'tired':
          moodColor = '#D6BAF1';
          break;
        case 'excited':
          moodColor = '#C59CEB';
          break;
        case 'sad':
          moodColor = '#8A6DA5';
          break;
        case 'angry':
          moodColor = '#634E76';
          break;
        default:
          moodColor = 'grey'; // Fallback color
      }
      console.log(`Mood: ${mood}, Color: ${moodColor}`);
      return {
        name: ' ', //moodNamesMap[mood] || mood,
        population: moodCounts[mood],
        color: moodColor,
        legendFontColor: '#7F7F7F',
        legendFontSize: 15,
      };
    });
  };
  const isMoodHistory2NotEmpty = Object.keys(moodHistory2).length > 0;
  const onDayPress = day => {
    const newDate = new Date(day.dateString);
    setSelectedMonth(newDate.getMonth());
  };
  return (
    <ScrollView style={styles.container}>
      <Calendar
        onDayPress={onDayPress}
        markedDates={markedDates}
        theme={{
          arrowColor: '#634E76',
          todayTextColor: '#634E76',
        }}
      />
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          padding: 10,
          marginTop: 10,
        }}>
        <Text style={styles.questionText}>Zaznacz swój dzisiejszy humor:</Text>
      </View>
      <View style={styles.moodsContainer}>
        {Object.keys(moods).map(mood => (
          <TouchableOpacity
            key={mood}
            style={[styles.moodButton]}
            onPress={() => selectMood(mood)}>
            <FontAwesome5
              name={moodIcons[mood]}
              size={40}
              color={moods[mood]}
            />
          </TouchableOpacity>
        ))}
      </View>
      <PieChart
        data={prepareChartData(moodHistory2, selectedMonth)}
        width={400}
        height={150}
        chartConfig={{
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 0,
          },
        }}
        style={
          {
            // marginVertical: 0,
            // borderRadius: 10,
            // marginRight: 10,
          }
        }
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="0"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //alignItems: 'center',
    //justifyContent: 'center',
  },
  moodsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
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
  questionText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default JournalScreen;
