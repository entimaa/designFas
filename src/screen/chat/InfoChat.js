import { db } from '../../../data/DataFirebase'; // استيراد تهيئة فايربيز من ملف DataFirebase
import { getAuth } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';

// دالة إرسال الرسائل
export const sendMessage = async (IdChat, message) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    await addDoc(collection(db, 'chats', IdChat, 'messages'), {
      text: message,
      createdAt: serverTimestamp(),
      userId: user.uid,
      userName: user.email,
    });
  }
};

// دالة الحصول على الرسائل
export const getMessages = (IdChat, updateMessages) => {
  const messagesQuery = query(
    collection(db, 'chats', IdChat, 'messages'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      _id: doc.id,
      text: doc.data().text,
      createdAt: doc.data().createdAt.toDate(),
      user: {
        _id: doc.data().userId,
        name: doc.data().userName,
      }
    }));
    updateMessages(messages);
  });
};
