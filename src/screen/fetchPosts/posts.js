import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { collection, getDocs, query, where, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../data/DataFirebase'; // Adjust the import path as necessary
import PostCard from '../fetchPosts/PostCard'; // Correct the import path
import { useAuth } from '../../context/AuthContext'; // Import your authentication context
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome for icons

const PostsSection = ({ navigation }) => {
  const { user } = useAuth(); // Get the authenticated user from context
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Fetch posts based on category and username
  const fetchPosts = async (categoryFilter, usernameFilter) => {
    if (!user || !user.uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      let postsQuery = collection(db, "postsDesigner");

      if (categoryFilter) {
        postsQuery = query(postsQuery, where("category", "==", categoryFilter));
      }

      const querySnapshot = await getDocs(postsQuery);
      const postsData = [];

      for (const docSnap of querySnapshot.docs) {
        const postData = docSnap.data();
        let userImgUrl = null;

        // Fetch user data from userDesigner or userClient collection
        let userDoc = await getDoc(doc(db, "userDesigner", postData.userId));

        if (!userDoc.exists()) {
          userDoc = await getDoc(doc(db, "userClient", postData.userId));
        }

        if (userDoc.exists()) {
          userImgUrl = userDoc.data().userImgUrl || userDoc.data().profileImageUrl;
        }

        // Exclude current user's posts
        if (postData.userId !== user.uid) {
          // Add data to posts list
          postsData.push({ id: docSnap.id, ...postData, userImgUrl });
        }
      }

      setPosts(postsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts: ', error);
      setLoading(false);
    }
  };

  // Load posts when user or category/username changes
  useEffect(() => {
    fetchPosts();
  }, [user]);

  // Handle search by category or username
  const handleSearch = (text) => {
    setSearchTerm(text);
    if (text === '') {
      setSearchResults([]);
    } else {
      const filteredPosts = posts.filter(item => {
        const categoryMatch = item.category && item.category.toLowerCase().startsWith(text.toLowerCase());
        const usernameMatch = item.username && item.username.toLowerCase().startsWith(text.toLowerCase());
        return categoryMatch || usernameMatch;
      });
      setSearchResults(filteredPosts);
    }
  };

  // Handle post deletion
  const handleDeletePost = async (postId) => {
    try {
      const postRef = doc(db, 'postsDesigner', postId);
      await deleteDoc(postRef);
      Alert.alert('Success', 'Post deleted successfully!');
      // Refetch posts after deletion
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      Alert.alert('Error', 'Failed to delete post.');
    }
  };

  // Confirm post deletion
  const confirmDelete = (postId) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeletePost(postId) }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search by category or username"
          placeholderTextColor="#888"
          value={searchTerm}
          onChangeText={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={() => handleSearch(searchTerm)}>
          <Icon name="search" size={20} color="blue" />
        </TouchableOpacity>
      </View>
      <View style={styles.postsContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#f000ff" />
        ) : (
          <ScrollView>
            {(searchResults.length > 0 ? searchResults : posts).map((item) => (
              // Check if the post does not belong to the current user and render it
              item.userId !== user.uid && (
                <PostCard
                  key={item.id}
                  post={item}
                  onDelete={() => confirmDelete(item.id)}
                  onPress={() => navigation.navigate('ProfileScreen', { userId: item.userId })}
                  showDelete={item.userId === user.uid} // Pass showDelete prop based on current user
                />
              )
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 3,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginHorizontal: 18,
    shadowColor: 'blue',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    elevation: 5,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 20,
    color: '#333',
  },
  searchButton: {
    borderRadius: 25,
    padding: 10,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postsContainer: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 16,
  },
});

export default PostsSection;