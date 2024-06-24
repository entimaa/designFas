import React, { useState, useEffect } from "react";
import { View, Image, Alert, TextInput, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { storage, db } from "../../../data/DataFirebase.js";
import { useAuth } from '../../context/AuthContext.js';
import { doc, setDoc, collection, getDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-elements';

const AddPostComponent = ({ toggleModal }) => {
  const { user, userName, userType ,userImgUrl} = useAuth();
  const [profileImage, setProfileImage] = useState(null);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (user && user.uid) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setProfileImage(userDoc.data().profileImageUrl);
          }
        } catch (error) {
          console.error("Error fetching profile image: ", error);
        }
      }
    };

    fetchProfileImage();
  }, [user]);

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
      setImage(result.assets[0].uri);
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
                userImgUrl:userImgUrl
              });

              // Reset state after successful upload and post creation
              setImage(null);
              setTitle('');
              setContent('');
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
  },
  buttonText: {
    color: '#fff',
    marginTop: 5,
  },
});

export default AddPostComponent;
