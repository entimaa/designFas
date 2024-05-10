import React, { useState } from 'react';
import { View, Image, Button, Alert } from 'react-native';
import { ref, getDownloadURL ,uploadBytesResumable} from 'firebase/storage';
import {addDoc,collection,onSnapshot} from '@firebase/firestore'
import storage, { firebase } from '@react-native-firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { FloatingAction } from "react-native-floating-action";
import { styles } from '../styles/Submits';
import { TouchableOpacity } from 'react-native-gesture-handler';

//file
const Post = () => {
  const [image, setImage] = useState(null);
  const [downloadURL, setDownloadURL] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress ,setProgress] = useState(0);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1
    });
    if (!result.cancelled) {
      setImage(result.assets[0].uri);
    }
  };

const uploadingImage = async(Uri,fileType) => {

  const response = await fetch(uri);
  const blob = await response.blob();
  const stoargeRef = ref(storage,"posts/"+ new Date().getTime());
  const uploadTask =  uploadBytesResumable(stoargeRef, blob);
  // Listen for state changes, errors, and completion of the upload.

uploadTask.on("state_changed",
(snapshot)=>{
  const progress = (snapshot.bytesTransferred  / snapshot.totalBytes)*100
  console.log("progress , ", progress + "% done ")
  setProgress(progress.toFixed())


},
(error) =>{

},
  () =>{
  getDownloadURL(uploadTask.snapshot.ref).then(async(DownloadURL) => {
      setImage("")

  })
}
)


}//stoargeref


  const takeImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1
    });
    if (!result.cancelled) {
      setImage(result.uri);
    }
    //fetch
  };
  
const uploadImage = async () => {
  // Check if an image is selected
  if (!image) {
    Alert.alert('No Image Selected', 'Please select an image first.');
    return;
  }

  try {
    // Create a blob from the image URI
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => {
        resolve(xhr.response);
      };
      xhr.onerror = (e) => {
        console.log(e);
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', image, true); // Use image directly, no need for fileInfo
      xhr.send(null);
    });

    // Extract filename from the image URI
    const filename = image.substring(image.lastIndexOf('/') + 1);
    // Create a reference to the Firebase storage with the filename
    const storageRef = firebase.storage().ref().child(filename);

    // Set uploading state to true
    setUploading(true);
    // Upload the blob to Firebase storage
    await storageRef.put(blob);
    // Get the download URL of the uploaded image
    const url = await storageRef.getDownloadURL();
    // Set the download URL state
    setDownloadURL(url);
    // Set uploading state to false
    setUploading(false);
    // Show success message
    Alert.alert('Upload Success', 'Image uploaded successfully!');
  } catch (error) {
    // Handle errors
    console.error(error);
    // Show error message
    console.log(error.message)
    Alert.alert('Upload Error', 'Failed to upload image. Please try again later.');
    // Reset image state
    setImage(null);
    // Set uploading state to false
    setUploading(false);
  }
};


  const actions = [
    {
      text: 'Pick Image',
      icon: require('../pic/iconsPost/icons-photo-gallery.png'),
      name: 'bt_pick_image',
      position: 1
    },
    {
      text: 'Take Photo',
      icon: require('../pic/iconsPost/icons-camera.png'),
      name: 'bt_take_photo',
      position: 2
    }
  ];

  return (
    <View style={styles.container}>
      {image && <Image source={{ uri: image }} style={styles.image} />}
      {downloadURL && <Image source={{ uri: downloadURL }} style={styles.image} />}
      <FloatingAction
        actions={actions}
        overlayColor="rgba(68, 74, 74, 0.6)"
        position="left"
        onPressItem={(name) => {
          switch (name) {
            case 'bt_pick_image':
              pickImage();
              break;
            case 'bt_take_photo':
              takeImage();
              break;
            default:
              break;
          }
        }}
      />
      <TouchableOpacity 
      

      />
      <Button title="Upload Image" onPress={uploadImage} />
    </View>
  );
};

export default Post;
