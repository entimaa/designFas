import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
/////لا يعمل ؟؟؟///////////////////////
//
const FashionScreen = () => {
  const fashionItems = [
    { id: '1', name: 'T-Shirt', price: '$20' },
    { id: '2', name: 'Jeans', price: '$40' },
    { id: '3', name: 'Jacket', price: '$60' },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>{item.price}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fashion Items</Text>
      <FlatList
        data={fashionItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  name: {
    fontSize: 18,
  },
  price: {
    fontSize: 16,
    color: '#666',
  },
});

export default FashionScreen;
