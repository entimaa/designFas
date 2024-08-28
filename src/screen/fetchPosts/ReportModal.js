import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const ReportModal = ({ modalVisible, setModalVisible, reportText, setReportText, handleReportSubmit }) => (
  <Modal
    transparent={true}
    visible={modalVisible}
    onRequestClose={() => {
      setReportText(''); // Optional: Clear text if desired when modal closes
      setModalVisible(false);
    }}
    animationType="slide"
  >
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.modalContainer}
    >
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Add Report</Text>
        <TextInput
          style={styles.reportInput}
          placeholder="Enter report text here..."
          value={reportText}
          onChangeText={setReportText}
          multiline
          autoFocus
        />
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            onPress={() => {
              setReportText(''); // Optional: Clear text if desired
              setModalVisible(false);
            }} 
            style={styles.iconButtonReport}
          >
            <Icon name="times" size={24} color="#F44336" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleReportSubmit} 
            style={styles.iconButtonReport}
          >
            <Icon name="send" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',  // Center the modal vertically
      alignItems: 'center',      // Center the modal horizontally
    },
    modalContent: {
      backgroundColor: '#F8EDE3',
      borderRadius: 10,         // Optional: you can round all corners
      padding: 20,
      
      width: '80%',        
      height: '30%',     // Adjust width as needed
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
      color: '#333',
    },
    reportInput: {
      borderColor: '#8D493A',
      borderWidth: 1,
      borderRadius: 10,
      padding: 10,
      backgroundColor: '#FFF',
      color: '#333',
      fontSize: 16,
      textAlignVertical: 'top',
      flex: 1,                  // Ensure the input takes up available space
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    iconButtonReport: {
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
    },
  });
  

export default ReportModal;