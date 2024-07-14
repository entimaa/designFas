import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import {getFirestore ,deleteDoc} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAwj0_EIVLJzu_2W2f_amHDhTM_dJNqeyg",
  authDomain: "designfashoin-76577.firebaseapp.com",
  projectId: "designfashoin-76577",
  storageBucket: "designfashoin-76577.appspot.com",
  messagingSenderId: "548498553302",
  appId: "1:548498553302:web:3e1beb85d742d5786e8c77",
  measurementId: "G-1H2TEGNX67"
};
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
  const db = getFirestore(app);

const  storage = getStorage(app)
export { db,app, auth , storage};