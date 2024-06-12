import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { styles } from '../../styles/FeedStyles';
import {useAuth} from '../../context/AuthContext';

const PostCard = ({ post,onPress }) => {
  const [heartColor, setHeartColor] = useState('#000'); // Initial heart icon color
  const [commentColor, setCommentColor] = useState('#000'); // Initial comment icon color

  const { user,signOutUser } = useAuth();
  
 //== const []
  const toggleHeartColor = () => {
    setHeartColor((prevColor) => (prevColor === '#000' ? 'red' : '#000')); // Toggle color between black and red
  };

  const toggleCommentColor = () => {
    setCommentColor((prevColor) => (prevColor === '#000' ? 'blue' : '#000')); // Toggle color between black and blue
  };

  return (
    <View style={styles.container}>
    <View style={styles.card}>
      <View style={styles.userInfo}>
        <Image style={styles.userImg} source={require('../../pic/des1.png')} />
        <View style={styles.userText}>
          <TouchableOpacity  >
          <Text style={styles.userName}>{post.username}</Text>
          </TouchableOpacity>
          <Text style={styles.postTime}>{new Date(post.timestamp).toLocaleString()}</Text>
        </View>
      </View>
      <Text style={styles.postTitle}>{post.title}</Text>
      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.postImage} />

      )}
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

export default PostCard;
