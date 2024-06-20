import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook from React Navigation
import { useAuth } from '../../context/AuthContext';

const PostCard = ({ post }) => {
  const [heartColor, setHeartColor] = useState('#000'); // Initial heart icon color
  const [commentColor, setCommentColor] = useState('#000'); // Initial comment icon color
  const navigation = useNavigation(); // Initialize navigation hook
  const { userType } = useAuth(); // Use userType from context

  const toggleHeartColor = () => {
    setHeartColor((prevColor) => (prevColor === '#000' ? 'red' : '#000')); // Toggle color between black and red
  };

  const toggleCommentColor = () => {
    setCommentColor((prevColor) => (prevColor === '#000' ? 'blue' : '#000')); // Toggle color between black and blue
  };

  const navigateToUserProfile = () => {
    navigation.navigate('UserProfile', { userId: post.userId, username: post.username });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.userInfo}>
          <Image style={styles.userImg} source={require('../../pic/des1.png')} />
          <View style={styles.userText}>
            <TouchableOpacity onPress={navigateToUserProfile}>
              <Text style={styles.userName}>{post.username}</Text>
            </TouchableOpacity>
            <Text style={styles.postTime}>{new Date(post.timestamp).toLocaleString()}</Text>
            <Text style={styles.postTime}>{userType}</Text>
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
            <Text style={styles.iconText}> 5 comments</Text>
          </TouchableOpacity>
        </View>
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
});

export default PostCard;
