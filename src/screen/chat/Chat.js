import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { collection, orderBy, query, onSnapshot, addDoc } from 'firebase/firestore';
import { GiftedChat, Bubble, Send } from 'react-native-gifted-chat';
import { auth, db } from '../../../data/DataFirebase';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const { user, userImgUrl } = useAuth();
  const navigation = useNavigation();

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
    const collRef = collection(db, 'chats');
    const q = query(collRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedMessages = snapshot.docs.map((doc) => ({
        _id: doc.id,
        createdAt: new Date(doc.data().createdAt.seconds * 1000),
        text: doc.data().text,
        user: doc.data().user,
      }));
      setMessages(updatedMessages);
    });

    return () => unsubscribe();
  }, []);

  const onSend = useCallback((messages = []) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, messages));
    const { _id, createdAt, text, user } = messages[0];
    addDoc(collection(db, 'chats'), {
      _id,
      createdAt,
      text,
      user,
    });
  }, []);

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
