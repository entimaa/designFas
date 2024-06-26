import React, { useState, useEffect } from "react";
import { View, Image, Alert, TextInput, StyleSheet, ActivityIndicator, Text } from "react-native";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { FloatingAction } from "react-native-floating-action";
import * as ImagePicker from "expo-image-picker";
import { storage, db } from "../../../data/DataFirebase.js";
import { useAuth } from '../../context/AuthContext.js';
import { doc, setDoc, collection, getDoc } from 'firebase/firestore';
import { useNavigation } from "@react-navigation/native";
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import Posts from '../fetchPosts/posts';

const Post = () => {
  const navigation = useNavigation();
  const { user, userName, userType, userImgUrl } = useAuth();
  const [image, setImage] = useState(null);
  const [downloadURL, setDownloadURL] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.cancelled) {
      setImage(result.uri); // Change here for updated API
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
      setImage(result.uri); // Change here for updated API
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
            try {
              const postRef = doc(collection(db, "postsDesigner"));
              await setDoc(postRef, {
                title: title,
                content: content,
                imageUrl: url,
                userId: user.uid,
                username: userName,
                userImgUrl: userImgUrl, // Add user image URL to post data
                timestamp: new Date().toISOString(),
                likes: 0,
                comments: [],
                category:category
              });

              // Reset state after successful upload and post creation
              setImage(null);
              setTitle('');
              setContent('');
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
      icon: <Icon name="photo" size={20} color="#fff" />,
      name: "bt_pick_image",
      position: 2,
    },
    {
      text: "Take Photo",
      icon: <Icon name="camera" size={20} color="#fff" />,
      name: "bt_take_photo",
      position: 1,
    },
  ];

  const cancelImage = () => {
    setImage(null);
  };

  return (
    <View style={styles.container}>
      {userType !== "Designer" ? (
        <Text style={styles.errorMessage}>Only Designers can post content.</Text>
      ) : (
        <>
          {image && <Image source={{ uri: userImgUrl }} style={styles.image} />}
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
            <View style={styles.floatingAction}>
              <FloatingAction
                actions={actions}
                color="#0C797D"
                position="left"
                floatingIcon={
                  <Icon name="plus" size={25} color="#fff" />
                }
                distanceToEdge={{ vertical: 110, horizontal: 20 }}
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
            </View>
          )}
        </>
      )}
      <Posts />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0.1,
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 10,
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
  floatingAction: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default Post;
