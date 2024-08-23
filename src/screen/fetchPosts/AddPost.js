import React, { useState, useEffect } from "react";
import { View, Image, Alert, TextInput, StyleSheet, ActivityIndicator, Text, TouchableOpacity, FlatList } from "react-native";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { storage, db } from "../../../data/DataFirebase.js";
import { useAuth } from '../../context/AuthContext.js';
import { doc, setDoc, collection, getDocs, onSnapshot } from 'firebase/firestore'; // Import onSnapshot
import Icon from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-elements';

const AddPostComponent = ({ toggleModal }) => {
  const { user, userName, userType, userImgUrl } = useAuth();
  const [profileImage, setProfileImage] = useState(null);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Fetch categories using onSnapshot for real-time updates
    const fetchCategories = () => {
      try {
        const categoriesCollection = collection(db, 'categories');
        const unsubscribe = onSnapshot(categoriesCollection, (snapshot) => {
          const categoriesData = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
          setCategories(categoriesData);
        });
    
        // Cleanup function to unsubscribe from the listener when the component unmounts
        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching categories:', error);
        Alert.alert('Fetch Error', 'Failed to fetch categories. Please try again later.');
      }
    };

    fetchCategories();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3,4],
      quality: 1,
    });
    if (!result.cancelled) {
      setImage(result.assets[0].uri);
    }
  };

  const takeImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4,4],
      quality: 1,
    });
    if (!result.cancelled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!image) {
      Alert.alert("No Image Selected", "Please select an image first.");
      return;
    }
    
    if (!category) {
      Alert.alert("Category Missing", "Please select a category.");
      return;
    }

    const uploadUri = image;
    let filename = uploadUri.substring(uploadUri.lastIndexOf("/") + 1);
    const ext = filename.split(".").pop();
    const name = filename.split(".").slice(0, -1).join(".");
    filename = name + Date.now() + "." + ext;

    setUploading(true);

    try {
      const response = await fetch(image);
      const blob = await response.blob();

      const storageRef = ref(storage, `posts/${filename}`);

      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress.toFixed());
        },
        (error) => {
          console.error(error);
          setUploading(false);
          Alert.alert("Upload Error", "Failed to upload image. Please try again later.");
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setUploading(false);
          Alert.alert("Upload Success", "Image uploaded successfully!");

          if (user && user.uid) {
            try {
              const postRef = doc(collection(db, "postsDesigner"));
              await setDoc(postRef, {
                title: title,
                content: content,
                imageUrl: url,
                userId: user.uid,
                username: userName,
                timestamp: new Date().toISOString(),
                likes: 0,
                comments: [],
                userimg: userImgUrl,
                category: category
              });

              // Reset state after successful upload and post creation
              setImage(null);
              setTitle('');
              setContent('');
              setCategory('');
              if (toggleModal) {
                toggleModal(); // Close the modal after upload
              }
            } catch (error) {
              console.error("Error adding document: ", error);
              Alert.alert("Post Error", "Failed to create post. Please try again later.");
            }
          } else {
            Alert.alert("User Error", "User is not authenticated.");
          }
        }
      );
    } catch (error) {
      console.error("Upload Error: ", error);
      setUploading(false);
      Alert.alert("Upload Error", "Failed to upload image. Please try again later.");
    }
  };

  const cancelImage = () => {
    setImage(null);
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const selectCategory = (selectedCategory) => {
    setCategory(selectedCategory);
    setShowOptions(false);
  };

  return (
    <View style={styles.container}>
      {userType !== "Designer" ? (
        <Text style={styles.errorMessage}>Only Designers can post content.</Text>
      ) : (
        <>
          {image && <Image source={{ uri: image }} style={styles.image} />}
          {!image && profileImage && <Image source={{ uri: profileImage }} style={styles.image} />}
          {image && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                style={styles.input}
                placeholder="Content"
                value={content}
                onChangeText={setContent}
              />
              <TouchableOpacity onPress={toggleOptions} style={styles.categoryInput} activeOpacity={0.8}>
                <Text style={styles.categoryText}>Category: {category || "Select Category"}</Text>
                <Icon name="caret-down" size={20} color="gray" />
              </TouchableOpacity>
              {showOptions && (
                <View style={styles.optionsContainer}>
                  <FlatList
                    data={categories}
                    keyExtractor={(item) => item.id} // Changed keyExtractor to use item.id
                    renderItem={({ item }) => (
                      <TouchableOpacity onPress={() => selectCategory(item.name)} style={styles.option}>
                        <Text style={styles.optionText}>{item.name}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}
              {uploading ? (
                <ActivityIndicator size="large" color="#00ff00" style={styles.activityIndicator} />
              ) : (
                <>
                  <Button
                    title="Upload Image"
                    onPress={uploadImage}
                    buttonStyle={styles.uploadButton}
                    titleStyle={styles.uploadButtonText}
                  />
                  <Button
                    title="Cancel"
                    onPress={cancelImage}
                    buttonStyle={styles.cancelButton}
                    titleStyle={styles.cancelButtonText}
                    />
                  </>
                )}
              </>
            )}
            {!image && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
                  <Icon name="photo" size={25} color="#fff" />
                  <Text style={styles.buttonText}>Pick Image</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={takeImage} style={styles.iconButton}>
                  <Icon name="camera" size={25} color="#fff" />
                  <Text style={styles.buttonText}>Take Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#fff',
    },
    input: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      marginBottom: 10,
      paddingHorizontal: 10,
      borderRadius: 5,
    },
    categoryInput: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      marginBottom: 10,
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: 5,
      backgroundColor: '#f8f8f8',
    },
    categoryText: {
      fontSize: 16,
      color: '#333',
    },
    image: {
      width: '100%',
      height: 200,
      marginBottom: 10,
      borderRadius: 10,
    },
    uploadButton: {
      backgroundColor: '#28a745',
      borderRadius: 5,
      marginVertical: 10,
    },
    uploadButtonText: {
      fontSize: 18,
      color: '#fff',
    },
    cancelButton: {
      backgroundColor: '#dc3545',
      borderRadius: 5,
      marginVertical: 10,
    },
    cancelButtonText: {
      fontSize: 18,
      color: '#fff',
    },
    activityIndicator: {
      marginTop: 10,
    },
    errorMessage: {
      color: 'red',
      fontSize: 18,
      textAlign: 'center',
      marginTop: 20,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginVertical: 20,
    },
    iconButton: {
      alignItems: 'center',
      backgroundColor: '#0C797D',
      borderRadius: 5,
      padding: 10,
      flexDirection: 'row',
    },
    buttonText: {
      color: '#fff',
      marginLeft: 5,
    },
    optionsContainer: {
      maxHeight: 120,
      borderColor: '#ccc',
      borderWidth: 1,
      backgroundColor: '#fff',
      zIndex: 1000,
      borderRadius: 5,
    },
    option: {
      paddingVertical: 9,
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
      backgroundColor: '#f9f9f9',
    },
    optionText: {
      fontSize: 12,
      color: '#333',
      fontWeight: 'bold',
    },
  });

export default AddPostComponent;

