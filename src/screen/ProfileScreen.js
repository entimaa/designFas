import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView, Button } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { db } from '../../data/DataFirebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import PostCard from './fetchPosts/PostCard';

const ProfileScreen = ({ navigation, route }) => {
  const { user, signOutUser, userName, userType } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const userId = route.params ? route.params.userId : user.uid;
        const postsQuery = query(collection(db, "postsDesigner"), where("userId", "==", userId));
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
  }, [user, route.params]);

  const handleLogout = async () => {
    await signOutUser();
  };

  const handleSendMessage = () => {
    alert('Send Message');
  };

  const handleFollow = () => {
    alert('Follow');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <Image
          source={require('../pic/AdobeStock_71662495_Preview.jpeg')}
          style={styles.userImg}
        />
        <Text style={styles.userName}>{route.params ? route.params.username : userName}</Text>
        <Text>{route.params ? route.params.userId : user.uid}</Text>
        <View style={styles.userBtnWrapper}>
          {route.params ? (
            <>
              <TouchableOpacity style={styles.userBtn} onPress={handleSendMessage}>
                <Text style={styles.userBtnTxt}>Message</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.userBtn} onPress={handleFollow}>
                <Text style={styles.userBtnTxt}>Follow</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.userBtn} onPress={() => navigation.navigate('EditProfile')}>
                <Text style={styles.userBtnTxt}>Edit</Text>
              </TouchableOpacity>
              <Button title="Logout" onPress={handleLogout} />
            </>
          )}
        </View>
        <View style={styles.userInfoWrapper}>
          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>{posts.length}</Text>
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
        ) : userType === 'Designer' ? (
          posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <Text style={styles.errorMessage}>No posts found.</Text>
          )
        ) : (
          <Text style={styles.errorMessage}>Only designers can view their posts.</Text>
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
    alignItems: 'center',
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
  errorMessage: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ProfileScreen;
