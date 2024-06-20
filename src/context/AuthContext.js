import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { app, db } from '../../data/DataFirebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [userType, setUserType] = useState(''); // أضف حالة لتخزين نوع المستخدم
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      console.log("Current User:", currentUser);

      if (currentUser) {
        try {
          // حاول جلب نوع المستخدم من Firestore
          let userDocRef = doc(db, 'userClient', currentUser.uid);
          let userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            userDocRef = doc(db, 'userDesigner', currentUser.uid);
            userDoc = await getDoc(userDocRef);
          }

          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("User Data:", userData);
            setUserName(userData.name);
            setUserType(userData.type); // احفظ نوع المستخدم
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
        }
      } else {
        setUserName('');
        setUserType('');
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const signUp = async (email, password, name, type) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      const collectionPath = type === 'Designer' ? 'userDesigner' : 'userClient';
      await setDoc(doc(db, collectionPath, userId), {
        email,
        name,
        type,
        id: userId,
      });

      // بعد التسجيل، قم بتحديث اسم المستخدم ونوعه
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
    setUserName(''); // تأكد من إعادة تعيين اسم المستخدم عند تسجيل الخروج
    setUserType(''); // إعادة تعيين نوع المستخدم عند تسجيل الخروج
  };

  return (
    <AuthContext.Provider value={{ user, userName, userType, signUp, signIn, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
