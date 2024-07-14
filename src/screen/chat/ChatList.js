import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../../data/DataFirebase';
import { useAuth } from '../../context/AuthContext';

const ChatList = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'userDesigner');
        const q = query(usersRef);

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const fetchedUsers = [];
          querySnapshot.forEach((doc) => {
            const userData = doc.data();
            if (doc.id !== user?.uid) { // Exclude the current user from the list
              fetchedUsers.push({
                id: doc.id,
                username: userData.name,
                userImgUrl: userData.userImgUrl,
              });
            }
          });
          setUsers(fetchedUsers);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching users: ', error);
      }
    };

    fetchUsers();
  }, [user?.uid]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => navigation.navigate('Chat', { userId: item.id, username: item.username })}
    >
      <Image
        source={item.userImgUrl ? { uri: item.userImgUrl } : require('../../pic/avtar.png')}
        style={styles.avatar}
      />
      <Text style={styles.username}>{item.username}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ChatList;
