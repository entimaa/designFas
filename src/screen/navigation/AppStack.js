import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
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
import CommentsScreen from "../fetchPosts/CommentScreen"; // Adding CommentsScreen

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const handleLogout = async () => {
  await signOutUser();
};

const ProfileStack = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  return (
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
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                style={{ marginRight: 15 }}
                onPress={() => navigation.navigate('EditProfile')}
              >
                <Icon name="edit" size={25} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ marginRight: 15 }}
                onPress={async () => {
                  await signOutUser();
                  navigation.navigate('Login'); // Assuming 'Login' is your login screen name
                }}
              >
                <Icon name="sign-out" size={25} color="#000" />
              </TouchableOpacity>
            </View>
          ),
        }}
        initialParams={{ userId: user.uid, username: user.displayName }}
      />
      <Stack.Screen name="EditProfile" component={EditProfile} />
    </Stack.Navigator>
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
        component={CommentsScreen} // Adding CommentsScreen
        options={{
          title: 'Comments',
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
