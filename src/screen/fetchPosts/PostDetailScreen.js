import React, { useState, useEffect } from "react";
import {View, Text, Image, TouchableOpacity, StyleSheet, Alert, FlatList, TextInput, KeyboardAvoidingView, Platform,} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { doc, updateDoc,arrayUnion,arrayRemove,onSnapshot,deleteDoc,setDoc,} from "firebase/firestore";
import { db } from "../../../data/DataFirebase";
import { useAuth } from "../../context/AuthContext";
import Icon from "react-native-vector-icons/FontAwesome";
import Modal from "react-native-modal";
import ReportModal from "./ReportModal";
const PostDetailsScreen = () => {
  const route = useRoute();
  const { postId, username, userId, postImageUrl } = route.params;
  const [post, setPost] = useState(null);
  const [heartColor, setHeartColor] = useState("#000");
  const [dislikeColor, setDislikeColor] = useState("#000");
  const [color, setColor] = useState("#FFFFFF"); // قيمة اللون الافتراضية
  const [commentColor, setCommentColor] = useState("#000");
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [dislikedByUser, setDislikedByUser] = useState(false);
  const [likedByUser, setLikedByUser] = useState(false);
  const [reportCount, setReportCount] = useState(0);
  const [reportedByUser, setReportedByUser] = useState(false);
  const navigation = useNavigation();
  const { user, userName, userImgUrl } = useAuth();
  //

  console.log(username);
  console.log(userId);
  console.log(postId);
  console.log(user.uid);
  console.log(postImageUrl);
  console.log()
  //console.log(posttimestamp)

  /////report modile ////
  const [modalVisible, setModalVisible] = useState(false);
  const [reportText, setReportText] = useState("");

  useEffect(() => {
    const postRef = doc(db, "postsDesigner", postId);
    const unsubscribe = onSnapshot(postRef, (doc) => {
      const postData = doc.data();
      if (postData) {
        setPost(postData);
        setComments(postData.comments || []);
        setLikesCount(postData.likesCount || 0);
        setDislikesCount(postData.dislikesCount || 0);
        setReportCount(postData.reportCount || 0);
        setLikedByUser(
          Array.isArray(postData.likes)
            ? postData.likes.includes(user.uid)
            : false
        );
        setDislikedByUser(
          Array.isArray(postData.dislikes)
            ? postData.dislikes.includes(user.uid)
            : false
        );
        setReportedByUser(
          Array.isArray(postData.reports)
            ? postData.reports.includes(user.uid)
            : false
        );
        setColor(postData.color || "");
      }
    });

    return () => unsubscribe();
  }, [postId, user.uid]);

  useEffect(() => {
    setHeartColor(likedByUser ? "red" : "#000");
  }, [likedByUser]);
  console.log(dislikesCount);
  const HeartColor = async () => {
    const postRef = doc(db, "postsDesigner", postId);
    try {
      if (likedByUser) {
        // !if user alrady liked too post
        await updateDoc(postRef, {
          likes: arrayRemove(user.uid),
          likesCount: likesCount - 1,
        });
        setLikedByUser(false);
        setLikesCount(likesCount - 1);
        setHeartColor("#000");
      } else {
        //!! ckeack if user not clik Dislikee
        if (dislikedByUser) {
          await updateDoc(postRef, {
            dislikes: arrayRemove(user.uid),
            dislikesCount: dislikesCount - 1,
          });
          setDislikedByUser(false);
          setDislikesCount(dislikesCount - 1);
          setDislikeColor("#000");
        }

        await updateDoc(postRef, {
          likes: arrayUnion(user.uid),
          likesCount: likesCount + 1,
        });
        setLikedByUser(true);
        setLikesCount(likesCount + 1);
        setHeartColor("red");
      }
    } catch (error) {
      console.error("Error updating likes:", error);
      Alert.alert("Error", "Failed to update likes.");
    }
  };

  const DislikeColor = async () => {
    const postRef = doc(db, "postsDesigner", postId);
    try {
      if (dislikedByUser) {
        //! إذا كان المستخدم قد ضغط على عدم الإعجاب بالفعل
        //!!if user alrady click dislike
        await updateDoc(postRef, {
          dislikes: arrayRemove(user.uid),
          dislikesCount: dislikesCount - 1,
        });
        setDislikedByUser(false);
        setDislikesCount(dislikesCount - 1);
        setDislikeColor("#000");
      } else {
        // !!!if user clike liked before
        if (likedByUser) {
          await updateDoc(postRef, {
            likes: arrayRemove(user.uid),
            likesCount: likesCount - 1,
          });
          setLikedByUser(false);
          setLikesCount(likesCount - 1);
          setHeartColor("#000");
        }

        await updateDoc(postRef, {
          dislikes: arrayUnion(user.uid),
          dislikesCount: dislikesCount + 1,
        });
        setDislikedByUser(true);
        setDislikesCount(dislikesCount + 1);
        setDislikeColor("blue");
      }
    } catch (error) {
      console.error("Error updating dislikes:", error);
      Alert.alert("Error", "Failed to update dislikes.");
    }
  };

  const navigateToUserProfile = () => {
    if (post) {
      navigation.navigate("UserProfile", {
        userId: post.userId,
        username: post.username,
        userImgUrl: post.userImgUrl,
      });
    }
  };

  const handleDeletePost = async () => {
    try {
      const postRef = doc(db, "postsDesigner", postId);
      await deleteDoc(postRef);
      Alert.alert("Success", "Post deleted successfully!");
      navigation.navigate("ProfileScreen", { refresh: true });
    } catch (error) {
      console.error("Error deleting post:", error);
      Alert.alert("Error", "Failed to delete post.");
    }
  };

  const confirmDelete = () => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: handleDeletePost },
    ]);
  };

  const handleAddComment = async () => {
    if (newComment.trim().length === 0) {
      Alert.alert("Error", "Comment cannot be empty.");
      return;
    }
    const commentData = {
      id: new Date().toISOString(),
      userId: user.uid,
      username: userName || "USER",
      userImgUrl: userImgUrl || require("../../pic/avtar.png"),
      comment: newComment,
      timestamp: new Date().toISOString(),
    };
    try {
      const postRef = doc(db, "postsDesigner", postId);
      await updateDoc(postRef, {
        comments: arrayUnion(commentData),
      });
      setNewComment("");
      setShowCommentsModal(true);
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (comments && comments.length > 0) {
      try {
        const postRef = doc(db, "postsDesigner", postId);
        const updatedComments = comments.filter(
          (comment) => comment.id !== commentId
        );
        await updateDoc(postRef, {
          comments: updatedComments,
        });
        setComments(updatedComments); // Update local state
        Alert.alert("Success", "Comment deleted successfully!");
      } catch (error) {
        console.error("Error deleting comment:", error);
        Alert.alert("Error", "Failed to delete comment.");
      }
    }
  };

  const confirmDeleteComment = (commentId, commentUserId) => {
    if (user.uid === commentUserId) {
      Alert.alert(
        "Delete Comment",
        "Are you sure you want to delete this comment?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => handleDeleteComment(commentId),
          },
        ]
      );
    } else {
      Alert.alert("Error", "You can only delete your own comments.");
    }
  };

  const handleReportSubmit = async () => {
    if (!reportText.trim()) {
      Alert.alert("Alert", "Please enter the report text.");
      return;
    }
    if (!post.id || !post.userId || !post.username || !user.uid) {
      Alert.alert("Error", "Missing data. Please check all fields.");
      return;
    }
    try {
      const reportRef = doc(db, "reports", post.id);
      const reportData = {
        reportTexts: arrayUnion(reportText.trim()),
        reportedUsers: arrayUnion(user.uid),
        reportDetails: arrayUnion({
          reportText: reportText.trim(),
          reportedBy: user.uid || "unknown",
          reportedByName: userName || "unknown",
          postId: post.id || "unknown",
          reportedTo: post.userId || "unknown",
          reportedToName: post.username || "unknown",
          postTitle: post.title || "not available",
          postImageUrl: post.imageUrl || "unknown",
          timestamp: new Date(),
        }),
      };
      await setDoc(reportRef, reportData, { merge: true });
      Alert.alert("Success", "Your report has been submitted successfully.");
      setReportText("");
      setModalVisible(false); // Close the modal after
    } catch (error) {
      console.error("Error submitting report:", error);
      Alert.alert("Error", "An error occurred while submitting the report.");
    }
  };
  const confirmReport = () => {
    setModalVisible(true);
  };

  if (!post) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.card}>
        <View style={styles.userInfo}>
          <Image
            style={styles.userImg}
            source={
              post.userimg
                ? { uri: post.userimg }
                : require("../../pic/avtar.png")
            }
            resizeMode="cover"
            onError={(error) => console.log("Image Load Error:", error)}
          />
          <View style={styles.userText}>
            <View style={styles.postContainer}>
              {user.uid !== post.userId && (
                <TouchableOpacity
                  onPress={confirmReport}
                  style={styles.reportIcon}
                >
                  <Image
                    source={require("../../pic/iconsPost/REPORT.png")}
                    style={{ width: "100%", height: "100%" }} // !استخدام نسبة العرض والارتفاع لضمان حجم الأيقونة
                  />
                </TouchableOpacity>
              )}

              <ReportModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                reportText={reportText}
                setReportText={setReportText}
                handleReportSubmit={handleReportSubmit}
              />

              {/* باقي محتوى الكارد هنا */}
            </View>
            <TouchableOpacity onPress={navigateToUserProfile}>
              <Text style={styles.userName}>{post.username}</Text>
              <Text style={styles.userNameCategory}>
                {post.category} {post.color}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {post.title ? <Text style={styles.postTitle}>{post.title}</Text> : null}
        {post.content ? (
          <Text style={styles.postContent}>{post.content}</Text>
        ) : null}
        {post.imageUrl && (
          <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
        )}
        <Text style={styles.postTime}>
        {post.timestamp ? new Date(post.timestamp.seconds * 1000).toLocaleString() : 'No date available'}
        </Text>

        <View style={styles.separator}></View>

        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={HeartColor} style={styles.iconButton}>
            <Icon
              name={likedByUser ? "heart" : "heart-o"}
              size={20}
              color={heartColor}
            />
            <Text style={styles.iconText}>{likesCount} </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={DislikeColor} style={styles.iconButton}>
            <Icon
              name={dislikedByUser ? "thumbs-down" : "thumbs-o-down"}
              size={22}
              color={dislikeColor}
            />
            <Text> {dislikesCount} </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowCommentsModal(true)}
            style={styles.iconButton}
          >
            <Icon
              name={showCommentsModal ? "comment" : "comment-o"}
              size={20}
              color={commentColor}
            />
            <Text style={styles.iconText}>{comments.length} comments</Text>
          </TouchableOpacity>
          {user.uid === post.userId && (
            <TouchableOpacity onPress={confirmDelete} style={styles.iconButton}>
              <View style={styles.iconWrapper}>
                <Icon name="trash" size={20} color="red" />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Modal for comments */}
      <Modal
        isVisible={showCommentsModal}
        onBackdropPress={() => setShowCommentsModal(false)}
        onSwipeComplete={() => setShowCommentsModal(false)}
        swipeDirection="down"
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onLongPress={() => confirmDeleteComment(item.id, item.userId)}
              >
                <View style={styles.commentContainer}>
                  <Image
                    style={styles.commentUserImg}
                    source={
                      item.userImgUrl
                        ? { uri: item.userImgUrl }
                        : require("../../pic/avtar.png")
                    }
                    resizeMode="cover"
                  />
                  <View style={styles.commentTextContainer}>
                    <Text style={styles.commentUsername}>{item.username}</Text>
                    <Text style={styles.commentText}>{item.comment}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Add a comment..."
            />
            <TouchableOpacity
              onPress={handleAddComment}
              style={styles.commentButton}
            >
              <Icon name="paper-plane" size={20} color="#8D493A" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowCommentsModal(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#D0B8A8",
    flex: 1,
    padding: 10,
  },
  card: {
    backgroundColor: "#F8EDE3",
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  userImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userText: {
    flex: 1,
  },
  userName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  postTime: {
    color: "#888",
    fontSize: 12,
  },
  postTitle: {
    fontSize: 16,
    marginBottom: 5,
  },
  postImage: {
    width: "100%",
    height: 450,
    borderRadius: 8,
    marginVertical: 10,
    resizeMode: "cover", // Or 'contain' depending on your preference
  },
  postContent: {
    fontSize: 16,
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: "#D0B8A8",
    marginVertical: 10,
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Optionally ensures icons are aligned vertically
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  iconText: {
    marginLeft: 5,
    fontSize: 14,
  },

  reportIcon: {
    bottom: 620,
    left: 3,
    width: 20,
    height: 20,
  },
  commentContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    borderBottomColor: "#DFD3C3",
    borderBottomWidth: 1,
  },

  commentUserImg: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  commentTextContainer: {
    flex: 1,
  },
  commentUsername: {
    fontWeight: "bold",
    fontSize: 14,
  },
  commentText: {
    fontSize: 14,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    borderColor: "#8D493A",
    borderWidth: 1,
    borderRadius: 7,
    padding: 10,
    marginRight: 10,
  },
  commentButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "#F8EDE3",
    backgroundColor: "#F8EDE3",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 20,
    height: "80%",
    justifyContent: "space-between",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // خلفية مظللة
  },
  modalContentreport: {
    backgroundColor: "#F8F8F8",
    borderRadius: 15,
    padding: 20,
    width: "90%", // عرض أقل من الشاشة
    maxWidth: 500,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    alignItems: "center",
  },
  userNameCategory: {
    fontSize: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  inputContainer: {
    width: "100%",
    justifyContent: "space-between", 
    flexDirection: "row", 
  },
  reportIcon: {
    position: "absolute",
    top: 0, 
    right: 0, 
    width: 20,
    height: 20,
    zIndex: 1, 
  },
  inputContainer: {
    width: "100%",
    alignItems: "center", // لجعل الحقل والأزرار في المنتصف
    flexDirection: "column", // ترتيب عمودي للعناصر
  },

 
});

export default PostDetailsScreen;
