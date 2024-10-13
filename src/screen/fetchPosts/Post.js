import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, ScrollView, StyleSheet, TextInput } from 'react-native';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../../data/DataFirebase'; 
import PostCard from '../fetchPosts/PostCard'; 
import { useAuth } from '../../context/AuthContext';

const PostsSection = ({ navigation }) => {
  const { user } = useAuth(); 
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showImageSearch, setShowImageSearch] = useState(false); 

  // Fetch posts  on category - and  - username - color
  const fetchPosts = async (categoryF, usernameF) => {
    if (!user || !user.uid) {
      setLoading(false);
      return;
    }
    setLoading(true);

    let postsQuery = collection(db, "postsDesigner");

    if (categoryF) {
      postsQuery = query(postsQuery, where("category", "==", categoryF));
    }

    if (usernameF) {
      const userQuery = query(collection(db, "userDesigner"), where("username", "==", usernameF));
      const userSnapshot = await getDocs(userQuery);
      const userIds = userSnapshot.docs.map(doc => doc.id);

      if (userIds.length > 0) {
        postsQuery = query(postsQuery, where("userId", "in", userIds));
      } else {
        postsQuery = query(postsQuery, where("userId", "==", "")); // No results if no users found
      }
    }

    const unsubscribe = onSnapshot(postsQuery, (querySnapshot) => {
      const postsData = [];

      querySnapshot.forEach((docSnap) => {
        const postData = docSnap.data();
        let userImgUrl = null;

        if (postData.userId !== user.uid) {
          postsData.push({ id: docSnap.id, ...postData, userImgUrl });
        }
      });

      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  };

  useEffect(() => {
    const unsubscribe = fetchPosts();
    return () => unsubscribe();
  }, [user]);

  const handleSearch = (text) => {
    setSearchTerm(text);
  
    if (text === '') {
      setSearchResults([]);
    } else {
      const words = text.toLowerCase().split(' ');
      
      const filteredPosts = posts.filter(item => {
        const categoryM = words.some(word => item.category && item.category.toLowerCase().includes(word));
        const colorM = words.some(word => item.color && item.color.toLowerCase().includes(word));
        const usernameM = words.some(word => item.username && item.username.toLowerCase().includes(word)); 
  
        return categoryM|| colorM || usernameM;
      });
  
      setSearchResults(filteredPosts);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search by category, color, or username"
          placeholderTextColor="#888"
          value={searchTerm}
          onChangeText={handleSearch}
        />
      </View>
  
      <ScrollView>
        {loading ? (
          <ActivityIndicator size="large" color="#f000ff" />
        ) : (
          (searchResults.length > 0 ? searchResults : posts).map((item) => (
            <PostCard
              key={item.id}
              post={item}
              onPress={() => navigation.navigate('ProfileScreen', { userId: item.userId })}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D0B8A8',
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
  imageSearchButton: {
    borderRadius: 25,
    padding: 10,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
});

export default PostsSection;
