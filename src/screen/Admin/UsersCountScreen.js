import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../data/DataFirebase";
import { useNavigation } from '@react-navigation/native'; //
import Ionicons from 'react-native-vector-icons/Ionicons'; 

const UsersCountScreen = () => {
  const [userClientCount, setUserClientCount] = useState(0);
  const [userDesignerCount, setUserDesignerCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const navigation = useNavigation(); 

  useEffect(() => {
    const fetchUsersCount = async () => {
      try {
        const userClientSnapshot = await getDocs(collection(db, 'userClient'));
        const userDesignerSnapshot = await getDocs(collection(db, 'userDesigner'));

        const clientCount = userClientSnapshot.size;
        const designerCount = userDesignerSnapshot.size;

        setUserClientCount(clientCount);
        setUserDesignerCount(designerCount);
        setTotalCount(clientCount + designerCount);
      } catch (error) {
        console.error("Error fetching users count:", error);
      }
    };

    fetchUsersCount();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* زر العودة كأيقونة سهم */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('AdminHome')}>
        <Ionicons name="arrow-back" size={30} color="#6C4E31" />
      </TouchableOpacity>

      <Text style={styles.title}>All Users</Text>
      <View style={styles.countContainer}>
        <View style={styles.countBox}>
          <Text style={styles.label}>Designers</Text>
          <Text style={styles.count}>{userDesignerCount}</Text>
        </View>
        <View style={styles.countBox}>
          <Text style={styles.label}>Clients</Text>
          <Text style={styles.count}>{userClientCount}</Text>
        </View>
        <View style={styles.countBox}>
          <Text style={styles.label}>Total Users</Text>
          <Text style={styles.count}>{userClientCount + userDesignerCount}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start", 
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FAEDCE", // Light-beige 
  },
  backButton: {
    alignSelf: "flex-start",
    marginLeft: 16,
    marginTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#603F26", //! Dark-brown 
    textAlign: "center", //! Center-title
  },
  countContainer: {
    width: "90%", 
    paddingHorizontal: 20,
  },
  countBox: {
    backgroundColor: "#6C4E31",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#6C4E31",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d3b08c", 
    overflow: "hidden", 
  },
  label: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFDBB5", // DarkB
    marginBottom: 10,
    textTransform: "uppercase", 
  },
  count: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFDBB5", 
  },
});

export default UsersCountScreen;
