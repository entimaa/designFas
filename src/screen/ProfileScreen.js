import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { db } from '../../data/DataFirebase';
import { collection, getDocs, query, where, doc, getDoc, deleteDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import PostCard from './fetchPosts/PostCard';
import Icon from 'react-native-vector-icons/FontAwesome';
import FollowersModal from './follw/followers';
import FollowingModal from './follw/following';

const ProfileScreen = ({ route }) => {
  const navigation = useNavigation();
  const { user, signOutUser, userName, userType, userImgUrl } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(route.params?.userImgUrl || userImgUrl);
  const [profileUserName, setProfileUserName] = useState(route.params?.username || userName);
  const [profileUserType, setProfileUserType] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [followersModalVisible, setFollowersModalVisible] = useState(false);
  const [followingModalVisible, setFollowingModalVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [slopeColor, setSlopeColor] = useState('#D0B8A8'); // اللون الافتراضي للمنحدر

  const isCurrentUser = !route.params || route.params.userId === user.uid;

  // Function to fetch profile data
  const fetchProfileData = useCallback(async () => {
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
        setPhoneNumber(userData.phone || '');
        setCountry(userData.country || '');
        setCity(userData.city || '');
        setBio(userData.bio || '');

        // Get followers count
        const followersSnap = await getDocs(collection(db, "followers", userId, "userFollowers"));
        setFollowersCount(followersSnap.size);
        setFollowersList(followersSnap.docs.map(doc => doc.data()));

        // Get following count
        const followingSnap = await getDocs(collection(db, "following", userId, "userFollowing"));
        setFollowingCount(followingSnap.size);
        setFollowingList(followingSnap.docs.map(doc => doc.data()));

        // Get posts count
        const postsSnap = await getDocs(query(collection(db, "postsDesigner"), where("userId", "==", userId)));
        setPostsCount(postsSnap.size);

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
      setRefreshing(false); // End refresh animation
    }
  }, [user, route.params]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
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
    setFollowersModalVisible(!followersModalVisible);
  };

  const toggleFollowingModal = () => {
    setFollowingModalVisible(!followingModalVisible);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
  };

  const changeSlopeColor = () => {
    // Change the slope color to a random color or a specific color
    setSlopeColor(slopeColor === '#D0B8A8' ? '#B6C7AA' : '#D0B8A8'); // مثال لتبديل بين لونين
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollViewContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      <View style={styles.profileContainer}>
        <View style={[styles.slope, { backgroundColor: slopeColor }]}>
          <TouchableOpacity style={styles.changeColorButton} onPress={changeSlopeColor}>
            <Icon name="paint-brush" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.profileImageContainer}>
            <Image
              style={styles.profileImage}
              source={profileImageUrl ? { uri: profileImageUrl } : require('../pic/avtar.png')}
            />
            <Text style={styles.userName}>{profileUserName}</Text>
          </View>
        </View>

        {!isCurrentUser && (
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={25} color="#000" />
          </TouchableOpacity>
        )}

        <View style={styles.profileContent}>
        <View style={styles.userInfoContainer}>
            {profileUserType && (
              <View style={styles.userTypeContainer}>
                <Text style={styles.userType}>{profileUserType}</Text>
                {isCurrentUser && (
                  <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
                    <Icon name="edit" size={20} color="#000" />
                  </TouchableOpacity>
                )}
              </View>
            )}
            <View style={styles.locationContainer}>
              {city && <Text style={styles.locationText}>{city}</Text>}
              {country && (
                <>
                  <Text style={styles.locationSeparator}>|</Text>
                  <Text style={styles.locationText}>{country}</Text>
                </>
              )}
            </View>
            {phoneNumber && <Text style={styles.userInfoText}>Phone: {phoneNumber}</Text>}
            {bio && <Text style={styles.bioText}>Bio: {bio}</Text>}
            {!isCurrentUser && (
              <TouchableOpacity style={styles.messageButton} onPress={handleSendMessage}>
                <Icon name="envelope" size={25} color="#fff" />
              </TouchableOpacity>
            )}
            {!isCurrentUser && (
              <TouchableOpacity style={styles.followButton} onPress={handleFollow}>
                <Text style={styles.followButtonText}>{isFollowing ? "Unfollow" : "Follow"}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.userActionsContainer}>
            {isCurrentUser && (
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Icon name="sign-out" size={25} color="#000" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <TouchableOpacity onPress={toggleFollowersModal}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{followersCount}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFollowingModal}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{followingCount}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{postsCount}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
        </View>

        <View style={styles.postsContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#ff0066" />
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </View>

        <FollowersModal 
          modalVisible={followersModalVisible} 
          toggleFollowersModal={toggleFollowersModal} 
          followersList={followersList} 
        />
        <FollowingModal 
          modalVisible={followingModalVisible} 
          toggleFollowingModal={toggleFollowingModal} 
          followingList={followingList} 
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
  },
  profileContainer: {
    paddingHorizontal: 5,
    paddingVertical: 0,
    backgroundColor: '#fff',
  },
  slope: {
    height: 140,
    borderBottomLeftRadius: 160,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  changeColorButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  profileImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#fff',
    marginBottom: 1,
  },
  userName: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  backButton: {
    padding: 10,
  },
  profileContent: {
    marginTop: 6,
  },
  userInfoContainer: {
    paddingHorizontal: 10,
    marginBottom:0,
  },
  userTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userType: {
    fontSize: 18,
    color: '#666',
  },
  editButton: {
    right:260,
    paddingHorizontal: 0,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  locationText: {
    fontSize: 16,
    color: '#444',
  },
  locationSeparator: {
    fontSize: 16,
    color: '#444',
    marginHorizontal: 5,
  },
  userInfoText: {
    fontSize: 16,
    color: '#444',
    marginTop: 5,
  },
  bioText: {
    fontSize: 16,
    color: '#444',
    marginTop: 10,
    marginBottom: 15,
  },
  messageButton: {
    marginTop: 10,
    backgroundColor: '#2e64e5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  followButton: {
    marginTop: 10,
    backgroundColor: '#2e64e5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  followButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  postsContainer: {
    paddingHorizontal: 10,
  },
});

export default ProfileScreen;

         
