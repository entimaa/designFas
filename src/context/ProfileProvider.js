import React, { createContext, useState, useContext, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../data/DataFirebase'; // Adjust path as needed

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children, user, userType }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user) {
      const collectionPath = userType === 'Designer' ? 'userDesigner' : 'userClient';
      const userDocRef = doc(db, collectionPath, user.uid);

      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        setProfile(doc.data());
      });

      return () => unsubscribe();
    }
  }, [user, userType]);

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};