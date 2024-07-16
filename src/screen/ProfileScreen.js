import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, ScrollView, Button, StyleSheet, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { db } from '../../data/DataFirebase';
import { collection, getDocs, query, where, doc, getDoc, deleteDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import PostCard from './fetchPosts/PostCard';
import Icon from 'react-native-vector-icons/FontAwesome';

const ProfileScreen = ({ route }) => {
  const navigation = useNavigation();
  const { user, signOutUser, userName, userType, userImgUrl } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(route.params?.userImgUrl || userImgUrl);
  const [profileUserName, setProfileUserName] = useState(route.params?.username || userName);
  const [profileUserType, setProfileUserType] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersList, setFollowersList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

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
          
          // Get followers count
          const followersSnap = await getDocs(collection(db, "followers", userId, "userFollowers"));
          setFollowersCount(followersSnap.size);
          setFollowersList(followersSnap.docs.map(doc => doc.data()));

          // Get following count
          const followingSnap = await getDocs(collection(db, "following", userId, "userFollowing"));
          setFollowingCount(followingSnap.size);
          
        } else {
          console.error("User not found");
        }

        // Check if the current user is following this profile user
        const followingDoc = await getDoc(doc(db, "following", user.uid, "userFollowing", userId));
        setIsFollowing(followingDoc.exists());

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
              userImgUrl = userDoc.data().userImgUrl;
            }
          }
          postsData.push({ id: docSnap.id, ...postData, userImgUrl });
        }
        setPosts(postsData);
      } catch (error) {
        console.error('Error fetching posts: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, route.params]);

  const handleLogout = async () => {
    await signOutUser();
  };

  const handleSendMessage = () => {
    if (route.params) {
      navigation.navigate("Chat", { userId: route.params.userId, username: profileUserName, userImgUrl: profileImageUrl });
    }
  };

  const handleFollow = async () => {
    if (!user.uid || !route.params.userId) return;
  
    const userId = route.params.userId;
  
    if (isFollowing) {
      // Unfollow user
      await deleteDoc(doc(db, "following", user.uid, "userFollowing", userId));
      await deleteDoc(doc(db, "followers", userId, "userFollowers", user.uid));
      setIsFollowing(false);
      // Update followers count
      await updateDoc(doc(db, "userDesigner", userId), {
        followersCount: increment(-1),
      });
      await updateDoc(doc(db, "userClient", userId), {
        followersCount: increment(-1),
      });
    } else {
      // Follow user
      await setDoc(doc(db, "following", user.uid, "userFollowing", userId), {
        userId: userId,
        userName: profileUserName,
        userImgUrl: profileImageUrl
      });
      await setDoc(doc(db, "followers", userId, "userFollowers", user.uid), {
        userId: user.uid,
        userName: userName,
        userImgUrl: userImgUrl
      });
      setIsFollowing(true);
      // Update followers count
      await updateDoc(doc(db, "userDesigner", userId), {
        followersCount: increment(1),
      });
      await updateDoc(doc(db, "userClient", userId), {
        followersCount: increment(1),
      });
    }
  };

  const toggleFollowersModal = () => {
    setModalVisible(!modalVisible);
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
        <Text style={styles.userName}>{profileUserName}</Text>
        <View style={styles.userBtnWrapper}>
          {route.params ? (
            <>
              <TouchableOpacity style={styles.userBtn} onPress={handleSendMessage}>
                <Text style={styles.userBtnTxt}>Message</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.userBtn} onPress={handleFollow}>
                <Text style={styles.userBtnTxt}>{isFollowing ? "Unfollow" : "Follow"}</Text>
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
            <TouchableOpacity onPress={toggleFollowersModal}>
              <Text style={styles.userInfoTitle}>{followersCount}</Text>
              <Text style={styles.userInfoSubTitle}>Followers</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>{followingCount}</Text>
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
            <Text style={styles.errorMessage}>You are not a designer, only designers can publish a post!</Text>
          ) : (
            <Text style={styles.errorMessage}>No posts found.</Text>
          )
        )}
      </ScrollView>

      {/* Modal for Followers List */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleFollowersModal}
      >
        <View style={styles.modalContainer}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Followers List</Text>
          {followersList.map((follower, index) => (
            <View key={index} style={styles.followerItem}>
              <Image style={styles.followerImg} source={{ uri: follower.userImgUrl }} />
              <Text style={styles.followerName}>{follower.userName}</Text>
            </View>
          ))}
                   <Button title="Close" onPress={toggleFollowersModal} />
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  followerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  followerImg: {
    height: 50,
    width: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  followerName: {
    fontSize: 16,
    color: '#fff',
  },
});

export default ProfileScreen;
