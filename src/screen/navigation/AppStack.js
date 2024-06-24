import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from '@react-navigation/native';
import { useAuth } from "../../context/AuthContext";
import ProfileScreen from "../ProfileScreen";
import EditProfile from "../EditProfile";
import Massage from "../Massege";
import Post from "../fetchPosts/Post";
import AddPost from "../fetchPosts/AddPost";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ProfileScreen" 
      component={ProfileScreen} 
      options={{
        title: ' ',
        headerTitleAlign: 'center',
        headerStyle: {
          shadowColor: '#fff',
          elevation: 0,
        },
        headerShadowVisible: false,
        headerBackImage: () => (
          <View style={{ marginLeft: 15 }}>
            <Icon name="chevron-left" size={25} color="#fff" />
          </View>
        ),
      }} 
    />
    <Stack.Screen name="EditProfile" component={EditProfile} />
  </Stack.Navigator>
);

const MessageStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Message" component={Massage} />
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeTabs} options={{ headerShown: false }} />
    <Stack.Screen name="UserProfile" component={ProfileScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const HomeTabs = () => {
  const navigation = useNavigation();
  const { user, userType } = useAuth();

  const navigateToAddPost = () => {
    navigation.navigate('AddPost');
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabNavigatorContainer}>
        <Tab.Navigator>
          <Tab.Screen
            name="Profile"
            component={ProfileStack}
            options={{
              tabBarLabel: "Profile",
              tabBarIcon: ({ color, size }) => (
                <Icon name="user" size={size} color={color} />
              ),
            }}
            initialParams={{ userId: user.uid, username: user.displayName }}
          />
          <Tab.Screen
            name="Post"
            component={Post}
            options={{
              headerRight: userType === "Designer" ? () => (
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={navigateToAddPost}
                >
                  <Image
                    source={require("../../pic/iconsPost/plus (1).png")}
                    style={[styles.headerButtonIcon, { tintColor: "#007bff" }]}
                  />
                </TouchableOpacity>
              ) : null,
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
            component={MessageStack}
            options={{
              tabBarLabel: "Message",
              tabBarIcon: ({ color, size }) => (
                <Icon name="envelope" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="AddPost"
            component={AddPost}
            options={{
              tabBarButton: () => null,
              tabBarVisible: false,
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
  tabIcon: {
    width: 25,
    height: 25,
  },
  headerButton: {
    marginRight: 15,
    paddingVertical: 10,
  },
  headerButtonIcon: {
    width: 24,
    height: 24,
  },
});

export default MainStack;
