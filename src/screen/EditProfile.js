import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { db } from '../../data/DataFirebase'; // Adjust the path as per your project structure
import { collection, getDocs, query, where, doc, updateDoc, setDoc, batch } from 'firebase/firestore';
import { createIconSet } from 'react-native-vector-icons';



const EditProfile = () => {
  const { user } = useAuth(); // Assuming useAuth hook provides user details
  const [name, setName] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'userDesigner', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setName(data.name || '');
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleSaveProfile = async () => {
    if (user) {
      try {
        // Update name in userDesigner collection
        await setDoc(doc(db, 'userDesigner', user.uid), { name }, { merge: true });
        console.log('Name updated in userDesigner collection');
  
        // Update name in postsDesigner collection
        const postsCollection = collection(db, 'postsDesigner');
        const postsQuery = query(postsCollection, where('userId', '==', user.uid));
        const postsQuerySnapshot = await getDocs(postsQuery);
  
        postsQuerySnapshot.forEach(async (doc) => {
          const postRef = doc(db, 'postsDesigner', doc.id); // Ensure doc is called correctly
          console.log('Post Ref:', postRef); // Log each post reference
          await updateDoc(postRef, { authorName: name });
        });
  
        Alert.alert('Profile updated successfully');
      } catch (error) {
        console.error('Error updating profile: ', error);
        Alert.alert('Error', 'Failed to update profile');
      }
    }
  };
  
  
  
  

  return (
    <View style={styles.container}>
      <Image source={require('../pic/des1.png')} style={styles.userImg} />
      <Text style={styles.title}>Edit Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={(text) => setName(text)}
      />

      <TouchableOpacity onPress={handleSaveProfile} style={styles.saveButton}>
        <Text style={styles.buttonText}>Save Profile</Text>
      </TouchableOpacity>
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
  userImg: {
    height: 150,
    width: 150,
    borderRadius: 75,
  },
});

export default EditProfile;
