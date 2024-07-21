// components/Followers.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';

const Followers = ({ modalVisible, toggleFollowersModal, followersList }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={toggleFollowersModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView style={styles.followersList}>
            {followersList.map((follower, index) => (
              <View key={index} style={styles.followerItem}>
                <Image style={styles.followerImg} source={{ uri: follower.userImgUrl }} />
                <Text style={styles.followerName}>{follower.userName}</Text>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={toggleFollowersModal}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // تغميق الخلفية
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  followersList: {
    width: '100%',
    maxHeight: 300, // تحديد أقصى ارتفاع للقائمة
  },
  followerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  followerImg: {
    height: 50,
    width: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  followerName: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#2e64e5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Followers;
