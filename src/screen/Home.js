import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAuth } from '../context/AuthContext';
import Post from './Post';
import ProfileScreen from './ProfileScreen';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../data/DataFirebase'; // Adjust the import path as necessary
import Massage from '../screen/Massege';

const Tab = createBottomTabNavigator();

const Home = () => {
  const { user, signOutUser, userName } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
        console.error('Error fetching posts: ', error);
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
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Profile') {
              iconName = 'user';
            } else if (route.name === 'Post') {
              iconName = 'home';
            } else if (route.name === 'Messege') {
              iconName = 'envelope';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarBadgeStyle: { backgroundColor: 'yellow' }
        })}
      >
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{
            headerTitle: 'Profile',
          }}
        />
        <Tab.Screen 
          name="Post" 
          component={Post} 
        />
        <Tab.Screen 
          name="Messege" 
          component={Massage} 
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  ImageUser: {
    height: 160,
    width: 160,
    borderRadius: 80,
  },
  UserName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  userBtn: {
    flexDirection: "row",
    justifyContent: 'space-around',
    width: '70%',
    marginVertical: 20,
  },
  userButton: {
    borderColor: '#2e64e4',
    borderRadius: 15,
    borderWidth: 2,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 8,
  },
  userbuttontext: {
    color: '#000',
  },
  userStats: {
    flexDirection: "row",
    justifyContent: 'space-around',
    width: '100%',
  },
  userInfoWItems: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
  },
  postCardContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  logoutContainer: {
    alignItems: 'center',
    padding: 20,
  },
});

export default Home;
