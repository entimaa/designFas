import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { styles } from '../styles/FeedStyles';

const PostCard = ({ post }) => {
  const [heartColor, setHeartColor] = useState('#000'); // Initial heart icon color
  const [commentColor, setCommentColor] = useState('#000'); // Initial comment icon color

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
          <Image style={styles.userImg} source={require('../pic/des1.png')} />
          <View style={styles.userText}>
            <Text style={styles.userName}>{post.userName}</Text>
            <Text style={styles.postTime}>
              {new Date(post.timestamp).toLocaleString()}
            </Text>
            
          </View>
        </View>
        <View>{post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.postaimage} />
        )}</View>
        <Text style={styles.postText}>{post.content}</Text>
        <View style={styles.Line}></View>
        <Image
  style={styles.postImage}
  source={post.imageUrl ? { uri: post.imageUrl } : require('../pic/des6.png')}
/>
        <View style={styles.Icon}>
          <TouchableOpacity onPress={toggleHeartColor}>
            <Text>
              <Icon name="heart" size={20} color={heartColor} /> 3 likes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleCommentColor}>
            <Text>
              <Icon name="comment" size={20} color={commentColor} /> 5 comments
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default PostCard;
