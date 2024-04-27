import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { app, db } from '../../data/DataFirebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import {ref,uploadBytes,getDownloadURL} from'firebase/storage';
import * as ImagePicker from 'expo-image-picker'

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const auth = getAuth(app);

  useEffect(() => {
    // مراقبة حالة المصادقة
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      // إذا كان هناك مستخدم حالي، حاول قراءة الاسم من Firestore
      if (currentUser) {
        const userDocRef = doc(db, currentUser.type === 'Designer' ? 'userDesigner' : 'userClient', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
        //  console.log(userData.name);
          setUserName(userData.name);
        }
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const signUp = async (email, password, name, type) => {
    try {
      // إنشاء المستخدم باستخدام البريد الإلكتروني وكلمة المرور
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // بناءً على نوع المستخدم، يتم تخزين البيانات في Firestore
      const collectionPath = type === 'Designer' ? 'userDesigner' : 'userClient';
      await setDoc(doc(db, collectionPath, userId), {
        email,
        name,
        type,
        id: userId,
      });
    } catch (error) {
      console.error('Error signing up:', error.message);
    }
  };

  const signIn = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOutUser = async () => {
    await signOut(auth);
  };



  return (
    <AuthContext.Provider value={{ user, userName, signUp, signIn, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
