import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView,Button } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { db } from '../../data/DataFirebase'; // Adjust the import path as necessary
import { collection, getDocs, query, where } from 'firebase/firestore';
import PostCard from './fetchPosts/PostCard';

const ProfileScreen = () => {
  const { user, signOutUser, userName } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleted, setDeleted] = useState(true);
  

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user || !user.uid) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const postsQuery = query(collection(db, "postsDesigner"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(postsQuery);
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
  }, [user]);

  const handleLogout = async () => {
    await signOutUser();
  };

  const handleSendMessage = () => {
    alert('Send Message');
  };

  const handleFollow = () => {
    alert('Follow');
  };

  const handleSendFlowers = () => {
    alert('Send Flowers');
  };

  return (
    <View style={styles.container}>
       <Button title="Logout" onPress={handleLogout} />

      <View style={styles.topContainer}>
        <Image
          source={require('../pic/des1.png')}
          style={styles.userImg}
        />
        <Text style={styles.userName}>{userName}</Text>
        <View style={styles.userBtnWrapper}>
          <TouchableOpacity style={styles.userBtn} onPress={handleSendMessage}>
            <Text style={styles.userBtnTxt}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.userBtn} onPress={handleFollow}>
            <Text style={styles.userBtnTxt}>Follow</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.userBtn}
            onPress={() => {
              // navigation.navigate('EditProfile');
            }}>
            <Text style={styles.userBtnTxt}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.userInfoWrapper}>
          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>12</Text>
            <Text style={styles.userInfoSubTitle}>Posts</Text>
          </View>
          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>10,000</Text>
            <Text style={styles.userInfoSubTitle}>Followers</Text>
          </View>
          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>100</Text>
            <Text style={styles.userInfoSubTitle}>Following</Text>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.bottomContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#f000ff" />
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topContainer: {
    padding: 20,
    alignItems: 'center', // Centers the items horizontally
  },
  userImg: {
    height: 150,
    width: 150,
    borderRadius: 75,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  userBtnWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  userBtn: {
    borderColor: '#2e64e5',
    borderWidth: 2,
    borderRadius: 3,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 5,
  },
  userBtnTxt: {
    color: '#2e64e5',
  },
  userInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  userInfoItem: {
    justifyContent: 'center',
  },
  userInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  userInfoSubTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  bottomContainer: {
    flexGrow: 1,
    padding: 20,
  },
  postsContainer: {
    width: '100%',
  },
});

export default ProfileScreen;
