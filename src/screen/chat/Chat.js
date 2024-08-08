import React, { useState, useCallback, useLayoutEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Image, Button, Platform, Alert } from 'react-native';
import { collection, orderBy, query, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { GiftedChat, Bubble, Send } from 'react-native-gifted-chat';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { db, storage } from '../../../data/DataFirebase'; 
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [imageUri, setImageUri] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { user, userImgUrl } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, username } = route.params;

  const chatId = user?.uid < userId ? `${user?.uid}_${userId}` : `${userId}_${user?.uid}`;

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });
    if (!result.cancelled) {
      setImageUri(result.assets[0].uri);
      setModalVisible(true);
    }
  };

  const takeImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });
    if (!result.cancelled) {
      setImageUri(result.assets[0].uri);
      setModalVisible(true);
    }
  };

  const handleImagePicker = () => {
    Alert.alert(
      "Select Image",
      "Choose an image source",
      [
        { text: "Camera", onPress: takeImage },
        { text: "Gallery", onPress: pickImage },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

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
    navigation.setOptions({
      title: username,
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome name="chevron-left" size={25} color="#000" />
        </TouchableOpacity>
      ),
      /*
      headerRight: () => (
        <TouchableOpacity onPress={handleImagePicker}>
          <FontAwesome name="image" size={25} color="#000" />
        </TouchableOpacity>
      ),*/
    });
  }, [navigation, username]);

  useLayoutEffect(() => {
    const collRef = collection(db, 'chats', chatId, 'messages');
    const q = query(collRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedMessages = snapshot.docs.map((doc) => ({
        _id: doc.id,
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
        text: doc.data().text,
        user: doc.data().user,
        image: doc.data().image,
      }));

      setMessages(updatedMessages);
    });

    return () => unsubscribe();
  }, [user?.uid, userId, chatId]);

  const onSend = useCallback((messages = []) => {
    const { _id, text, user: messageUser, image } = messages[0];
    const messageData = {
      _id,
      createdAt: serverTimestamp(),
      text,
      user: messageUser,
      image,
    };

    addDoc(collection(db, 'chats', chatId, 'messages'), messageData);
  }, [user?.uid, userId, chatId]);

  const handleUploadImage = async () => {
    const filename = imageUri.split('/').pop();
    const uploadUri = Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri;
    const storageRef = ref(storage, `chat-images/${filename}`);
    const response = await fetch(uploadUri);
    const blob = await response.blob();

    try {
      await uploadBytes(storageRef, blob);
      const imageUrl = await getDownloadURL(storageRef);

      console.log('Image uploaded successfully:', imageUrl);

      const newMessage = {
        _id: new Date().getTime().toString(),
        createdAt: new Date(),
        text: '',
        user: {
          _id: user?.uid,
          avatar: userImgUrl,
        },
        image: imageUrl,
      };

      onSend([newMessage]);
      setModalVisible(false);
    } catch (error) {
      console.log('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image.');
    }
  };

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
      renderMessageImage={() => {
        if (props.currentMessage.image) {
          return (
            <Image
              source={{ uri: props.currentMessage.image }}
              style={styles.messageImage}
            />
          );
        }
        return null;
      }}
    />
  );

  const renderSend = (props) => (
    <View style={styles.bottomContainer}>
      <TouchableOpacity onPress={handleImagePicker} style={styles.imagePicker}>
        <FontAwesome name="camera" size={25} color="#2e64e5" />
      </TouchableOpacity>
      <Send {...props}>
        <View style={styles.sendingContainer}>
          <FontAwesome name="paper-plane" size={25} color="#2e64e5" style={{ marginBottom: 10 }} />
        </View>
      </Send>
    </View>
  );
  

  const scrollToBottomComponent = () => (
    <FontAwesome name='angle-double-down' size={22} color='#333' />
  );

  return (
    <View style={{ flex: 1 }}>
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
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Image source={{ uri: imageUri }} style={styles.modalImage} />
          <View style={styles.modalButtonsContainer}>
            <Button title="Send" onPress={handleUploadImage} color="#2e64e5" />
            <Button title="Cancel" onPress={() => setModalVisible(false)} color="#f00" />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  sendingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 5,
  },
  messageImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalImage: {
    width: 300,
    height: 300,
    borderRadius: 15,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 5,
  },
  sendingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  imagePicker: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 5,
  },

});

export default Chat;
