import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from '@react-navigation/native';
import { useAuth } from "../../context/AuthContext";
import ProfileScreen from "../ProfileScreen";
import EditProfile from "../EditProfile";
import Post from "../fetchPosts/Post";
import AddPost from "../fetchPosts/AddPost";
import ChatList from '../chat/ChatList';
import Chat from '../chat/Chat';
import CommentsScreen from "../fetchPosts/CommentScreen";
import LoginScreen from "../LoginScreen"; // تأكد من استيراد شاشة تسجيل الدخول

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ProfileStack Component
const ProfileStack = () => {
  const { user } = useAuth();
  const navigation = useNavigation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          headerShown: false, // Hides the header for ProfileScreen
        }}
        initialParams={{ userId: user.uid, username: user.displayName }}
      />
    </Stack.Navigator>
  );
};

// MessageStack Component
const MessageStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="ChatList" component={ChatList} options={{ title: 'Chat List' }} />
    <Stack.Screen name="Chat" component={Chat} options={({ route }) => ({
      title: route.params.username,
    })} />
  </Stack.Navigator>
);

// HomeTabs Component
const HomeTabs = () => {
  const navigation = useNavigation();
  const { user, userType } = useAuth();

  const getTabBarStyle = (route) => {
    const routeName = route.state ? route.state.routes[route.state.index].name : '';

    if (routeName === 'Chat') {
      return { display: 'none' };
    }
    return {};
  };

  const navigateToAddPost = () => {
    navigation.navigate('AddPost');
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Profile') {
            iconName = 'user';
          } else if (route.name === 'Post') {
            iconName = 'plus';
          } else if (route.name === 'Message') {
            iconName = 'envelope';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarStyle: getTabBarStyle(route),
      })}
    >
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: "Profile",
        }}
      />
      <Tab.Screen
        name="Post"
        component={Post}
        options={{
          headerRight: () => (
            userType === "Designer" ? (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={navigateToAddPost} >
                <Image
                  source={require("../../pic/iconsPost/plus (1).png")}
                  style={[styles.headerButtonIcon, { tintColor: "#007bff" }]}
                />
              </TouchableOpacity>
            ) : null
          ),
          tabBarLabel: "Post",
        }}
      />
      <Tab.Screen
        name="Message"
        component={MessageStack}
        options={{
          tabBarLabel: "Message",
        }}
      />
      <Tab.Screen
        name="AddPost"
        component={AddPost}
        options={{
          tabBarButton: () => null,
        }}
      />
    </Tab.Navigator>
  );
};

// MainStack Component
const MainStack = () => {
  const navigation = useNavigation();
  const { user } = useAuth(); // تأكد من استخدام السياق للحصول على معلومات المستخدم

  return (
    <Stack.Navigator>
      {!user ? ( // إذا لم يكن هناك مستخدم، عرض شاشة تسجيل الدخول
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeTabs} options={{ headerShown: false }} />
          <Stack.Screen name="UserProfile" component={ProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen 
            name="ChatList" 
            component={ChatList} 
            options={{
              title: 'Chat List',
              headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                  <Icon name="chevron-left" size={25} color="#000" />
                </TouchableOpacity>
              ),
            }} 
          />
          <Stack.Screen 
            name="Chat" 
            component={Chat} 
            options={({ route }) => ({
              headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.navigate('ChatList')} style={{ marginLeft: 15 }}>
                  <Icon name="chevron-left" size={25} color="#000" />
                </TouchableOpacity>
              ),
            })} 
          />
          <Stack.Screen 
            name="Comments" 
            component={CommentsScreen}
            options={{
              title: 'Comments',
              headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                  <Icon name="chevron-left" size={25} color="#000" />
                </TouchableOpacity>
              ),
            }} 
          />
          <Stack.Screen 
            name="EditProfile"
            component={EditProfile}
            options={{ headerShown: false }} // Hides the header for EditProfile
          />
        </>
      )}
    </Stack.Navigator>
  );
};

// Styles
const styles = StyleSheet.create({
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
