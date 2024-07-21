import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, FlatList, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { doc, updateDoc, arrayUnion, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../data/DataFirebase'; // Adjust the import path as necessary
import { useAuth } from '../../context/AuthContext'; // Import your authentication context

const PostCard = ({ post }) => {
  const [heartColor, setHeartColor] = useState('#000');
  const [commentColor, setCommentColor] = useState('#000');
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(post.comments || []); // Added state for comments
  const navigation = useNavigation();
  const { user, userName, userImgUrl } = useAuth(); // Get the authenticated user from context

  useEffect(() => {
    const postRef = doc(db, 'postsDesigner', post.id);
    const unsubscribe = onSnapshot(postRef, (doc) => {
      setComments(doc.data().comments || []);
    });

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, [post.id]);

  const toggleHeartColor = () => {
    setHeartColor((prevColor) => (prevColor === '#000' ? 'red' : '#000'));
  };

  const toggleCommentColor = () => {
    setCommentColor((prevColor) => (prevColor === '#000' ? 'blue' : '#000'));
    setShowComments((prevShow) => !prevShow); // Toggle comment visibility
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
      id: new Date().toISOString(), // Unique ID for each comment
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
      setShowComments(true); // Show comments section after adding a new comment
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
    } else null
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
            <Icon name="heart" size={20} color={heartColor} />
            <Text style={styles.iconText}> 3 likes</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleCommentColor} style={styles.iconButton}>
            <Icon name="comment" size={20} color={commentColor} />
            <Text style={styles.iconText}> {comments.length} comments</Text>
          </TouchableOpacity>
          {user && user.uid === post.userId && (
            <TouchableOpacity onPress={confirmDelete} style={styles.iconButton}>
              <Icon name="trash" size={20} color="red" />
            </TouchableOpacity>
          )}
        </View>

        {showComments && (
          <View style={styles.commentsSection}>
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onLongPress={() => confirmDeleteComment(item.id, item.userId)} // Pass commentId and commentUserId
                  style={styles.commentContainer}
                >
                  <Image
                    source={{ uri: item.userImgUrl || '../../pic/avtar.png' }}
                    style={styles.userImg}
                  />
                  <View style={styles.commentContent}>
                    <Text style={styles.commentUsername}>{item.username}</Text>
                    <Text style={styles.commentTimestamp}>
                      {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString()}
                    </Text>
                    <Text style={styles.commentText}>{item.comment}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Add a comment..."
                value={newComment}
                onChangeText={setNewComment}
              />
              <TouchableOpacity onPress={handleAddComment} style={styles.sendButton}>
                <Icon name="paper-plane" size={20} color="#2196F3" />
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
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  card: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: '#2e64e5',
    marginBottom: 2,
  },
  postTime: {
    fontSize: 12,
    color: '#666',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#333',
  },
  commentsSection: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  commentContent: {
    flex: 1,
    marginLeft: 10,
  },
  commentUsername: {
    fontWeight: 'bold',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    padding: 10,
    fontSize: 14,
    marginRight: 10,
  },
  sendButton: {
    padding: 10,
    borderRadius: 20,
  },
});

export default PostCard;
