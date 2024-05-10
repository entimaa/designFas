import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import {getFirestore} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAlc2yIkMu5ws_pgiZbvetC4NzBZv23Nps",
  authDomain: "designfashoin.firebaseapp.com",
  projectId: "designfashoin",
  storageBucket: "designfashoin.appspot.com",
  messagingSenderId: "967210178253",
  appId: "1:967210178253:web:c52459540e6ef9dc197b84",
  measurementId: "G-JEX4QNJ5CT"
};
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);

const  storage = getStorage(app)
export { app, auth , storage };