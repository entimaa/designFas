// src/screen/Admin/AdminHome.js
import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from '@expo/vector-icons';

const AdminHome = ({ navigation }) => {
  const { userName } = useAuth(); // Assuming you are getting userName from useAuth context
  const { signOutUser } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOutUser();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Log Out Error: ', error);
      Alert.alert('Log Out Error', 'Failed to log out. Please try again later.');
    }
  };

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
          onPress={() => navigation.navigate("Report")}
        >
          <Ionicons name="alert-circle-outline" size={24} color="#ffffff" style={styles.icon} />
          <Text style={styles.buttonText}>Reports</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={24} color="#ffffff" style={styles.icon} />
          <Text style={styles.signOutButtonText}>Sign Out</Text>
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
    backgroundColor: "#FAF0E6", // Beige background color
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#8B4513", // Dark honey color
    marginBottom: 32,
  },
  buttonContainer: {
    width: '90%',
    marginVertical: 10,
  },
  button: {
    backgroundColor: "#D2B48C", // Light honey color
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
  signOutButton: {
    backgroundColor: "#A0522D", // Darker honey color for sign out button
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: "center",
    elevation: 3,
  },
  signOutButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
});

export default AdminHome;
