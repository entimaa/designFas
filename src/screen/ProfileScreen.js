import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, ScrollView, Button, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { db } from '../../data/DataFirebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import PostCard from './fetchPosts/PostCard';
import Icon from 'react-native-vector-icons/FontAwesome';

const ProfileScreen = ({ navigation, route }) => {
  const { user, signOutUser, userName, userType, userImgUrl } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState(route.params?.userImgUrl || userImgUrl);
  const [profileUserName, setProfileUserName] = useState(route.params?.username || userName);
  const [profileUserType, setProfileUserType] = useState(null);

  const isCurrentUser = !route.params || route.params.userId === user.uid;

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const userId = route.params ? route.params.userId : user.uid;
        let userDoc = await getDoc(doc(db, "userDesigner", userId));

        if (!userDoc.exists()) {
          userDoc = await getDoc(doc(db, "userClient", userId));
        }

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfileImageUrl(userData.userImgUrl || route.params?.userImgUrl || userImgUrl);
          setProfileUserName(userData.username || route.params?.username || userName);
          setProfileUserType(userData.userType || userType);
        } else {
          console.error("User not found");
        }

        const postsQuery = query(collection(db, "postsDesigner"), where("userId", "==", userId));
        const querySnapshot = await getDocs(postsQuery);
        const postsData = [];
        for (const docSnap of querySnapshot.docs) {
          const postData = docSnap.data();
          let userDoc = await getDoc(doc(db, "userDesigner", postData.userId));
          let userImgUrl = null;
          if (userDoc.exists()) {
            userImgUrl = userDoc.data().userImgUrl;
          } else {
            userDoc = await getDoc(doc(db, "userClient", postData.userId));
            if (userDoc.exists()) {
              userImgUrl = userDoc.data().profileImageUrl;
            }
          }
          postsData.push({ id: docSnap.id, ...postData, userImgUrl });
        }
        setPosts(postsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts: ', error);
        setLoading(false);
      }
    };

    fetchProfileData();
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
      {!isCurrentUser && (
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={25} color="#000" />
        </TouchableOpacity>
      )}
      <View style={styles.topContainer}>
        <Image
          style={styles.userImg}
          source={profileImageUrl ? { uri: profileImageUrl } : require('../pic/avtar.png')}
        />
        <Text style={styles.userName}>{userName}</Text>
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
        ) : (
          posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : profileUserType !== 'Designer' ? (
            <Text style={styles.errorMessage}>ur not a designer , Only the designer can publish a post.. !!</Text>
          ) : (
            <Text style={styles.errorMessage}>No posts found.</Text>
          )
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
  backButton: {
    position: 'absolute',
    top: 55,
    left: 10,
    zIndex: 1,
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
