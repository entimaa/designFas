import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../../data/DataFirebase'; // تعديل المسار حسب موقع ملف Firebase
import { useAuth } from '../../context/AuthContext'; // تعديل المسار حسب موقع سياق المصادقة
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../data/DataFirebase'; // تعديل المسار حسب موقع ملف Firebase
import Icon from 'react-native-vector-icons/FontAwesome';

const CommentsScreen = ({ route }) => {
  const { post } = route.params;
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const { user, userImgUrl, userName } = useAuth();

  useEffect(() => {
    const loadUserImage = async () => {
      try {
        if (user && user.uid) {
          const userImgRef = ref(storage, `profileImages/${user.uid}`);
          const url = await getDownloadURL(userImgRef);
          setUserImage(url);
        }
      } catch (error) {
        console.error('Error loading user image:', error);
      }
    };

    loadUserImage();
  }, [user]);

  const handleAddComment = async () => {
    if (comment.trim().length === 0) {
      Alert.alert('Error', 'Comment cannot be empty.');
      return;
    }

    const newComment = {
      userId: user.uid,
      username: userName || user.displayName, // استخدم userName إذا كان متاحًا
      userImgUrl: userImgUrl || 'https://via.placeholder.com/100', // استخدم صورة افتراضية إذا لم تكن الصورة متاحة
      comment,
      timestamp: new Date().toISOString(),
    };

    try {
      const postRef = doc(db, 'postsDesigner', post.id);
      await updateDoc(postRef, {
        comments: arrayUnion(newComment),
      });

      setComments((prevComments) => [...prevComments, newComment]);
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment.');
    }
  };

  const handleDeleteComment = async (commentToDelete) => {
    try {
      const postRef = doc(db, 'postsDesigner', post.id);
      await updateDoc(postRef, {
        comments: arrayRemove(commentToDelete),
      });

      setComments((prevComments) =>
        prevComments.filter((comment) => comment !== commentToDelete)
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
      Alert.alert('Error', 'Failed to delete comment.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        data={comments}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.commentContainer}>
            <TouchableOpacity
              onPress={() => handleDeleteComment(item)}
              style={styles.deleteButton}
            >
              <Icon name="trash" size={20} color="#E57373" />
            </TouchableOpacity>
            <View style={styles.commentContent}>
              <Image
                source={{ uri: item.userImgUrl || 'https://via.placeholder.com/100' }}
                style={styles.userImg}
              />
              <View style={styles.commentTextContainer}>
                <Text style={styles.commentUsername}>{item.username}</Text>
                <Text style={styles.commentTimestamp}>
                  {new Date(item.timestamp).toLocaleDateString()}
                </Text>
                <Text style={styles.commentText}>{item.comment}</Text>
              </View>
            </View>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          placeholderTextColor="#888"
          value={comment}
          onChangeText={setComment}
        />
        <TouchableOpacity onPress={handleAddComment} style={styles.sendButton}>
          <Icon name="paper-plane" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#000', // خلفية الشاشة سوداء
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#333', // خلفية التعليقات داكنة
  },
  deleteButton: {
    marginRight: 10,
  },
  commentContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentTextContainer: {
    flex: 1,
  },
  commentUsername: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#FFF', // لون النص أبيض
  },
  commentText: {
    fontSize: 16,
    color: '#FFF', // لون النص أبيض
    marginVertical: 5,
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#AAA', // لون النص رمادي فاتح
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#444',
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#2E2E2E', // خلفية حقل النص
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#333', // خلفية حقل النص
    color: '#FFF', // لون النص أبيض
    marginRight: 10,
  },
  sendButton: {
    padding: 10,
  },
});

export default CommentsScreen;
