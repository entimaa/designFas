import React, { useState, useCallback, useLayoutEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { collection, orderBy, query, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { GiftedChat, Bubble, Send } from 'react-native-gifted-chat';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { db } from '../../../data/DataFirebase';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const { user, userImgUrl } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params;

  // Hide tab bar when entering Chat screen
  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' },
    });

    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: 'flex' },
      });
    };
  }, [navigation]);

  useLayoutEffect(() => {
    if (!user?.uid || !userId) return;

    const collRef = collection(db, 'chats', user.uid, 'messages');
    const q = query(collRef, orderBy('createdAt'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedMessages = snapshot.docs.map((doc) => ({
        _id: doc.id,
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
        text: doc.data().text,
        user: doc.data().user,
      }));

      // Reverse the messages to display the latest at the bottom
      setMessages(updatedMessages.reverse());
    });

    return () => unsubscribe();
  }, [user?.uid, userId]);

  const onSend = useCallback((messages = []) => {
    if (!user?.uid || !userId) return;

    const { _id, text, user: messageUser } = messages[0];
    const messageData = {
      _id,
      createdAt: serverTimestamp(),
      text,
      user: messageUser,
    };

    // Add message to the current user's subcollection
    addDoc(collection(db, 'chats', user.uid, 'messages'), messageData);
    // Add message to the recipient's subcollection
    addDoc(collection(db, 'chats', userId, 'messages'), messageData);
  }, [user?.uid, userId]);

  const renderBubble = (props) => (
    <Bubble
      {...props}
      wrapperStyle={{ right: { backgroundColor: '#2e64e5' } }}
      textStyle={{ right: { color: 'white' } }}
    />
  );

  const renderSend = (props) => (
    <Send {...props}>
      <View style={styles.sendingContainer}>
        <FontAwesome name="arrow-circle-right" size={25} color="#2e64e5" style={{ marginBottom: 10 }} />
      </View>
    </Send>
  );

  const scrollToBottomComponent = () => (
    <FontAwesome name='angle-double-down' size={22} color='#333' />
  );

  return (
    <GiftedChat
      messages={messages}
      onSend={(messages) => onSend(messages)}
      user={{
        _id: user?.uid,
        avatar: userImgUrl,
      }}
      renderBubble={renderBubble}
      alwaysShowSend
      renderSend={renderSend}
      scrollToBottom
      scrollToBottomComponent={scrollToBottomComponent}
    />
  );
};

const styles = StyleSheet.create({
  sendingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 5,
  },
});

export default Chat;
