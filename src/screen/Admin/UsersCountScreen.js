// src/screen/Admin/UsersCountScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../data/DataFirebase";

const UsersCountScreen = () => {
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const fetchUsersCount = async () => {
      try {
        const userClientSnapshot = await getDocs(collection(db, 'userClient'));
        const userDesignerSnapshot = await getDocs(collection(db, 'userDesigner'));
        setUserCount(userClientSnapshot.size + userDesignerSnapshot.size);
      } catch (error) {
        console.error("Error fetching users count:", error);
      }
    };

    fetchUsersCount();
  }, []);

  return (
    <Text>gg</Text>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  count: {
    fontSize: 32,
    fontWeight: "bold",
  },
});

export default UsersCountScreen;
