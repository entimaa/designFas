import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, RefreshControl, FlatList, Dimensions} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { db } from "../../data/DataFirebase";
import {collection,getDocs,query,where,doc,getDoc,deleteDoc,setDoc,updateDoc,increment,orderBy} from "firebase/firestore";
import Icon from "react-native-vector-icons/FontAwesome";
const { width } = Dimensions.get("window");
const imageSize = (width - 6) / 3; //!!beeetween images

const ProfileScreen = ({ route }) => {
  const navigation = useNavigation();
  const { user, userName, userType, userImgUrl } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState( route.params?.userImgUrl || userImgUrl);
  const [profileUserName, setProfileUserName] = useState(route.params?.username || userName);
  const [profileUserType, setProfileUserType] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [followersModalVisible, setFollowersModalVisible] = useState(false);
  const [followingModalVisible, setFollowingModalVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [profileViews, setProfileViews] = useState(0);
  const [slopeColor, setSlopeColor] = useState("#D0B8A8"); // defffult the color

  const isCurrentUser = !route.params || route.params.userId === user.uid;
  const UserType = userType;
  /* 
!if the user logs in a pje profile  , the return will be to the paje from witch he logged in 
! i use fromChatList for ur..

*/
  const { fromChatList } = route.params || {};
  const handleGoBack = () => {
    if (fromChatList) {
      navigation.navigate("ChatList");
    } else {
      navigation.goBack();
    }
  };

  //////////////////

  const updateProfileViews = async (visitorId, profileOwnerId) => {
    // !profileViews only if the visitor is not the profile owner just to user designer
    if (visitorId !== profileOwnerId) {
      console.log("visited +1 ");
      console.log(visitorId); // ! اليوزر نفسه
      console.log(profileOwnerId); //! *الذي تم زيارته
      try {
        const userRef = doc(db, "userDesigner", profileOwnerId);
        const visitData = {
          visitorId: visitorId,
          timestamp: new Date(), // datee 
        };
        const userDoc = await getDoc(userRef);
        const currentData = userDoc.exists() ? userDoc.data() : {};
        await setDoc(
          userRef,
          {
            profileViews: increment(1),
            visitDates: [...(currentData.visitDates || []), visitData],
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Error updating profile views: ", error);
      }
    }
  };

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
        const fetchedProfileImageUrl = userData.userImgUrl || null;
        setProfileImageUrl(fetchedProfileImageUrl);
        setProfileUserName(userData.name || route.params?.username || userName);
        setProfileUserType(userData.type || userType);
        setPhoneNumber(userData.phone || "");
        setCountry(userData.country || "");
        setCity(userData.city || "");
        setBio(userData.bio || "");
        setProfileViews(userData.profileViews || 0);
  
        const followersSnap = await getDocs(
          collection(db, "followers", userId, "userFollowers")
        );
        setFollowersCount(followersSnap.size);
        setFollowersList(followersSnap.docs.map((doc) => doc.data()));
  
        const followingSnap = await getDocs(
          collection(db, "following", userId, "userFollowing")
        );
        setFollowingCount(followingSnap.size);
        setFollowingList(followingSnap.docs.map((doc) => doc.data()));
  
        // Fetch posts and sort by timestamp descending
        const postsQuery = query(
          collection(db, "postsDesigner"),
          where("userId", "==", userId),
          orderBy("timestamp", "desc") // Ensure posts are ordered by timestamp in descending order
        );
  
        const postsSnap = await getDocs(postsQuery);
        setPostsCount(postsSnap.size);
        const postsData = postsSnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setPosts(postsData);
  
        // Update profile views count
        await updateProfileViews(user.uid, userId);
      } else {
        console.error("User not found");
      }
  
      const followingDoc = await getDoc(
        doc(db, "following", user.uid, "userFollowing", userId)
      );
      setIsFollowing(followingDoc.exists());
    } catch (error) {
      console.error("Error fetching posts: ", error);
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
      navigation.navigate("Chat", {
        userId: route.params.userId,
        username: profileUserName,
        userImgUrl: profileImageUrl,
      });
    }
  };

  const handleFollow = async () => {
    if (!user.uid || !route.params.userId) return;

    const userId = route.params.userId;

    try {
      if (isFollowing) {
        // !reeemove follow
        await deleteDoc(
          doc(db, "following", user.uid, "userFollowing", userId)
        );
        await deleteDoc(
          doc(db, "followers", userId, "userFollowers", user.uid)
        );
        setIsFollowing(false);

        //!uupdate follower count
        const userDesignerDoc = await getDoc(doc(db, "userDesigner", userId));
        const userClientDoc = await getDoc(doc(db, "userClient", userId));

        if (userDesignerDoc.exists()) {
          await updateDoc(doc(db, "userDesigner", userId), {
            followersCount: increment(-1),
          });
        }

        if (userClientDoc.exists()) {
          await updateDoc(doc(db, "userClient", userId), {
            followersCount: increment(-1),
          });
        }
        setFollowersCount((prevCount) => prevCount - 1);
      } else {
        //*Add follow
        await setDoc(doc(db, "following", user.uid, "userFollowing", userId), {
          userId: userId,
          userName: profileUserName,
          userImgUrl: profileImageUrl,
        });

        await setDoc(doc(db, "followers", userId, "userFollowers", user.uid), {
          userId: user.uid,
          userName: userName,
          userImgUrl: userImgUrl,
        });
        setIsFollowing(true);

        // !UpdateFFollower count
        const userDesignerDoc = await getDoc(doc(db, "userDesigner", userId));
        const userClientDoc = await getDoc(doc(db, "userClient", userId));

        if (userDesignerDoc.exists()) {
          await updateDoc(doc(db, "userDesigner", userId), {
            followersCount: increment(1),
          });
        }

        if (userClientDoc.exists()) {
          await updateDoc(doc(db, "userClient", userId), {
            followersCount: increment(1),
          });
        }

        setFollowersCount((prevCount) => prevCount + 1);
      }
    } catch (error) {
      console.error("Error updating follow status: ", error);
    }
  };

  console.log(userType);

  /* 
  const toggleFollowersModal = () => {
    setFollowersModalVisible(!followersModalVisible);
  };

  const toggleFollowingModal = () => {
    setFollowingModalVisible(!followingModalVisible);
  };
*/
  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
  };

  const changeSlopeColor = () => {
    setSlopeColor(slopeColor === "#D0B8A8" ? "#B6C7AA" : "#D0B8A8");
  };

  // إضافة دالة جديدة في ProfileScreen
  const handlePostPress = (postId, username, userId, postImageUrl) => {
    navigation.navigate("PostDetailsScreen", {
      postId,
      username,
      userId,
      postImageUrl,
    });
  };

  // !تحديث renderPost لتضمين onPress
  const renderPost = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        handlePostPress(
          item.id,
          profileUserName,
          route.params.userId,
          item.imageUrl
        )
      }
    >
      <View style={styles.postImageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
      </View>
    </TouchableOpacity>
  );

  //////! chart screen router :

  //

  return (
    <View style={styles.container}>
      <View style={styles.fixedHeader}>
        <View style={styles.profileHeader}>
          <View style={[styles.topFrame, { backgroundColor: slopeColor }]}>
            {isCurrentUser && (
              <TouchableOpacity
                style={styles.changeColorButton}
                onPress={changeSlopeColor}
              >
                <Icon name="paint-brush" size={20} color="#fff" />
              </TouchableOpacity>
            )}

            {isCurrentUser && UserType === "Designer" && (
              <TouchableOpacity
                style={styles.chart}
                onPress={() =>
                  navigation.navigate("ChartScreen", {
                    userId: route.params.userId,
                    username: profileUserName,
                    userImgUrl: profileImageUrl,
                    profileViews: profileViews,
                  })
                }
              >
                <Icon name="bar-chart" size={22} color="#fff" />
              </TouchableOpacity>
            )}
            <View style={styles.profileImageContainer}>
              <Image
                style={styles.profileImage}
                source={
                  profileImageUrl
                    ? { uri: profileImageUrl }
                    : require("../pic/avtar.png")
                }
              />
              <Text style={styles.userName}>{profileUserName}</Text>
            </View>
          </View>

          

          {/*back to paje masse.. */}

          <View style={styles.profileContent}>
            <View style={styles.userInfoContainer}>
              {profileUserType && (
                <View style={styles.userTypeContainer}>
                  <Text style={styles.userType}>{profileUserType}</Text>
                  {isCurrentUser && (
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => navigation.navigate("EditProfile")}
                    >
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
                    {country && <Text style={styles.locationSeparator}>|</Text>}
                  </View>
                )}

                {country && (
                  <View style={styles.locationItem}>
                    <Icon name="globe" size={16} color="#4CAF50" />
                    <Text style={styles.locationText}> {country}</Text>
                  </View>
                )}

              </View>
              {phoneNumber && (
                <View style={styles.infoItem}>
                  <Icon name="phone" size={16} color="#2196F3" />
                  <Text style={styles.infoText}>Phone: {phoneNumber}</Text>
                </View>
              )}
              {bio ? <Text style={styles.bio}>{bio}</Text> : null}
              <View style={styles.userStatsContainer}>
                <TouchableOpacity
                  style={styles.statItem}
                >
                  <Text style={styles.statCount}>{followersCount}</Text>
                  <Text style={styles.statLabel}> Followers</Text>
                </TouchableOpacity>

                <View style={styles.lineContainer}>
                  <View style={styles.line} />
                </View>

                <TouchableOpacity
                  style={styles.statItem}
                >
                  <Text style={styles.statCount}>{followingCount}</Text>
                  <Text style={styles.statLabel}>Following</Text>
                </TouchableOpacity>
                <View style={styles.lineContainer}>
                  <View style={styles.line} />
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statCount}>{postsCount}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
              </View>
            </View>

            {!isCurrentUser && (
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={styles.messageButton}
                  onPress={handleSendMessage}
                >
                  <Image
                    source={require("../pic/chat.png")} 
                    style={styles.messageButtonImage}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.followButton,
                    isFollowing ? styles.following : styles.notFollowing,
                  ]}
                  onPress={handleFollow}
                >
                  <Image
                    source={
                      isFollowing
                        ? require("../pic/followgreen.png") 
                        : require("../pic/follow.png") 
                    }
                    style={styles.followButtonImage}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollViewContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          style={styles.scrollView}
        ></ScrollView>
      </View>

      {/*! justtttttttttttt to post */}

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.postsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
    /******************** */
    /**  <FollowersModal
        visible={followersModalVisible}
        onClose={toggleFollowersModal}
        followersList={followersList}
      />
      <FollowingModal
        visible={followingModalVisible}
        onClose={toggleFollowingModal}
        followingList={followingList}
      /> */
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollViewContainer: {
    paddingBottom: 100,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    borderBottomWidth: 0,
    borderBottomColor: "#ddd",
  },
  topFrame: {//!top cooree ..
    
    width: "100%",
    height: 130,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 160,
    borderBottomRightRadius: 160,
  },
  changeColorButton: {
    position: "absolute",
    top: 1,
    left: 1,
    padding: 10,
  },
  chart: {
    position: "absolute",
    top: 1,
    left: 40,
    padding: 10,
  },
  profileImageContainer: {
    alignItems: "center",
    marginTop: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#fff",
  },
  userName: {
    marginBottom: 13,
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 10,
  },
  profileContent: {
    padding: 10,
    alignItems: "center",
  },
  userInfoContainer: {
    alignItems: "center",
  },
  userTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userType: {
    fontSize: 16,
    color: "#888",
  },
  editButton: {
    marginLeft: 10,
  },
  locationContainer: {
    flexDirection: "row",
    marginVertical: 5,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 5,
  },
  locationText: {
    fontSize: 14,
    color: "#555",
  },
  locationSeparator: {
    marginHorizontal: 5,
    color: "#555",
  },
  userStatsContainer: {
    flexDirection: "row",
    marginTop: 13,
  },
  statItem: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  statCount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  bio: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  infoText: {
    fontSize: 15,
    color: "#444",
    marginLeft: 5,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    marginTop: 20,
  },

  messageButton: {
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  messageButtonImage: {
    width: 25, 
    height: 20,
  },

  messageButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  followButton: {
    padding: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },

  followButtonImage: {
    width: 24, 
    height: 24, 
  },
  //following: {},
  //notFollowing: {},
  postsContainer: {
    marginTop: 0,
  },
  lineContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  line: {
    borderLeftWidth: 2, 
    borderColor: "#888", 
    height: 34, 
    marginHorizontal: 2, // المسافة الجانبية حول الخط
  },
  postImageContainer: {
    margin: 1,
    width: imageSize,
    height: imageSize,
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  backButtonText: {
    fontSize: 16,
    color: "#000",
  },
});

export default ProfileScreen;
