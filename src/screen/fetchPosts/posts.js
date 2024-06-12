import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../data/DataFirebase'; // Adjust the import path as necessary
import PostCard from '../fetchPosts/PostCard'; // Correct the import path
import { useAuth } from '../../context/AuthContext';
import { Button } from 'react-native-elements';

const PostsSection = ({ navigation }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user || !user.uid) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const postsQuery = query(collection(db, "postsDesigner"));
        const querySnapshot = await getDocs(postsQuery);
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
  }, [user]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#f000ff" />
      ) : (
        <FlatList
          data={posts}
          renderItem={({ item }) => <PostCard post={item} onPress={() => navigation.navigate('ProfileScreen', { userId: item.userId })} />}
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
