import * as React from 'react';
import {View, StyleSheet} from 'react-native';
import {IconButton} from 'react-native-paper';

export function ActionButton({onPress}) {
  return (
    <View
      style={{
        ...styles.shadow,
        position: 'absolute',
        bottom: 0,
        right: 10,
        zIndex: 999,
      }}>
      <IconButton
        icon="plus"
        mode="contained"
        iconColor="black"
        size={40}
        onPress={() => onPress()}
        style={{
          backgroundColor: '#afeeee',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowOpacity: 0.35,
    shadowRadius: 5,
    shadowColor: '#000000',
    shadowOffset: {height: 4, width: 0},
    elevation: 5,
    marginLeft: 30,
    marginBottom: 10,
    marginTop: 10,
  },
});
