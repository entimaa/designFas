import { collection, doc, setDoc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../data/DataFirebase';

// Function to create or join a chat room
const createOrJoinChatRoom = async (userId1, userId2) => {
  const chatRoomId = userId1 < userId2 ? `${userId1}_${userId2}` : `${userId2}_${userId1}`;
  const chatRoomRef = doc(db, 'chats', chatRoomId);
  const chatRoomSnapshot = await getDoc(chatRoomRef);

  if (!chatRoomSnapshot.exists()) {
    await setDoc(chatRoomRef, {
      users: [userId1, userId2],
      lastMessage: '',
      lastMessageTimestamp: serverTimestamp(),
    });
  }

  return chatRoomId;
};
