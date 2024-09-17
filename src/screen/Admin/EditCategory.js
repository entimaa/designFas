import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, SafeAreaView, Alert,TouchableOpacity } from "react-native";
import { db } from '../../../data/DataFirebase'; // !!تأكد من المسار الصحيح
import { doc, updateDoc } from 'firebase/firestore';

const EditCategory = ({ route, navigation }) => {
  const { category } = route.params;
  const [categoryName, setCategoryName] = useState(category.name);

  const handleUpdateCategory = async () => {
    if (categoryName.trim() === '') {
      Alert.alert('Validation Error', 'Category name is required.');
      return;
    }

    try {
      await updateDoc(doc(db, 'categories', category.id), { name: categoryName });
      Alert.alert('Success', 'Category updated successfully.');
      navigation.goBack(); //!! العودة إلى الشاشة السابقة بعد التحديث
    } catch (error) {
      console.error('Error updating category:', error);
      Alert.alert('Error', 'Failed to update category.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Edit Category</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter category name"
        value={categoryName}
        onChangeText={setCategoryName}
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdateCategory}>
        <Text style={styles.buttonText}>Update Category</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#343a40",
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8, 
    marginBottom: 16,
    backgroundColor: '#fff', 
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007bff', 
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#0056b3', 
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff', 
    fontSize: 16,
    fontWeight: 'bold',
  }, 
});
export default EditCategory;
