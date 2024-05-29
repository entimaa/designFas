import { StyleSheet,Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
export  const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
        marginVertical: 10,
        marginHorizontal: 20,
        overflow: 'hidden',
      },
      image: {
        width: '100%',
        height: 200,
      },
      content: {
        padding: 15,
      },
      title: {
        fontSize: 18,
        fontWeight: 'bold',
      },
      description: {
        fontSize: 16,
        color: '#333',
        marginTop: 5,
      },
      timestamp: {
        fontSize: 14,
        color: '#999',
        marginTop: 10,
      },
      actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
      },
      button: {
        padding: 10,
      },
      buttonText: {
        color: '#007BFF',
        fontSize: 16,
      },
    
});
