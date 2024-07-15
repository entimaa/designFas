import React, { useState, useCallback, useLayoutEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
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
  const { userId, username } = route.params;

  // Generate a unique chat ID for the conversation
  const chatId = user?.uid < userId ? `${user?.uid}_${userId}` : `${userId}_${user?.uid}`;

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

  // Set the header title to the username and handle the back action
  useLayoutEffect(() => {
    navigation.setOptions({
      title: username,
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome name="chevron-left" size={25} color="#000" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, username]);

  // Fetch messages from Firestore
  useLayoutEffect(() => {
    const collRef = collection(db, 'chats', chatId, 'messages');
    const q = query(collRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedMessages = snapshot.docs.map((doc) => ({
        _id: doc.id,
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
        text: doc.data().text,
        user: doc.data().user,
      }));

      setMessages(updatedMessages);
    });

    return () => unsubscribe();
  }, [user?.uid, userId, chatId]);

  const onSend = useCallback((messages = []) => {
    const { _id, text, user: messageUser } = messages[0];
    const messageData = {
      _id,
      createdAt: serverTimestamp(),
      text,
      user: messageUser,
    };

    addDoc(collection(db, 'chats', chatId, 'messages'), messageData);
  }, [user?.uid, userId, chatId]);

  const renderBubble = (props) => (
    <Bubble
      {...props}
      wrapperStyle={{
        left: { backgroundColor: '#B3B3B3' },
        right: { backgroundColor: '#2e64e5' },
      }}
      textStyle={{
        left: { color: 'white' },
        right: { color: 'white' },
      }}
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
