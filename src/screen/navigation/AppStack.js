import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, StyleSheet, Text, Alert, ActivityIndicator, Image } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useAuth } from "../../context/AuthContext";
import ProfileScreen from "../ProfileScreen";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../data/DataFirebase";
import Massage from "../Massege";
import Post from "../fetchPosts/Post";
import { createStackNavigator } from '@react-navigation/stack';
import EditProfile from "../EditProfile";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Create a stack for Profile
const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen name=" " component={ProfileScreen} options={{ headerShown: false }}  />
    <Stack.Screen name="EditProfile" component={EditProfile}  />
  </Stack.Navigator>
);



// Create a stack for Massage
const MassageStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Massage" component={Massage} />
  </Stack.Navigator>
);

const Home = ({navigation}) => {
  const { user, signOutUser, userName } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "postsDesigner"));
        const postsData = [];
        querySnapshot.forEach((doc) => {
          postsData.push({ id: doc.id, ...doc.data() });
        });
        setPosts(postsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching posts: ", error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleLogout = async () => {
    await signOutUser();
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabNavigatorContainer}>
        <Tab.Navigator>
          <Tab.Screen
            name="Profile"
            component={ProfileStack}
            options={{
               headerShown: false ,
              tabBarLabel: "Profile",
              tabBarIcon: ({ color, size }) => (
                <Icon name="user" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Post"
            component={Post}
            options={{
              tabBarLabel: "Post",
              tabBarIcon: ({ color, size }) => (
                <Image
                  source={require("../../pic/iconsPost/plus (1).png")}
                  style={[styles.tabIcon, { tintColor: color }]}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Message"
            component={MassageStack}
            options={{
              tabBarLabel: "Message",
              tabBarIcon: ({ color, size }) => (
                <Icon name="envelope" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  tabNavigatorContainer: {
    flex: 1,
  },
  iconContainer: {
    alignItems: "center",
    top: 15,
    justifyContent: "center",
  },
  tabIcon: {
    width: 25,
    height: 25,
  },
});

export default Home;
