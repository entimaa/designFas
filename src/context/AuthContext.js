import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { app, db, storage } from '../../data/DataFirebase'; // Ensure to import storage from DataFirebase
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import storage functions

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [userType, setUserType] = useState('');
  const [userImgUrl, setUserImgUrl] = useState(null); // State to hold user image URL
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          let userDocRef = doc(db, 'userClient', currentUser.uid);
          let userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            userDocRef = doc(db, 'userDesigner', currentUser.uid);
            userDoc = await getDoc(userDocRef);
          }

          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("User data:", userData); // Print user data

            setUserName(userData.name);
            setUserType(userData.type);
            setUserImgUrl(userData.userImgUrl || null); // Set user image URL if available

            console.log("User Image URL:", userData.userImgUrl); // Print the userImgUrl field
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
        }
      } else {
        setUserName('');
        setUserType('');
        setUserImgUrl(null); // Reset user image URL on sign out
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const signUp = async (email, password, name, type, image) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      const collectionPath = type === 'Designer' ? 'userDesigner' : 'userClient';
      const userData = {
        email,
        name,
        type,
        id: userId,
        userImgUrl: null, // Initialize imgUrl with null
      };

      await setDoc(doc(db, collectionPath, userId), userData);

      // Upload image if provided
      if (image) {
        await uploadUserProfileImage(userId, image);
      }

      setUserName(name);
      setUserType(type);
    } catch (error) {
      console.error('Error signing up:', error.message);
    }
  };

  const signIn = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOutUser = async () => {
    await signOut(auth);
    setUserName('');
    setUserType('');
    setUserImgUrl(null); 
  };

  const uploadUserProfileImage = async (userId, image) => {
    try {
      const storageRef = ref(storage, `profileImages/${userId}`);
      await uploadBytes(storageRef, image);

      const downloadURL = await getDownloadURL(storageRef);

      // Update user document with image URL
      const collectionPath = userType === 'Designer' ? 'userDesigner' : 'userClient';
      const userDocRef = doc(db, collectionPath, userId);
      await setDoc(userDocRef, { userImgUrl: downloadURL }, { merge: true });

      setUserImgUrl(downloadURL); // Update state with new image URL

      console.log("Uploaded Image URL:", downloadURL); // Print the new image URL
    } catch (error) {
      console.error('Error uploading profile image:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userName, userType, userImgUrl, setUserImgUrl, signUp, signIn, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
