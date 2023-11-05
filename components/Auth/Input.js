import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/styles';
import { TextInput} from 'react-native-paper';

function Input({
  label,
  keyboardType,
  secure,
  onUpdateValue,
  value,
  isInvalid,
}) {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        mode='outlined'
        outlineColor= 'white'
        activeOutlineColor='white'
        textColor='white'
        theme={{ colors: { placeholder: 'white', text: 'white', primary: 'white',underlineColor:'transparent', background : 'transparent'}}}
        style={styles.input}
        autoCapitalize="none"
        keyboardType={keyboardType}
        secureTextEntry={secure}
        onChangeText={onUpdateValue}
        value={value}
        label={label}
      />
    </View>
  );
}

export default Input;

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 8,
  },
  input: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    height: 35,
    backgroundColor: 'transparent', 
    fontSize: 20,           
  },
  
});