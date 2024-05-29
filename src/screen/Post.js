import React, { useState, useEffect } from "react";
import { View, Image, Button, Alert, ActivityIndicator, TextInput, FlatList, Text, StyleSheet } from "react-native";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { FloatingAction } from "react-native-floating-action";
import * as ImagePicker from "expo-image-picker";
import { storage, db } from "../../data/DataFirebase.js";
import { useAuth } from '../context/AuthContext';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { styles } from "../styles/styles.js";
import PostCard from "./PostCard.js";
//
const Post = () => {
  const { user } = useAuth();

  const [image, setImage] = useState(null);
  const [downloadURL, setDownloadURL] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
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

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
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
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const uploadImage = async () => {
    if (!image) {
      Alert.alert("No Image Selected", "Please select an image first.");
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
          setDownloadURL(url);
          setUploading(false);
          Alert.alert("Upload Success", "Image uploaded successfully!");

          if (user && user.uid) {
            console.log('User authenticated');
            try {
              const postRef = doc(collection(db, "postsDesigner"));
              await setDoc(postRef, {
                title: title,
                content: content,
                imageUrl: url,
                userId: user.uid,
                timestamp: new Date().toISOString(),
                likes: 0,
                comments: [],
              });

              // Reset state after successful upload and post creation
              setImage(null);
              setTitle('');
              setContent('');
              setPosts([...posts, {
                id: postRef.id,
                title,
                content,
                imageUrl: url,
                userId: user.uid,
                timestamp: new Date().toISOString(),
                likes: 0,
                comments: [],
              }]);
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

  const actions = [
    {
      text: "Pick Image",
      icon: require("../pic/iconsPost/icons-photo-gallery.png"),
      name: "bt_pick_image",
      position: 1,
    },
    {
      text: "Take Photo",
      icon: require("../pic/iconsPost/icons-camera.png"),
      name: "bt_take_photo",
      position: 2,
    },
  ];

  return (
    <View style={styles.container}>
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
      <FloatingAction
        actions={actions}
        overlayColor="rgba(68, 74, 74, 0.6)"
        position="left"
        onPressItem={(name) => {
          switch (name) {
            case "bt_pick_image":
              pickImage();
              break;
            case "bt_take_photo":
              takeImage();
              break;
            default:
              break;
          }
        }}
      />
      
      {image && <Image source={{ uri: image }} style={styles.image} />}
      {uploading && <ActivityIndicator size="small" color="#00ff00" />}
      <Button title="Upload Image" onPress={uploadImage} />
      {/*
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={posts}
          renderItem={({ item }) => <PostCard post4={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}*/}


    </View>
      
  );
};

//

export default Post;
