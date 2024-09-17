import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../../data/DataFirebase';
import { useAuth } from '../../context/AuthContext';

const ChatList = ({ navigation }) => {
  const [users, setUsers] = useState({});
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const designerRef = collection(db, 'userDesigner');
        const clientRef = collection(db, 'userClient');

        const designerQuery = query(designerRef);
        const clientQuery = query(clientRef);

        const unsubscribeDesigner = onSnapshot(designerQuery, (querySnapshot) => {
          const fetchedUsers = {};
          querySnapshot.forEach((doc) => {
            const userData = doc.data();
            if (doc.id !== user?.uid) {
              fetchedUsers[doc.id] = {
                id: doc.id,
                username: userData.name || '', //!سم المستخدم، مع وجود احتياط إذا كان الاسم غير موجود باستخدام
                userImgUrl: userData.userImgUrl || '', //!صوره احتياططط 
              };
            }
          });
          setUsers(prevUsers => ({ ...prevUsers, ...fetchedUsers }));//!قوم بتحديث حالة users عن طريق دمج المستخدمين المسترجعين حديثًا
                                                                      //! مع المستخدمين الحاليين.
        });

        const unsubscribeClient = onSnapshot(clientQuery, (querySnapshot) => {
          const fetchedUsers = {};
          querySnapshot.forEach((doc) => {
            const userData = doc.data();
            if (doc.id !== user?.uid) {
              fetchedUsers[doc.id] = {
                id: doc.id,
                username: userData.name || '',  
                userImgUrl: userData.userImgUrl || '', 
              };
            }
          });
          setUsers(prevUsers => ({ ...prevUsers, ...fetchedUsers }));
        });

        return () => {
          unsubscribeDesigner();
          unsubscribeClient();
        };
      } catch (error) {
        console.error('Error fetching users: ', error);
      }
    };

    fetchUsers();
  }, [user?.uid]);

  const goToChat = (userId, username, userImgUrl) => {
    navigation.navigate('Chat', { userId, username, userImgUrl });
  };

  const goToProfile = (userId, username, userImgUrl) => {
    navigation.navigate('UserProfile', { userId, username, userImgUrl });
  };

  const filteredUsers = Object.values(users).filter(user => 
    (user.username || '').toLowerCase().includes(search.toLowerCase())
  );

  const renderSearchResultItem = ({ item }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => goToProfile(item.id, item.username, item.userImgUrl)}
    >
      <View style={styles.searchResultGradient}>
        <Image
          source={item.userImgUrl ? { uri: item.userImgUrl } : require('../../pic/avtar.png')}
          style={styles.searchResultAvatar}
        />
        <Text style={styles.searchResultUsername}>{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => goToChat(item.id, item.username, item.userImgUrl)}
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
      <TextInput
        style={styles.searchBar}
        placeholder="Search"
        value={search}
        onChangeText={setSearch}
      />
      {search.length > 0 && (
        <ScrollView horizontal contentContainerStyle={styles.searchResultsContainer}>
          {filteredUsers.map(user => (
            <TouchableOpacity
              key={user.id}
              style={styles.searchResultItem}
              onPress={() => goToProfile(user.id, user.username, user.userImgUrl)}
            >
              <View style={styles.searchResultGradient}>
                <Image
                  source={user.userImgUrl ? { uri: user.userImgUrl } : require('../../pic/avtar.png')}
                  style={styles.searchResultAvatar}
                />
                <Text style={styles.searchResultUsername}>{user.username}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      <FlatList
        data={Object.values(users)}
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
    backgroundColor: '#F8EDE3',
  },
  searchBar: {
    height: 40,
    borderColor: '#D0B8A8',
    borderWidth: 1,
    margin: 10,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  searchResultsContainer: {
    paddingHorizontal: 15,
    paddingBottom: 25,
  },
  searchResultItem: {
    alignItems: 'center',
    marginRight: 4,
  },
  searchResultGradient: {
    alignItems: 'center',
    borderRadius: 0,
    padding: 8,
    backgroundColor: '#D0B8A8',
    borderWidth: 1,
    borderColor: '#bf7b40',
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
  },
  searchResultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#bf7b40',
  },
  searchResultUsername: {
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D0B8A8',
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
