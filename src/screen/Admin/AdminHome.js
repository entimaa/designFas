// src/screen/Admin/AdminHome.js
import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from '@expo/vector-icons';

const AdminHome = ({ navigation }) => {
  const { user, userName, userType, userImgUrl } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome Admin {userName}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate("AddCategory")}
        >
          <Ionicons name="add-circle-outline" size={24} color="#ffffff" style={styles.icon} />
          <Text style={styles.buttonText}>Add Type Category</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate("UsersCount")}
        >
          <Ionicons name="people-outline" size={24} color="#ffffff" style={styles.icon} />
          <Text style={styles.buttonText}>View Users Count</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate("Products")}
        >
          <Ionicons name="cart-outline" size={24} color="#ffffff" style={styles.icon} />
          <Text style={styles.buttonText}>Add Products</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f0f0f5", // لون خلفية أفتح يناسب عالم الأزياء
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 32,
  },
  buttonContainer: {
    width: '90%',
    marginVertical: 10,
  },
  button: {
    backgroundColor: "#ff6f61", // لون عصري يتناسب مع تصميم الأزياء
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: "center",
    elevation: 3,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
  icon: {
    marginRight: 10,
  },
});

export default AdminHome;
