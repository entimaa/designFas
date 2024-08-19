import React, { useRef } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { View, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from '@react-navigation/native';
import { useAuth } from "../../context/AuthContext";
import ProfileScreen from "../ProfileScreen";
import EditProfile from "../EditProfile";
import Message from "../Massege";
import Post from "../fetchPosts/Post";
import AddPost from "../fetchPosts/AddPost";
import ChatList from '../chat/ChatList';
import Chat from '../chat/Chat';
import CommentsScreen from "../fetchPosts/CommentScreen";
import PostDetailScreen from "../fetchPosts/PostDetailScreen";
import ActionSheet from 'react-native-actionsheet';
import { auth } from "../../../data/DataFirebase";
import { signOut } from 'firebase/auth'; // تأكد من صحة المسار بناءً على مكان وجوده

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ProfileStack = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const actionSheetRef = useRef();

  const handleOptionActionSheet = async (index) => {
    if (index === 0) {
      // Handle account deletion logic
      Alert.alert("Delete Account", "Are you sure you want to delete your account?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => console.log("Account Deleted") }
      ]);
    } else if (index === 1) {
      // Show loading indicator
      Alert.alert("Logging Out", "Please wait while we log you out.", [{ text: "OK" }]);
      
      try {
        await signOut(auth); // Log out user
        navigation.navigate('LoginScreen'); // Navigate to Login screen
      } catch (error) {
        console.error('Log Out Error: ', error);
        Alert.alert('Log Out Error', 'Failed to log out. Please try again later.');
      }
    }
  };
  

  const showActionSheet = () => {
    actionSheetRef.current?.show();
  };

  return (
    <>
      <Stack.Navigator>
        <Stack.Screen
          name="ProfileScreen"
          component={ProfileScreen}
          options={{
            headerShown: false, // Hide the header completely
          }}
          initialParams={{ userId: user.uid, username: user.displayName }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfile}
          options={{
            title: '', // Hide title
            headerRight: () => (
              <TouchableOpacity onPress={showActionSheet} style={{ marginRight: 15 }}>
                <Icon name="cog" size={24} color="black" />
              </TouchableOpacity>
            ),
          }}
        />
      </Stack.Navigator>
      <ActionSheet
        ref={actionSheetRef}
        title={'Account Options'}
        options={['Delete Account', 'Log Out', 'Cancel']}
        cancelButtonIndex={2}
        destructiveButtonIndex={0}
        onPress={handleOptionActionSheet}
      />
    </>
  );
};

const MessageStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="ChatList" component={ChatList} options={{ title: 'Chat List' }} />
    <Stack.Screen name="Chat" component={Chat} options={({ route }) => ({
      title: route.params.username,
    })} />
  </Stack.Navigator>
);

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

const MainStack = () => {
  const navigation = useNavigation();

  return (
    <Stack.Navigator>
      <Stack.Screen name="MainProfileScreen" component={HomeTabs} options={{ headerShown: false }} />
      <Stack.Screen 
        name="UserProfile" 
        component={ProfileScreen} 
        options={({ route }) => ({
          title: route.params ? route.params.username : 'Profile', // عرض اسم المستخدم أو 'Profile'
          headerLeft: () => (
            <TouchableOpacity onPress={() => {
              const { fromChatList } = route.params || {};
              if (fromChatList) {
                navigation.navigate('ChatList');
              } else {
                navigation.goBack();
              }
            }} style={{ marginLeft: 15 }}>
              <Icon name="chevron-left" size={25} color="#000" />
            </TouchableOpacity>
          ),
        })} 
      />
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
        name="PostDetailsScreen" 
        component={PostDetailScreen} 
        options={{
          title: 'Post Detail',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
              <Icon name="chevron-left" size={25} color="#000" />
            </TouchableOpacity>
          ),
        }} 
      />
    </Stack.Navigator>
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
