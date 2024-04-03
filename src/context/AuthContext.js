import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { app,db} from '../../data/DataFirebase'; 
import { doc, setDoc } from 'firebase/firestore';
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const signUp = async (email, password, name, type) => {
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
      //data to designer
      if (type === "Designer") {
        await setDoc(doc(db, "userDesigner", userCredential.user.uid), {
          email: email,
          name: name,
          type: type,
          id: userCredential.user.uid
        });
      }
  
      //data to client
      if (type === "Client") {
        await setDoc(doc(db, "userClient", userCredential.user.uid), {
          email: email,
          id: userCredential.user.uid,
          name: name,
          type: type,
        });
      }
    } catch (error) {
      console.error("Error signing up:", error.message);
      // Handle error here, e.g., display an error message to the user
    }
  };
  


  const signIn = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
