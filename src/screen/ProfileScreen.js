import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, RefreshControl, FlatList, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { db } from '../../data/DataFirebase';
import { collection, getDocs, query, where, doc, getDoc, deleteDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';
import FollowersModal from './follw/followers';
import FollowingModal from './follw/following';

const { width } = Dimensions.get('window');
const imageSize = (width - 6) / 3; // Adjusted for margin between images

const ProfileScreen = ({ route }) => {
  const navigation = useNavigation();
  const { user, userName, userType, userImgUrl } = useAuth();
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
  const [slopeColor, setSlopeColor] = useState('#D0B8A8'); // Default slope color

  const isCurrentUser = !route.params || route.params.userId === user.uid;

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
        setProfileUserName(userData.name || route.params?.username || userName);
        setProfileUserType(userData.type || userType);
        setPhoneNumber(userData.phone || '');
        setCountry(userData.country || '');
        setCity(userData.city || '');
        setBio(userData.bio || '');

        const followersSnap = await getDocs(collection(db, "followers", userId, "userFollowers"));
        setFollowersCount(followersSnap.size);
        setFollowersList(followersSnap.docs.map(doc => doc.data()));

        const followingSnap = await getDocs(collection(db, "following", userId, "userFollowing"));
        setFollowingCount(followingSnap.size);
        setFollowingList(followingSnap.docs.map(doc => doc.data()));

        const postsSnap = await getDocs(query(collection(db, "postsDesigner"), where("userId", "==", userId)));
        setPostsCount(postsSnap.size);

        const postsData = postsSnap.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setPosts(postsData);
      } else {
        console.error("User not found");
      }

      const followingDoc = await getDoc(doc(db, "following", user.uid, "userFollowing", userId));
      setIsFollowing(followingDoc.exists());

    } catch (error) {
      console.error('Error fetching posts: ', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, route.params]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleSendMessage = () => {
    if (route.params) {
      navigation.navigate("Chat", { userId: route.params.userId, username: profileUserName, userImgUrl: profileImageUrl });
    }
  };

  const handleFollow = async () => {
    if (!user.uid || !route.params.userId) return;

    const userId = route.params.userId;

    if (isFollowing) {
      await deleteDoc(doc(db, "following", user.uid, "userFollowing", userId));
      await deleteDoc(doc(db, "followers", userId, "userFollowers", user.uid));
      setIsFollowing(false);
      await updateDoc(doc(db, "userDesigner", userId), {
        followersCount: increment(-1),
      });
      await updateDoc(doc(db, "userClient", userId), {
        followersCount: increment(-1),
      });
    } else {
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
    setSlopeColor(slopeColor === '#D0B8A8' ? '#B6C7AA' : '#D0B8A8');
  };

  const renderPost = ({ item }) => (
    <View style={styles.postImageContainer}>
      <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.fixedHeader}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          style={styles.scrollView}
        >
          <View style={styles.profileHeader}>
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
                  {city && (
                    <View style={styles.locationItem}>
                      <Icon name="map-marker" size={16} color="#E64A19" />
                      <Text style={styles.locationText}> {city}</Text>
                      {country && (
                        <Text style={styles.locationSeparator}>|</Text>
                      )}
                    </View>
                  )}
                  {country && (
                    <View style={styles.locationItem}>
                      <Icon name="globe" size={16} color="#4CAF50" />
                      <Text style={styles.locationText}> {country}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.infoContainer}>
                  {phoneNumber && (
                    <View style={styles.infoItem}>
                      <Icon name="phone" size={16} color="#2196F3" />
                      <Text style={styles.infoText}>Phone: {phoneNumber}</Text>
                    </View>
                  )}
                  {bio && (
                    <View style={styles.infoItem}>
                      <Text style={styles.bioText}>{bio}</Text>
                    </View>
                  )}
                </View>
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
                  <Text style={styles.statLabel}> Following</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{postsCount}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      <View style={styles.scrollableContent}>
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.columnWrapper}
          style={styles.postsContainer}
        />
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fixedHeader: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  profileHeader: {
    backgroundColor: '#fff',
    paddingBottom: 20,
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
    marginBottom: 10,
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
    marginTop: 0,
    alignItems: 'flex-start',
    paddingHorizontal: 18,
  },
  userInfoContainer: {
    alignItems: 'flex-start',
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  userTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userType: {
    fontSize: 18,
    color: '#666',
  },
  editButton: {
    padding: 5,
    marginLeft: 1,
  },
  locationContainer: {
    flexDirection: 'row',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 1,
  },
  locationSeparator: {
    fontSize: 16,
    color: '#444',
    marginHorizontal: 5,
  },
  locationText: {
    fontSize: 16,
    color: '#444',
  },
  infoContainer: {
    marginTop: 1,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    fontSize: 16,
    color: '#444',
    marginLeft: 5,
  },
  bioText: {
    fontSize: 16,
    color: '#444',
    marginTop: 0,
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
    bottom: 0,
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
  scrollableContent: {
    flex: 1,
  },
  postsContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  postImageContainer: {
    flex: 1,
    margin: 1, // Adjust margin for spacing between images
  },
  postImage: {
    width: imageSize,
    height: imageSize,
    borderRadius: 5,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
});

export default ProfileScreen;

