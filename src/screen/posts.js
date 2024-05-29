import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../data/DataFirebase'; // Adjust the import path as necessary
import PostCard from './PostCard';

const PostsSection = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "postsDesigner"));
        const postsData = [];
        querySnapshot.forEach((doc) => {
          postsData.push({ id: doc.id, ...doc.data() });
        });
        setPosts(postsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts: ', error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#f000ff" />
      ) : (
        <FlatList
          data={posts}
          renderItem={({ item }) => <PostCard post={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Changed background color
    paddingVertical: 10, // Added padding top and bottom
  },
  sectionTitle: {
    fontSize: 24, // Increased font size
    fontWeight: 'bold',
    marginBottom: 20, // Increased bottom margin
    textAlign: 'center',
    color: '#333333', // Changed text color
  },
  listContent: {
    paddingHorizontal: 16, // Added horizontal padding
    paddingTop: 10, // Added top padding
    paddingBottom: 20,
  },
});

export default PostsSection;
