import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import PostsSection from './posts';

const ProfileScreen = () => {
  const { user, signOutUser, userName } = useAuth();

  const handleLogout = async () => {
    await signOutUser();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome, {userName}</Text>
      <Button title="Logout" onPress={handleLogout} />
      <PostsSection />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 1,
    fontWeight: 'bold',
    marginBottom: 1,
  },
});

export default ProfileScreen;
