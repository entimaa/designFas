import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, KeyboardAvoidingView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../../data/DataFirebase';
import { doc, setDoc, collection, query, where, getDocs, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { BlurView } from 'expo-blur';
import ActionSheet from 'react-native-actionsheet';
import { signOut, deleteUser } from 'firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons'; 

const defaultAvatarUri = '../pic/avtar.png'; 

const EditProfile = () => {
  const { user, userType, userImgUrl, setUserImgUrl, auth } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [image, setImage] = useState(null);
  const actionSheetRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (user) {
      const loadUserData = async () => {
        try {
          const collectionPath = userType === 'Designer' ? 'userDesigner' : 'userClient';
          const userDocRef = doc(db, collectionPath, user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setName(userData.name || '');
            setPhone(userData.phone || '');
            setCountry(userData.country || '');
            setCity(userData.city || '');
            setBio(userData.bio || '');
            setImage(userData.userImgUrl || defaultAvatarUri);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      };

      loadUserData();
    }
  }, [user, userType]);

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

  const deleteImage = async () => {
    if (!userImgUrl) {
      Alert.alert('No Image to Delete', 'There is no image to delete.');
      return;
    }

    try {
      const storageRef = ref(storage, userImgUrl);
      await deleteObject(storageRef);

      const collectionPath = userType === 'Designer' ? 'userDesigner' : 'userClient';
      const userDocRef = doc(db, collectionPath, user.uid);
      await setDoc(userDocRef, { userImgUrl: null }, { merge: true });

      setImage(defaultAvatarUri);
      setUserImgUrl(null);
      Alert.alert('Image Deleted', 'Profile image has been deleted.');
    } catch (error) {
      console.error('Delete Error: ', error);
      Alert.alert('Delete Error', 'Failed to delete the image. Please try again later.');
    }
  };

  const uploadImage = async () => {
    if (!image && !userImgUrl) {
      Alert.alert("No Image Selected", "Please select an image first.");
      return;
    }

    let imageUrl = userImgUrl;
    if (image) {
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
            imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
            setUploading(false);
            Alert.alert("Upload Success", "Image uploaded successfully!");
            handleSaveProfile(imageUrl);  
          }
        );
      } catch (error) {
        console.error("Upload Error: ", error);
        setUploading(false);
        Alert.alert("Upload Error", "Failed to upload image. Please try again later.");
      }
    } else {
      handleSaveProfile(imageUrl);  
    }
  };

  const handleSaveProfile = async (imageUrl) => {
    if (user) {
      try {
        const collectionPath = userType === 'Designer' ? 'userDesigner' : 'userClient';
        const userDocRef = doc(db, collectionPath, user.uid);
  
        const updatedData = {
          name,
          phone,
          country,
          city,
          bio,
        };
  
        if (imageUrl) {
          updatedData.userImgUrl = imageUrl;
          setUserImgUrl(imageUrl);
        }
  
        // Update user data
        await setDoc(userDocRef, updatedData, { merge: true });
  
        // Update user name and image in postsDesigner collection
        const postsQuery = query(collection(db, "postsDesigner"), where("userId", "==", user.uid));
        const postsSnapshot = await getDocs(postsQuery);
        for (const postDoc of postsSnapshot.docs) {
          const postRef = doc(db, "postsDesigner", postDoc.id);
  
          // Update user name and image in the post itself
          await updateDoc(postRef, {
            username: name,
            userimg: imageUrl
          });
  
          // Update user name and image in comments field of the post
          const postData = postDoc.data();
          const updatedComments = postData.comments.map(comment => {
            if (comment.userId === user.uid) {
              return { ...comment, username: name, userImgUrl: imageUrl };
            }
            return comment;
          });
  
          await updateDoc(postRef, { comments: updatedComments });
        }
  
        // Update user name and image in followers collection
        const followersQuery = query(collection(db, "followers"), where("userFollowers.userId", "==", user.uid));
        const followersSnapshot = await getDocs(followersQuery);
        for (const followerDoc of followersSnapshot.docs) {
          const followerRef = doc(db, "followers", followerDoc.id);
          const userFollowers = followerDoc.data().userFollowers || [];
          const updatedFollowers = userFollowers.map(follower => {
            if (follower.userId === user.uid) {
              return { ...follower, userName: name, userImgUrl: imageUrl }; // Changed from 'username' to 'userName'
            }
            return follower;
          });
          await updateDoc(followerRef, { userFollowers: updatedFollowers });
        }
  
        // Update user name and image in following collection
        const followingQuery = query(collection(db, "following"), where("userFollowing.userId", "==", user.uid));
        const followingSnapshot = await getDocs(followingQuery);
        for (const followingDoc of followingSnapshot.docs) {
          const followingRef = doc(db, "following", followingDoc.id);
          const userFollowing = followingDoc.data().userFollowing || [];
          const updatedFollowing = userFollowing.map(following => {
            if (following.userId === user.uid) {
              return { ...following, userName: name, userImgUrl: imageUrl }; // Changed from 'username' to 'userName'
            }
            return following;
          });
          await updateDoc(followingRef, { userFollowing: updatedFollowing });
        }
  
        // Reload user data
        const updatedUserDoc = await getDoc(userDocRef);
        if (updatedUserDoc.exists()) {
          const updatedUserData = updatedUserDoc.data();
          setName(updatedUserData.name || '');
          setPhone(updatedUserData.phone || '');
          setCountry(updatedUserData.country || '');
          setCity(updatedUserData.city || '');
          setBio(updatedUserData.bio || '');
          setImage(updatedUserData.userImgUrl || defaultAvatarUri);
        }
  
        Alert.alert('Profile updated successfully');
      } catch (error) {
        console.error('Error updating profile:', error);
        Alert.alert('Update Error', 'Failed to update profile. Please try again later.');
      }
    }
  };
  
  
  
  
  
  

  const handleActionSheet = (index) => {
    if (index === 0) {
      pickImage();
    } else if (index === 1) {
      takePhoto();
    } else if (index === 2) {
      deleteImage();
    }
  };

  const deleteAccount = async () => {
    if (user) {
      try {
        const collectionPath = userType === 'Designer' ? 'userDesigner' : 'userClient';
        const userDocRef = doc(db, collectionPath, user.uid);
        await deleteDoc(userDocRef);

        if (userImgUrl) {
          const storageRef = ref(storage, userImgUrl);
          await deleteObject(storageRef);
        }

        await deleteUser(auth.currentUser);

        Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
      } catch (error) {
        console.error('Delete Account Error: ', error);
        Alert.alert('Delete Account Error', 'Failed to delete the account. Please try again later.');
      }
    }
  };

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      Alert.alert('Logged Out', 'You have been logged out successfully.');
    } catch (error) {
      console.error('Logout Error: ', error);
      Alert.alert('Logout Error', 'Failed to log out. Please try again later.');
    }
  };
  const showActionSheet = () => {
    actionSheetRef.current.show();
  };
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={showActionSheet}>
          <View style={styles.imageContainer}>
            <View style={styles.borderContainer}>
              <Image source={image ? { uri: image } : { uri: userImgUrl || defaultAvatarUri }} style={styles.userImg} />
              <BlurView intensity={20} style={styles.blurView}>
                <Text style={styles.blurText}>Change Photo</Text>
              </BlurView>
              </View>
          </View>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>

        <View style={styles.inputContainer}>
          <Icon name="person" size={20} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={(text) => setName(text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="phone" size={20} color="#2196F3" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phone}
            onChangeText={(text) => setPhone(text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="location-on" size={20} color="#db3e00" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Country"
            value={country}
            onChangeText={(text) => setCountry(text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="location-city" size={20} color="#525252" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="City"
            value={city}
            onChangeText={(text) => setCity(text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="description" size={20} color="#0016ff" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Bio"
            value={bio}
            onChangeText={(text) => setBio(text)}
          />
        </View>

        <TouchableOpacity onPress={uploadImage} style={styles.saveButton}>
          <Text style={styles.buttonText}>Save Profile</Text>
        </TouchableOpacity>

        <ActionSheet
          ref={actionSheetRef}
          title={'Select an option'}
          options={['Choose from Library', 'Take a Photo', 'Delete Photo', 'Cancel']}
          cancelButtonIndex={3}
          onPress={handleActionSheet}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
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