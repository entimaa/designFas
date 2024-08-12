import React, { useState, useCallback, useLayoutEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Image, Alert, Platform, Text } from 'react-native';
import { collection, orderBy, query, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { GiftedChat, Bubble, Send, InputToolbar } from 'react-native-gifted-chat';
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
  const [fullImageVisible, setFullImageVisible] = useState(false);
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
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled) {
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
      headerTitleAlign: 'center',  // محاذاة العنوان إلى اليسار
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome name="chevron-left" size={25} color="#000" />
        </TouchableOpacity>
      ),
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
    };

    if (image) {
      messageData.image = image;
    }

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
        left: { backgroundColor: '#EADBC8', borderRadius: 15, padding: 5, marginBottom: 5 },
        right: { backgroundColor: '#DAC0A3', borderRadius: 15, padding: 5, marginBottom: 5 },
      }}
      textStyle={{
        left: { color: '#000' },
        right: { color: '#000' },
      }}
      onPress={() => {
        if (props.currentMessage.image) {
          setImageUri(props.currentMessage.image);
          setFullImageVisible(true);
        }
      }}
    />
  );

  const renderSend = (props) => (
    <View style={styles.bottomContainer}>
      <TouchableOpacity onPress={handleImagePicker} style={styles.imagePicker}>
        <FontAwesome name="camera" size={25} color="#914F1E" />
      </TouchableOpacity>
      <View style={styles. line} />
      <Send {...props}>
        <View style={styles.sendingContainer}>
          
          <FontAwesome name="paper-plane" size={25} color="#914F1E" />
        </View>
      </Send>
    </View>
  );

  const scrollToBottomComponent = () => (
    <FontAwesome name='angle-double-down' size={22} color='#0078fe' />
  );

  const renderInputToolbar = (props) => (
    <InputToolbar
      {...props}
      containerStyle={{
        ...props.containerStyle,
        borderRadius: 50, 
       
        backgroundColor:'#EADBC8',// تعديل هذه القيمة لجعل الزوايا دائرية
      }}
    />
  );
  
  

  return (
    <View style={{ flex: 1, backgroundColor: '#f2f2f2',bottom:20 }}>
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
        renderInputToolbar={renderInputToolbar}
      />
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Image source={{ uri: imageUri }} style={styles.modalImage} />

          <View style={styles.modalButtonsContainer}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
              <Text style={styles.buttonText}>Cancel</Text>
              <FontAwesome name="times" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleUploadImage} style={styles.sendButton}>
              <Text style={styles.buttonText}>Send</Text>
              <FontAwesome name="paper-plane" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={fullImageVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullImageVisible(false)}
      >
        <TouchableOpacity style={styles.fullImageContainer} onPress={() => setFullImageVisible(false)}>
          <Image source={{ uri: imageUri }} style={styles.fullImage} />
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
      backgroundColor:'#',
    padding: 2,
  },
  modalImage: {
    width: '100%',
    height: '80%',
    marginBottom: 20,
  },
  modalButtonsContainer: {
    
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4d4d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4caf50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    marginRight: 5,
  },
  fullImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  fullImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  imagePicker: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  sendingContainer: {
    bottom:10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  line: {
    width: 1, // عرض الحاجز
    height: 27, // ارتفاع الحاجز
    backgroundColor: '#8D493A', // لون الحاجز
    marginHorizontal: 1, // المسافة بين الأيقونتين
  },
});

export default Chat;

