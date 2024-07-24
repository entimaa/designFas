import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, FlatList, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../../../data/DataFirebase'; // Adjust the import path as necessary
import { useAuth } from '../../context/AuthContext'; // Import your authentication context
import Icon from 'react-native-vector-icons/FontAwesome';
//<FontAwesomeIcon icon="fa-regular fa-heart" />
const PostCard = ({ post, onPostDelete }) => {
  const [heartColor, setHeartColor] = useState('#000');
  const [commentColor, setCommentColor] = useState('#000');
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [likedByUser, setLikedByUser] = useState(false);
  const [reportCount, setReportCount] = useState(post.reportCount || 0);
  const [reportedByUser, setReportedByUser] = useState(false);
  const navigation = useNavigation();
  const { user, userName, userImgUrl } = useAuth();

  useEffect(() => {
    const postRef = doc(db, 'postsDesigner', post.id);
    const unsubscribe = onSnapshot(postRef, (doc) => {
      const postData = doc.data();
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
  }, [post.id, user.uid]);

  const toggleHeartColor = async () => {
    const postRef = doc(db, 'postsDesigner', post.id);
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
      const postRef = doc(db, 'postsDesigner', post.id);
      await deleteDoc(postRef);
      onPostDelete(post.id); // Update the parent component about the deletion
      Alert.alert('Success', 'Post deleted successfully!');
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
      const postRef = doc(db, 'postsDesigner', post.id);
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
      const postRef = doc(db, 'postsDesigner', post.id);
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
    const postRef = doc(db, 'postsDesigner', post.id);
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
        onPostDelete(post.id); // Update the parent component about the deletion
        Alert.alert('Post Deleted', 'This post has been deleted due to multiple reports.');
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

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.userInfo}>
          <Image
            style={styles.userImg}
            source={post.userImgUrl ? { uri: post.userImgUrl } : require('../../pic/avtar.png')}
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
          {user.uid !== post.userId && (
            <TouchableOpacity onPress={confirmReport} style={styles.iconButton}>
              <Image
                source={require('../../pic/iconsPost/REPORT.png')} // تأكد من أن المسار صحيح للصورة
                style={styles.reportIcon}
              />
            </TouchableOpacity>
          )}
          {user.uid === post.userId && (
            <TouchableOpacity onLongPress={confirmDelete} style={styles.iconButton}>
              <Icon name="trash" size={20} color="red" />
              <Text style={styles.iconText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {showComments && (
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onLongPress={() => confirmDeleteComment(item.id, item.userId)}>
                <View style={styles.commentContainer}>
                  <Image
                    style={styles.commentUserImg}
                    source={item.userImgUrl ? { uri: item.userImgUrl } : require('../../pic/avtar.png')}
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
        )}
        
        {showComments && (
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Add a comment..."
            />
            <TouchableOpacity onPress={handleAddComment} style={styles.commentButton}>
              <Icon name="paper-plane" size={20} color="#8D493A" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#D0B8A8',

    flex: 1,
    padding: 10,
  },
  card: {
    backgroundColor:'#F8EDE3',

    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: 'bold',
    fontSize: 16,
  },
  postTime: {
    color: '#888',
    fontSize: 12,
  },
  postTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 10,
  },
  postContent: {
    fontSize: 16,
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#D0B8A8',
    marginVertical: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconText: {
    marginLeft: 5,
    fontSize: 14,
  },
  reportIcon: {
    width: 20,
    height: 20,
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomColor: '#DFD3C3',
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
    fontWeight: 'bold',
    fontSize: 14,
  },
  commentText: {
    fontSize: 14,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    borderColor: '#8D493A',
    borderWidth: 1,
    borderRadius: 7,
    padding: 10,
    marginRight: 10,
  },
  commentButton: {
    left:-4
  },
  commentButtonText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 5,
  },
});

export default PostCard;
