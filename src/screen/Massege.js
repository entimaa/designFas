import React, { useState,useEffect } from 'react';
import { View, Text, Image, TouchableOpacity,FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { styles } from '../styles/FeedStyles';
import PostCard from '../screen/fetchPosts/PostCard';
import Posts from '../screen/fetchPosts/posts'

const Massage = () => {
 
 
  return (
    
  
    /*
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.userInfo}>
          <Image
            style={styles.userImg}
            source={require('../pic/des1.png')}
          />
          <View style={styles.userText}>
            <Text style={styles.userName}>jhjh</Text>
            <Text style={styles.postTime}>age 8 minutes</Text>
          </View>
        </View>
        <Text>jjkjnm</Text>
        <Text style={styles.postText}>
          give to a machine (like a computer). Coding is the process of transforming those ideas into a written language that a computer can understand.
        </Text>
        <View style={styles.Line}></View>
        <Image
          style={styles.postaimage}
          source={require('../pic/des6.png')}
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
    
  
  */  
  <Posts/>
    );
 
};

export default Massage;
