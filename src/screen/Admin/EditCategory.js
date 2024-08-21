// src/screen/Admin/EditCategory.js
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, SafeAreaView, Alert } from "react-native";
import { db } from '../../../data/DataFirebase'; // تأكد من المسار الصحيح
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
      navigation.goBack(); // العودة إلى الشاشة السابقة بعد التحديث
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
      <Button title="Update Category" onPress={handleUpdateCategory} />
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
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#343a40",
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    marginBottom: 16,
  },
});

export default EditCategory;
