import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../data/DataFirebase'; // Adjust the import path as necessary
import PostCard from '../fetchPosts/PostCard'; // Correct the import path
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/FontAwesome'; // استخدام مكتبة FontAwesome للأيقونات

const PostsSection = ({ navigation }) => {
  const { user } = useAuth(); // تعديل الاستخدام من useContext
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // استرجاع المنشورات بناءً على الفئة واسم المستخدم
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

        // استرجاع بيانات المستخدم من مجموعة userDesigner أو userClient
        let userDoc = await getDoc(doc(db, "userDesigner", postData.userId));

        if (!userDoc.exists()) {
          userDoc = await getDoc(doc(db, "userClient", postData.userId));
        }

        if (userDoc.exists()) {
          userImgUrl = userDoc.data().userImgUrl || userDoc.data().profileImageUrl;
        }

        // إضافة البيانات إلى قائمة المنشورات
        postsData.push({ id: docSnap.id, ...postData, userImgUrl });
      }

      setPosts(postsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts: ', error);
      setLoading(false);
    }
  };

  // تحميل المنشورات عند التغيير في user أو category أو username
  useEffect(() => {
    fetchPosts();
  }, [user]);

  // التعامل مع البحث عن طريق الفئة واسم المستخدم
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

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search by category or username"
          placeholderTextColor="#888"
          value={searchTerm}
          onChangeText={handleSearch} // تغيير الدالة المستخدمة للبحث
        />
        <TouchableOpacity style={styles.searchButton} onPress={() => handleSearch(searchTerm)}>
          <Icon name="search" size={20} color="blue" />
        </TouchableOpacity>
      </View>
      <View style={styles.postsContainer}>
        <ScrollView>
          {loading ? (
            <ActivityIndicator size="large" color="#f000ff" />
          ) : (
            // استخدام searchResults إذا كان هناك بحث، وإلا استخدام posts
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // تغيير لون الخلفية
    paddingVertical: 10, // إضافة حشو أعلى وأسفل
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
    color:'#0C797D',
    borderRadius: 25,
    padding: 10,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postsContainer: {
    flex: 1,
    marginTop: 10, // إضافة هامش أعلى
    paddingHorizontal: 16,
  },
});

export default PostsSection;
