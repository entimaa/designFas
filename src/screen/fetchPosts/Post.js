import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, ScrollView, StyleSheet, TextInput, TouchableOpacity, Modal, Text, Button } from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../data/DataFirebase'; // Adjust the import path as necessary
import PostCard from '../fetchPosts/PostCard'; // Correct the import path
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/FontAwesome6'; // استخدام مكتبة FontAwesome للأيقونات
import * as ImagePicker from 'expo-image-picker'; // إضافة مكتبة expo-image-picker

const PostsSection = ({ navigation }) => {
  const { user } = useAuth(); // تعديل الاستخدام من useContext
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showImageSearch, setShowImageSearch] = useState(false); // State to toggle image search modal

  // استرجاع المنشورات بناءً على الفئة واسم المستخدم
  const fetchPosts = async (categoryFilter, usernameFilter) => {
    if (!user || !user.uid) {
      setLoading(false);
      return;
    }
    setLoading(true);

    let postsQuery = collection(db, "postsDesigner");

    if (categoryFilter) {
      postsQuery = query(postsQuery, where("category", "==", categoryFilter));
    }

    const unsubscribe = onSnapshot(postsQuery, (querySnapshot) => {
      const postsData = [];

      querySnapshot.forEach((docSnap) => {
        const postData = docSnap.data();
        let userImgUrl = null;

        // Fetch user data from userDesigner or userClient collection
        // Replace with your actual logic to fetch user data
        // For example:
        // const userDoc = await getDoc(doc(db, "userDesigner", postData.userId));
        // userImgUrl = userDoc.data().userImgUrl || userDoc.data().profileImageUrl;

        // Ignore posts belonging to the current user
        if (postData.userId !== user.uid) {
          postsData.push({ id: docSnap.id, ...postData, userImgUrl });
        }
      });

      setPosts(postsData);
      setLoading(false);
    });

    // Clean up the listener when component unmounts or when user changes
    return () => unsubscribe();
  };

  // تحميل المنشورات عند التغيير في user أو category أو username
  useEffect(() => {
    const unsubscribe = fetchPosts();
    return () => unsubscribe();
  }, [user]);

  // التعامل مع البحث عن طريق الفئة واسم المستخدم
  const handleSearch = (text) => {
    setSearchTerm(text);
  
    if (text === '') {
      setSearchResults([]);
    } else {
      // تقسيم النص المدخل إلى كلمات مفتاحية بناءً على المسافات
      const keywords = text.toLowerCase().split(' ');
  
      const filteredPosts = posts.filter(item => {
        // التحقق من تطابق الفئة أو اللون مع أي من الكلمات المفتاحية
        const categoryMatch = keywords.some(keyword => item.category && item.category.toLowerCase().includes(keyword));
        const colorMatch = keywords.some(keyword => item.color && item.color.toLowerCase().includes(keyword));
  
        // إرجاع المنشورات التي تتطابق مع كلاً من الفئة واللون
        return categoryMatch || colorMatch;
      });
  
      setSearchResults(filteredPosts);
    }
  };
  

  


  // فتح الكاميرا أو المعرض لاختيار الصورة
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      searchByImageUri(result.uri);
    }
  };

  const takeImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      searchByImageUri(result.uri);
    }
  };

  // البحث عن طريق URI الصورة في Firestore
  const searchByImageUri = async (uri) => {
    setLoading(true);
    setShowImageSearch(false); // إغلاق النافذة المنبثقة بعد اختيار الصورة
    try {
      const userDocsDesigner = await getDocs(collection(db, 'userDesigner'));
      const userDocsClient = await getDocs(collection(db, 'userClient'));
      const allUsersDocs = [...userDocsDesigner.docs, ...userDocsClient.docs];
      
      const matchingUsers = allUsersDocs.filter(docSnap => {
        const data = docSnap.data();
        return data.userImgUrl === uri || data.profileImageUrl === uri;
      });

      const userIds = matchingUsers.map(docSnap => docSnap.id);

      if (userIds.length > 0) {
        const postsQuery = query(collection(db, "postsDesigner"), where("userId", "in", userIds));
        const querySnapshot = await getDocs(postsQuery);
        const postsData = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
        setSearchResults(postsData);
      } else {
        setSearchResults([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error searching by image URI: ', error);
      setLoading(false);
    }
  };

  // تبديل حالة النافذة المنبثقة للبحث بواسطة الصورة
  const toggleImageSearchModal = () => {
    setShowImageSearch(!showImageSearch);
  };

  // محتوى النافذة المنبثقة للبحث بواسطة الصورة
  const ImageSearchModal = () => (
    <Modal
      visible={showImageSearch}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowImageSearch(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text>Select an image for search</Text>
          <Button title="Pick Image from Gallery" onPress={pickImage} />
          <Button title="Take a Photo" onPress={takeImage} />
          <Button title="Close" onPress={() => setShowImageSearch(false)} />
        </View>
      </View>
    </Modal>
  );

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
        <TouchableOpacity style={styles.imageSearchButton} onPress={toggleImageSearchModal}>
          <Icon name="images" size={20} color="blue" />
        </TouchableOpacity>
      </View>
      
      {/* النافذة المنبثقة للبحث بواسطة الصورة */}
      {showImageSearch && <ImageSearchModal />}

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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D0B8A8',
   
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
