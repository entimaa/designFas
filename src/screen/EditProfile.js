import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../../data/DataFirebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { BlurView } from 'expo-blur';
import ActionSheet from 'react-native-actionsheet';

const EditProfile = () => {
  const { user, userName, userType, userImgUrl, setUserImgUrl } = useAuth();
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const actionSheetRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (userName) {
      setName(userName);
    }
  }, [userName]);

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

  const takePhoto = async () => {
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

      const storageRef = ref(storage, `userImages/${filename}`);

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
          handleSaveProfile(url);  // Pass the new image URL to the save profile function
        }
      );
    } catch (error) {
      console.error("Upload Error: ", error);
      setUploading(false);
      Alert.alert("Upload Error", "Failed to upload image. Please try again later.");
    }
  };

  const handleSaveProfile = async (imageUrl) => {
    if (user) {
      try {
        const collectionPath = userType === 'Designer' ? 'userDesigner' : 'userClient';
        const userDocRef = doc(db, collectionPath, user.uid);

        const updatedData = { name };
        if (imageUrl) {
          updatedData.userImgUrl = imageUrl;  // Add the image URL to the update
          setUserImgUrl(imageUrl);  // Update the image URL in the auth context
        }

        await setDoc(userDocRef, updatedData, { merge: true });

        Alert.alert('Profile updated successfully');
      } catch (error) {
        console.error('Error updating profile:', error);
        Alert.alert('Update Error', 'Failed to update profile. Please try again later.');
      }
    }
  };

  const showActionSheet = () => {
    actionSheetRef.current.show();
  };

  const handleActionSheet = (index) => {
    if (index === 0) {
      pickImage();
    } else if (index === 1) {
      takePhoto();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={showActionSheet}>
        <View style={styles.imageContainer}>
          <View style={styles.borderContainer}>
            <Image source={image ? { uri: image } : { uri: userImgUrl || 'default_image_uri' }} style={styles.userImg} />
            <BlurView intensity={20} style={styles.blurView}>
              <Text style={styles.blurText}>Change Photo</Text>
            </BlurView>
          </View>
        </View>
      </TouchableOpacity>
      <Text style={styles.title}>Edit Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={(text) => setName(text)}
      />

      <TouchableOpacity onPress={uploadImage} style={styles.saveButton}>
        <Text style={styles.buttonText}>Save Profile</Text>
      </TouchableOpacity>

      <ActionSheet
        ref={actionSheetRef}
        title={'Select an option'}
        options={['Choose from Library', 'Take a Photo', 'Cancel']}
        cancelButtonIndex={2}
        onPress={handleActionSheet}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  saveButton: {
    width: '100%',
    height: 40,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  borderContainer: {
    backgroundColor: '#0066CC',
    borderRadius: 75,
    borderWidth: 0.4,
    borderColor: '#0066CC',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userImg: {
    height: 150,
    width: 150,
    borderRadius: 75, // Ensure the image is circular
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default EditProfile;
