import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { db } from '../../data/DataFirebase';
import { collection, getDocs } from 'firebase/firestore';

const FollowersListScreen = ({ route }) => {
  const { userId } = route.params;
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowers = async () => {
      setLoading(true);
      try {
        const followersSnap = await getDocs(collection(db, "followers", userId, "userFollowers"));
        const followersData = followersSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFollowers(followersData);
      } catch (error) {
        console.error('Error fetching followers: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [userId]);

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={followers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item}>
              <Text>{item.userName}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default FollowersListScreen;
