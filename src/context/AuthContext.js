import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { app, db, storage } from '../../data/DataFirebase';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [userType, setUserType] = useState('');
  const [userImgUrl, setUserImgUrl] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [posts, setPosts] = useState([]); // حالة لتخزين المنشورات
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
            setUserName(userData.name);
            setUserType(userData.type);
            setUserImgUrl(userData.userImgUrl || null);
            setFollowersCount(userData.followersCount || 0);
            setFollowingCount(userData.followingCount || 0);

            // تحميل المنشورات عند تسجيل الدخول
            await fetchPosts();

          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
        }
      } else {
        setUserName('');
        setUserType('');
        setUserImgUrl(null);
        setFollowersCount(0);
        setFollowingCount(0);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const fetchPosts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'postsDesigner'));
      const postsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          content: data.content,
          imageUrl: data.imageUrl,
          userId: data.userId,
          username: data.username,
          timestamp: data.timestamp,
          likes: data.likes,
          comments: data.comments,
          userImgUrl: data.userImgUrl,
          category: data.category,
        };
      });
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts: ', error);
    }
  };

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
        userImgUrl: null,
        followersCount: 0,
        followingCount: 0,
      };

      await setDoc(doc(db, collectionPath, userId), userData);

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
    setFollowersCount(0);
    setFollowingCount(0);
    setPosts([]); // تفريغ المنشورات عند تسجيل الخروج
  };

  const uploadUserProfileImage = async (userId, image) => {
    try {
      const storageRef = ref(storage, `profileImages/${userId}`);
      await uploadBytes(storageRef, image);

      const downloadURL = await getDownloadURL(storageRef);
      const collectionPath = userType === 'Designer' ? 'userDesigner' : 'userClient';
      const userDocRef = doc(db, collectionPath, userId);
      await setDoc(userDocRef, { userImgUrl: downloadURL }, { merge: true });

      setUserImgUrl(downloadURL);
    } catch (error) {
      console.error('Error uploading profile image:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userName, 
      userType, 
      userImgUrl, 
      followersCount, 
      followingCount, 
      posts, // إضافة المنشورات إلى القيمة المقدمة
      setPosts, // إضافة دالة لتحديث المنشورات إذا لزم الأمر
      setUserImgUrl, 
      signUp, 
      signIn, 
      signOutUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
