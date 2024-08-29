import React from 'react';
import { View, Image, StyleSheet, Button, Dimensions } from 'react-native';

const ImageDisplayScreen = ({ route, navigation }) => {
  const { imageUri } = route.params; // Get the image URI from route params

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      <Button title="Back" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.8,
    resizeMode: 'contain',
  },
});

export default ImageDisplayScreen;
