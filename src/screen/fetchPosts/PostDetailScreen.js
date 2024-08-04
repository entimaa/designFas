import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, FlatList, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../../../data/DataFirebase'; // Adjust the import path as necessary
import { useAuth } from '../../context/AuthContext'; // Import your authentication context
import Icon from 'react-native-vector-icons/FontAwesome';

const PostDetailsScreen = () => {
  const route = useRoute();
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [heartColor, setHeartColor] = useState('#000');
  const [commentColor, setCommentColor] = useState('#000');
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [likesCount, setLikesCount] = useState(0);
  const [likedByUser, setLikedByUser] = useState(false);
  const [reportCount, setReportCount] = useState(0);
  const [reportedByUser, setReportedByUser] = useState(false);
  const navigation = useNavigation();
  const { user, userName, userImgUrl } = useAuth();

  useEffect(() => {
    const postRef = doc(db, 'postsDesigner', postId);
    const unsubscribe = onSnapshot(postRef, (doc) => {
      const postData = doc.data();
      setPost(postData);
      setComments(postData.comments || []);
      setLikesCount(postData.likesCount || 0);
      setReportCount(postData.reportCount || 0);

      if (Array.isArray(postData.likes)) {
        setLikedByUser(postData.likes.includes(user.uid));
      } else {
        setLikedByUser(false);
      }

      if (Array.isArray(postData.reports)) {
        setReportedByUser(postData.reports.includes(user.uid));
      } else {
        setReportedByUser(false);
      }
    });

    return () => unsubscribe();
  }, [postId, user.uid]);

  const toggleHeartColor = async () => {
    const postRef = doc(db, 'postsDesigner', postId);
    try {
      if (likedByUser) {
        await updateDoc(postRef, {
          likes: arrayRemove(user.uid),
          likesCount: likesCount - 1,
        });
        setLikedByUser(false);
        setLikesCount(likesCount - 1);
        setHeartColor('#000');
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(user.uid),
          likesCount: likesCount + 1,
        });
        setLikedByUser(true);
        setLikesCount(likesCount + 1);
        setHeartColor('red');
      }
    } catch (error) {
      console.error('Error updating likes:', error);
      Alert.alert('Error', 'Failed to update likes.');
    }
  };

  const toggleCommentColor = () => {
    setCommentColor((prevColor) => (prevColor === '#000' ? '#000' : '#000'));
    setShowComments((prevShow) => !prevShow);
  };

  const navigateToUserProfile = () => {
    navigation.navigate('UserProfile', { 
      userId: post.userId, 
      username: post.username, 
      userImgUrl: post.userImgUrl 
    });
  };

  const handleDeletePost = async () => {
    try {
      const postRef = doc(db, 'postsDesigner', postId);
      await deleteDoc(postRef);
      Alert.alert('Success', 'Post deleted successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting post:', error);
      Alert.alert('Error', 'Failed to delete post.');
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: handleDeletePost }
      ]
    );
  };

  const handleAddComment = async () => {
    if (newComment.trim().length === 0) {
      Alert.alert('Error', 'Comment cannot be empty.');
      return;
    }

    const commentData = {
      id: new Date().toISOString(),
      userId: user.uid,
      username: userName || 'USER',
      userImgUrl: userImgUrl || '../../pic/avtar.png',
      comment: newComment,
      timestamp: new Date().toISOString(),
    };

    try {
      const postRef = doc(db, 'postsDesigner', postId);
      await updateDoc(postRef, {
        comments: arrayUnion(commentData),
      });

      setNewComment('');
      setShowComments(true);
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const postRef = doc(db, 'postsDesigner', postId);
      const updatedComments = comments.filter(comment => comment.id !== commentId);
      await updateDoc(postRef, {
        comments: updatedComments,
      });
      setComments(updatedComments); // Update local state
      Alert.alert('Success', 'Comment deleted successfully!');
    } catch (error) {
      console.error('Error deleting comment:', error);
      Alert.alert('Error', 'Failed to delete comment.');
    }
  };

  const confirmDeleteComment = (commentId, commentUserId) => {
    if (user.uid === commentUserId) {
      Alert.alert(
        'Delete Comment',
        'Are you sure you want to delete this comment?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => handleDeleteComment(commentId) },
        ]
      );
    } else {
      Alert.alert('Error', 'You can only delete your own comments.');
    }
  };

  const handleReportPost = async () => {
    const postRef = doc(db, 'postsDesigner', postId);
    try {
      if (reportedByUser) {
        Alert.alert('Already Reported', 'You have already reported this post.');
        return;
      }

      await updateDoc(postRef, {
        reports: arrayUnion(user.uid),
        reportCount: reportCount + 1,
      });

      if (reportCount + 1 >= 4) {
        await deleteDoc(postRef);
        Alert.alert('Post Deleted', 'This post has been deleted due to multiple reports.');
        navigation.goBack();
      } else {
        Alert.alert('Reported', 'Thank you for reporting. The post will be reviewed.');
      }
    } catch (error) {
      console.error('Error reporting post:', error);
      Alert.alert('Error', 'Failed to report post.');
    }
  };

  const confirmReport = () => {
    if (user.uid !== post.userId) { // Only show report button if the user is not the post owner
      Alert.alert(
        'Report Post',
        'Are you sure you want to report this post?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Report', style: 'destructive', onPress: handleReportPost }
        ]
      );
    }
  };

  if (!post) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.userInfo}>
          <Image
            style={styles.userImg}
            source={post.userimg ? { uri: post.userimg } : require('../../pic/avtar.png')}
            resizeMode="cover"
            onError={(error) => console.log('Image Load Error:', error)}
          />
          <View style={styles.userText}>
            <TouchableOpacity onPress={navigateToUserProfile}>
              <Text style={styles.userName}>{post.username}</Text>
              <Text style={styles.userName}>{post.category}</Text>
            </TouchableOpacity>
            <Text style={styles.postTime}>{new Date(post.timestamp).toLocaleString()}</Text>
          </View>
        </View>
        
        <Text style={styles.postTitle}>{post.title}</Text>
        {post.imageUrl && <Image source={{ uri: post.imageUrl }} style={styles.postImage} />}
        <Text style={styles.postContent}>{post.content}</Text>
        <View style={styles.separator}></View>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={toggleHeartColor} style={styles.iconButton}>
            <Icon name={likedByUser ? "heart" : "heart-o"} size={20} color={heartColor} />
            <Text style={styles.iconText}>{likesCount} likes</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleCommentColor} style={styles.iconButton}>
            <Icon name={showComments ? 'comment' : 'comment-o'} size={20} color={commentColor} />
            <Text style={styles.iconText}>{comments.length} comments</Text>
          </TouchableOpacity>
          
          {user.uid === post.userId && (
            <TouchableOpacity onPress={confirmDelete} style={styles.iconButton}>
              <Icon name="trash" size={20} color="#000" />
              <Text style={styles.iconText}>Delete</Text>
            </TouchableOpacity>
          )}

          {user.uid !== post.userId && (
            <TouchableOpacity onPress={confirmReport} style={styles.iconButton}>
              <Icon name="flag" size={20} color={reportedByUser ? 'red' : '#000'} />
              <Text style={styles.iconText}>{reportCount} reports</Text>
            </TouchableOpacity>
          )}
        </View>

        {showComments && (
          <View style={styles.commentsSection}>
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.comment}>
                  <Image
                    style={styles.commentUserImg}
                    source={item.userImgUrl ? { uri: item.userImgUrl } : require('../../pic/avtar.png')}
                    resizeMode="cover"
                  />
                  <View style={styles.commentTextContainer}>
                    <Text style={styles.commentUserName}>{item.username}</Text>
                    <Text style={styles.commentText}>{item.comment}</Text>
                    <Text style={styles.commentTimestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
                  </View>
                  {item.userId === user.uid && (
                    <TouchableOpacity onPress={() => confirmDeleteComment(item.id, item.userId)} style={styles.commentDeleteButton}>
                      <Icon name="trash" size={15} color="#000" />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
            <View style={styles.addCommentSection}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                value={newComment}
                onChangeText={setNewComment}
              />
              <TouchableOpacity onPress={handleAddComment} style={styles.commentButton}>
                <Icon name="send" size={20} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userText: {
    marginLeft: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  postTime: {
    fontSize: 12,
    color: '#666',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 10,
  },
  postContent: {
    fontSize: 16,
    marginVertical: 5,
  },
  separator: {
    height: 1,
    backgroundColor: '#e1e1e1',
    marginVertical: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconText: {
    marginLeft: 5,
    fontSize: 16,
  },
  commentsSection: {
    marginTop: 10,
  },
  comment: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  commentUserImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  commentTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentText: {
    fontSize: 14,
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  commentDeleteButton: {
    marginLeft: 10,
  },
  addCommentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  commentButton: {
    marginLeft: 10,
  },
});

export default PostDetailsScreen;
