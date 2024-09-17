import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from "react-native";
import { db } from '../../../data/DataFirebase'; // تأكد من المسار الصحيح
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const CategoryList = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    fetchCategories();

    // !إضافة مستمع لإعادة تحميل الفئات عند العودة إلى الشاشة
    const unsubscribe = navigation.addListener('focus', () => {
      fetchCategories();
    });

    //! تنظيف المستمع عند إلغاء التعلق
    return unsubscribe;
  }, [navigation]);

  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddCategory = async () => {
    if (newCategory.trim() === '') {
      Alert.alert('Validation Error', 'Category name is required.');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'categories'), { name: newCategory });
      await fetchCategories(); //!! إعادة تحميل البيانات بعد إضافة الفئة
      setNewCategory('');
      Alert.alert('Success', 'Category added successfully.');
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Error', 'Failed to add category.');
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
      await fetchCategories(); //!!! إعادة تحميل البيانات بعد حذف الفئة
      Alert.alert('Success', 'Category deleted successfully.');
    } catch (error) {
      console.error('Error deleting category:', error);
      Alert.alert('Error', 'Failed to delete category.');
    }
  };

  const handleEditCategory = (category) => {
    navigation.navigate('EditCategory', { category });
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.name}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleEditCategory(item)}>
          <Ionicons name="create-outline" size={24} color="#3652AD" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteCategory(item.id)}>
          <Ionicons name="trash-outline" size={24} color="#dc143c" style={styles.deleteIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.addContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter category name"
          placeholderTextColor="#b0b0b0"
          value={newCategory}
          onChangeText={setNewCategory}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
          <Ionicons name="add-circle-outline" size={37} color="#0F67B1" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={categories}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5", // لون خلفية أفتح
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#333333",
  },
  addContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    marginRight: 0,
    backgroundColor: "#ffffff",
    elevation: 3,
  },
  addButton: {
    padding: 9,
  },
  item: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 2,
    marginBottom: 8, // إضافة مساحة بين العناصر
  },
  itemText: {
    fontSize: 18,
    color: "#333333",
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteIcon: {
    marginLeft: 16,
  },
  listContainer: {
    paddingBottom: 16, // إضافة مساحة في أسفل القائمة
  },
});

export default CategoryList;
