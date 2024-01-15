import React from 'react';
import {View, Text, ImageBackground, Image} from 'react-native';
import {StyleSheet} from 'react-native';

import Swiper from 'react-native-swiper';

export default function AppSwiper({route}) {
  const {text} = route.params;
  const renderContent = () => {
    switch (text) {
      case 'Diet':
        return (
          <Swiper
            style={styles.wrapper}
            showsButtons={true}
            prevButton={<Text style={styles.arrow}>‹</Text>}
            nextButton={<Text style={styles.arrow}>›</Text>}>
            <View style={styles.slide}>
              <Image source={require('../assets/1.png')} style={styles.image} />
            </View>
            <View style={styles.slide}>
              <Image
                source={require('../assets/dieta_1.png')}
                style={styles.image}
              />
            </View>
            <View style={styles.slide}>
              <Image
                source={require('../assets/dieta_2.png')}
                style={styles.image}
              />
            </View>
            <View style={styles.slide}>
              <Image
                source={require('../assets/dieta_3.png')}
                style={styles.image}
              />
            </View>
          </Swiper>
        );
      case 'Daily':
        return (
          <Swiper
            style={styles.wrapper}
            showsButtons={true}
            prevButton={<Text style={styles.arrow}>‹</Text>}
            nextButton={<Text style={styles.arrow}>›</Text>}>
            <View style={styles.slide}>
              <Image source={require('../assets/4.png')} style={styles.image} />
            </View>
            <View style={styles.slide}>
              <Image
                source={require('../assets/zycie_1.png')}
                style={styles.image}
              />
            </View>
            <View style={styles.slide}>
              <Image
                source={require('../assets/zycie_2.png')}
                style={styles.image}
              />
            </View>
            <View style={styles.slide}>
              <Image
                source={require('../assets/zycie_3.png')}
                style={styles.image}
              />
            </View>
          </Swiper>
        );
      case 'Cos':
        return (
          <Swiper
            style={styles.wrapper}
            showsButtons={true}
            prevButton={<Text style={styles.arrow}>‹</Text>}
            nextButton={<Text style={styles.arrow}>›</Text>}>
            <View style={styles.slide}>
              <Image source={require('../assets/6.png')} style={styles.image} />
            </View>
            <View style={styles.slide}>
              <Image
                source={require('../assets/pamiec_1.png')}
                style={styles.image}
              />
            </View>
            <View style={styles.slide}>
              <Image
                source={require('../assets/pamiec_2.png')}
                style={styles.image}
              />
            </View>
          </Swiper>
        );
      default:
        return;
    }
  };

  return renderContent();
}
const styles = StyleSheet.create({
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
  },
  slide2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#97CAE5',
  },
  slide3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#92BBD9',
  },

  text: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
  },

  arrow: {
    color: 'black',
    fontSize: 60,
    fontWeight: 500,
  },

  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
