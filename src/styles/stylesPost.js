import { StyleSheet,Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
export  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding:16,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor:'#AA98A9',
    },
    text : {
        fontSize:20,
        color:'#83333333'
    }
});
