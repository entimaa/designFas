import React, { createContext, useState, useEffect, useContext } from "react";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { app, db, storage } from "../../data/DataFirebase";
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getErrorText } from "../messegeErorr/errorMessage";
import { Alert } from "react-native";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [userType, setUserType] = useState("");
  const [userImgUrl, setUserImgUrl] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [posts, setPosts] = useState([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {//! if user findd..
        try {
          let userDocRef = doc(db, "userClient", currentUser.uid);
          let userDoc = await getDoc(userDocRef);
          if (!userDoc.exists()) {
            userDocRef = doc(db, "userDesigner", currentUser.uid);
            userDoc = await getDoc(userDocRef);
          }
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.name);
            setUserType(userData.type);
            setUserImgUrl(userData.userImgUrl || null);
            setFollowersCount(userData.followersCount || 0);
            setFollowingCount(userData.followingCount || 0);
            setIsBlocked(userData.isBlocked);
            console.log("isBlocked from Firestore:", userData.isBlocked);
            await fetchPosts();
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
        }
      } else {
        setUserName("");
        setUserType("");
        setUserImgUrl(null);
        setFollowersCount(0);
        setFollowingCount(0);
        setPosts([]);
        setIsBlocked(false);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const fetchPosts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "postsDesigner"));
      const postsData = querySnapshot.docs.map((doc) => {
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
      console.error("Error fetching posts: ", error);
    }
  };

  const signUp = async (email, password, name, type, image) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      const collectionPath = type === "Designer" ? "userDesigner" : "userClient";
      const userData = {
        email,
        name,
        type,
        id: userId,
        userImgUrl: null,
        followersCount: 0,
        followingCount: 0,
        isBlocked: false,
      };
      if (type === "Designer") {
        userData.profileViews = 0;
      }
      await setDoc(doc(db, collectionPath, userId), userData);
      if (image) {
        await uploadUserProfileImage(userId, image);
      }
      setUserName(name);
      setUserType(type);
    } catch (error) {
      const errorMessage = getErrorText(error.code);
    //  console.log(errorMessage);
      Alert.alert("Error", errorMessage);
    }
  };
  const signIn = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const currentUser = auth.currentUser;
      if (currentUser) {
        let userDocRef = doc(db, "userClient", currentUser.uid);
        let userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          userDocRef = doc(db, "userDesigner", currentUser.uid);
          userDoc = await getDoc(userDocRef);
        }
  
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsBlocked(userData.isBlocked);
          if (userData.isBlocked) {
            await signOut(auth);
            return { isBlocked: true };
          }
          setUserName(userData.name);
          setUserType(userData.type);
          setUserImgUrl(userData.userImgUrl || null);
          setFollowersCount(userData.followersCount || 0);
          setFollowingCount(userData.followingCount || 0);
          await fetchPosts();
          return { isBlocked: false };
        } else {
          // User document does not exist
          Alert.alert("Error", "User not found.");
          await signOut(auth);
          return { isBlocked: false };
        }
      }
    } catch (error) {
    //  console.error("Error signing in:", error);
      Alert.alert("Error", "An error occurred during sign-in.");
     throw error;
    }
  };
  

  const signOutUser = async () => {
    await signOut(auth);
    setUserName("");
    setUserType("");
    setUserImgUrl(null);
    setFollowersCount(0);
    setFollowingCount(0);
    setPosts([]);
    setIsBlocked(false);
  };

  const uploadUserProfileImage = async (userId, image) => {
    try {
      const storageRef = ref(storage, `profileImages/${userId}`);
      await uploadBytes(storageRef, image);//!!تحميل الصوره في داتا الصور 
      const downloadURL = await getDownloadURL(storageRef);
      const collectionPath = userType === "Designer" ? "userDesigner" : "userClient";
      const userDocRef = doc(db, collectionPath, userId)//* يتسيرت هفنياه لمصمخ فايرر بيس
      await setDoc(userDocRef, { userImgUrl: downloadURL }, { merge: true });//*يتسبرت نتونيم حدشيم ام هو كيم از يعتخن ام لو از يتسيرت نتنونيم حدشيم
      setUserImgUrl(downloadURL);
    } catch (error) {
      console.error("Error uploading profile image:", error);
    }
  };

  const deleteUserAndData = async (userId) => {
    try {
      let userDocRef = doc(db, "userClient", userId);
      let userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        userDocRef = doc(db, "userDesigner", userId);
        userDoc = await getDoc(userDocRef);
      }
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userName = userData.name;
        await deleteDoc(userDocRef);
        console.log(`User with ID ${userId} deleted from users collection`);

        const postsQuerySnapshot = await getDocs(
          query(collection(db, "postsDesigner"), where("userId", "==", userId))
        );
        const batch = db.batch();
        postsQuerySnapshot.forEach((postDoc) => {
          batch.delete(doc(db, "postsDesigner", postDoc.id));
        });
        await batch.commit();//*لاحر هوسفت كل هبعولوت يخوليم لبتسع اوتو بامتسعوت زه
        console.log(`All posts for user ${userId} deleted from postsDesigner`);

        const chatsQuerySnapshot = await getDocs(collection(db, "chats"));
        const messagesBatch = db.batch();

        for (const chatDoc of chatsQuerySnapshot.docs) {
          const chatId = chatDoc.id;
          const messagesRef = collection(db, "chats", chatId, "messages");
          const messagesQuerySnapshot = await getDocs(
            query(messagesRef, where("user.id", "==", userId))
          );

          messagesQuerySnapshot.forEach((messageDoc) => {
            messagesBatch.delete(doc(messagesRef, messageDoc.id));
          });
        }
        await messagesBatch.commit();//بعد اضافهالعمليات الحذف وغيرها يتم اضافه هذا السطر بعد اضافته يتم حذف الكل 
      //!!  console.log(`All messages for user ${userId} deleted`);

        

        await auth.currentUser.delete();//!!هي دالة تُستخدم لحذف حساب المستخدم الحالي 
        //!!console.log(`User ${userId} deleted successfully.`);
      } else {
        console.log("User does not exist.");
      }
    } catch (error) {
      console.error("Error deleting user and related data:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userName,
        userType,
        userImgUrl,
        followersCount,
        followingCount,
        posts,
        setPosts,//!!posts User dESIGNER -->
        setUserImgUrl,//!!----> IMageProfile 
        signUp,
        signIn,
        signOutUser,
        deleteUserAndData,  //!!deledte acount and all datat the user
        isBlocked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
