import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const  EditProfile = ()=> {
  return (
    <View style={styles.container}>
      <Text>EditProfile</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default EditProfile;