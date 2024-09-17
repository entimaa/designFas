import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const ReportModal = ({ modalVisible, setModalVisible, reportText, setReportText, handleReportSubmit }) => (
  <Modal
    transparent={true}
    visible={modalVisible}
    onRequestClose={() => {
      setReportText(''); // !!Clear text if  when modal closes
      setModalVisible(false);
    }}
    animationType="slide"//! تجعل النافذة تنزلق من أسفل الشاشة إلى الأعلى عند ظهورها، وتنزلق من الأعلى إلى الأسفل عند إخفائها.
    //! window slide from the bottom of the screen to the top --> and from the top to the bottom when hidden.
  >
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
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
              setReportText(''); // !Clear text 
              setModalVisible(false);
            }} 
            style={styles.iconButtonReport}
          >
            <Icon name="times" size={24} color="#F44336" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleReportSubmit} 
            style={styles.iconButtonReportSEnd}
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
      justifyContent: 'center',  //!! Center the modal 
      alignItems: 'center',      
    },
    modalContent: {
      backgroundColor: '#F8EDE3',//!BEGG
      borderRadius: 10,
      padding: 10,//!
      width: '80%',        
      height: '30%', 
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
      backgroundColor: '#FFF',//!INNPU WHIte
      color: '#333',
      fontSize: 16,
      textAlignVertical: 'top',
      flex: 1,       
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
  });
export default ReportModal;