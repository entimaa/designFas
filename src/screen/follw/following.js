// components/Following.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';

const Following = ({ modalVisible, toggleFollowingModal, followingList }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={toggleFollowingModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView style={styles.followingList}>
            {followingList.map((following, index) => (
              <View key={index} style={styles.followingItem}>
                <Image style={styles.followingImg} source={{ uri: following.userImgUrl }} />
                <Text style={styles.followingName}>{following.userName}</Text>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={toggleFollowingModal}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
  followingList: {
    width: '100%',
    maxHeight: 300,
  },
  followingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  followingImg: {
    height: 50,
    width: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  followingName: {
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

export default Following;
