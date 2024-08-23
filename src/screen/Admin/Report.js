import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Image } from "react-native";
import { collection, getDocs, doc, deleteDoc, getDoc, updateDoc, query, where, writeBatch } from "firebase/firestore";
import { db, auth } from "../../../data/DataFirebase";
import { useAuth } from "../../context/AuthContext";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Snackbar } from 'react-native-paper';

const ReportListScreen = () => {
  const [reports, setReports] = useState([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { signOutUser } = useAuth();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'reports'));
        const reportsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReports(reportsList);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, []);

  const handleDeleteReport = async (reportId, detailIndex) => {
    try {
      const reportRef = doc(db, 'reports', reportId);
      const reportDoc = await getDoc(reportRef);

      if (reportDoc.exists) {
        const reportData = reportDoc.data();
        const updatedDetails = reportData.reportDetails.filter((_, index) => index !== detailIndex);

        if (updatedDetails.length > 0) {
          await updateDoc(reportRef, { reportDetails: updatedDetails });
        } else {
          await deleteDoc(reportRef);
        }

        setSnackbarMessage('Report detail deleted successfully');
        setSnackbarVisible(true);
        setReports(reports.map(report => report.id === reportId ? { ...report, reportDetails: updatedDetails } : report));
      } else {
        Alert.alert('Error', 'This report has already been deleted.');
      }
    } catch (error) {
      console.error("Error deleting report detail:", error);
      Alert.alert('Error', 'Failed to delete report detail');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const postRef = doc(db, 'postsDesigner', postId);
      const postDoc = await getDoc(postRef);

      if (postDoc.exists()) {
        await deleteDoc(postRef);
        setSnackbarMessage('Post deleted successfully');
        setSnackbarVisible(true);
      } else {
        Alert.alert('not find', 'This post has already been deleted.');
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      Alert.alert('Error', 'Failed to delete post');
    }
  };

  const handleBlockUser = async (reportedToUid) => {
    try {
      const userRef = doc(db, 'userDesigner', reportedToUid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists() && userDoc.data().isBlocked) {
        Alert.alert('Already Blocked', 'This user has already been blocked.');
        return;
      }

      await updateDoc(userRef, { isBlocked: true });

      const postsRef = collection(db, 'postsDesigner');
      const postsQuery = query(postsRef, where('userId', '==', reportedToUid));
      const querySnapshot = await getDocs(postsQuery);

      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      if (auth.currentUser && auth.currentUser.uid === reportedToUid) {
        await signOut(auth);
        Alert.alert('User Blocked', 'You have been blocked and logged out.');
      }

      setSnackbarMessage('User has been blocked and all their posts have been deleted.');
      setSnackbarVisible(true);

    } catch (error) {
      console.error("Error blocking user and deleting posts:", error);
      Alert.alert('Error', 'Failed to block user and delete their posts.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {reports.map((report, reportIndex) => (
          <View key={reportIndex} style={styles.reportCard}>
            {report.reportDetails.map((detail, detailIndex) => (
              <View key={detailIndex} style={styles.reportDetail}>
                {/* Image Display */}
                {detail.postImageUrl ? (
                  <Image 
                    source={{ uri: detail.postImageUrl }} 
                    style={styles.postImage} 
                    resizeMode="cover" 
                  />
                ) : (
                  <Text style={styles.noImageText}>No Image Available</Text>
                )}

                <Text style={styles.reportTitle}>Reported By:</Text>
                <Text style={styles.reportText}>{detail.reportedByName || 'Unknown Name'}</Text>

                <Text style={styles.reportTitle}>Reported To:</Text>
                <Text style={styles.reportText}>{detail.reportedToName || 'Unknown Name'}</Text>

                <Text style={styles.reportTitle}>Post Title:</Text>
                <Text style={styles.reportText}>{detail.postTitle || 'No Title'}</Text>

                <Text style={styles.reportTitle}>Report Text:</Text>
                <Text style={styles.reportText}>{detail.reportText || 'No Text'}</Text>

                <Text style={styles.reportTitle}>Timestamp:</Text>
                <Text style={styles.reportText}>{detail.timestamp?.toDate().toLocaleString() || 'No Timestamp'}</Text>

                <View style={styles.actionsContainer}>
                  <TouchableOpacity onPress={() => handleDeleteReport(report.id, detailIndex)} style={styles.actionButton}>
                    <Icon name="delete" size={24} color="red" />
                    <Text style={styles.actionText}>Delete Report</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleBlockUser(detail.reportedTo)} style={styles.actionButton}>
                    <Icon name="block" size={24} color="#45474B" />
                    <Text style={styles.actionText}>Block User</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeletePost(detail.postId)} style={styles.actionButton}>
                    <Icon name="delete-forever" size={24} color="#379777" />
                    <Text style={styles.actionText}>Delete Post</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Snackbar لإظهار الإشعارات */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  scrollContainer: {
    flexDirection: 'column',
    paddingBottom: 16,
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  reportDetail: {
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 270, // Adjust the height as needed
    borderRadius: 7,
    marginBottom: 10,
  },
  noImageText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 10,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  reportText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    borderWidth: 1,
    top:20,
    borderColor: '#BFCFE7',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    width: 100,
  },
  actionText: {
    fontWeight: 'bold',
    fontSize: 11,
    marginTop: 4,
    color: '#000',
    textAlign: 'center',
  },
});

export default ReportListScreen;
