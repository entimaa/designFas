import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, FlatList, TextInput ,TouchableWithoutFeedback,KeyboardAvoidingView,Platform} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, deleteDoc ,getFirestore,collection,addDoc,setDoc} from 'firebase/firestore';
import { db } from '../../../data/DataFirebase'; // Adjust the import path as necessary
import { useAuth } from '../../context/AuthContext'; // Import your authentication context
import Icon from 'react-native-vector-icons/FontAwesome';
import Modal from 'react-native-modal';

const PostCard = ({ post, onPostDelete }) => {
  const [heartColor, setHeartColor] = useState('#000');
  const [commentColor, setCommentColor] = useState('#000');
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [likedByUser, setLikedByUser] = useState(false);
  const [reportCount, setReportCount] = useState(post.reportCount || 0);
  const [reportedByUser, setReportedByUser] = useState(false);
  const [reportComment, setReportComment] = useState('');
  // ? report commett***
  const [modalVisible, setModalVisible] = useState(false);
const [reportText, setReportText] = useState('');

  const navigation = useNavigation();
  const { user, userName, userImgUrl } = useAuth();

  useEffect(() => {
    const postRef = doc(db, 'postsDesigner', post.id);
    const unsubscribe = onSnapshot(postRef, (doc) => {
      const postData = doc.data();
      setComments(postData.comments || []);
      setLikesCount(postData.likesCount || 0);
      setReportCount(postData.reportCount || 0);

      if (Array.isArray(postData.likes)) {
        setLikedByUser(postData.likes.includes(user.uid));
      } else {
        setLikedByUser(false);
      }

      if (Array.isArray(postData.reports)) {
        setReportedByUser(postData.reports.includes(user.uid));
      } else {
        setReportedByUser(false);
      }
    });

    return () => unsubscribe();
  }, [post.id, user.uid]);

  useEffect(() => {
    setHeartColor(likedByUser ? 'red' : '#000');
  }, [likedByUser]);

  const toggleHeartColor = async () => {
    const postRef = doc(db, 'postsDesigner', post.id);
    try {
      if (likedByUser) {
        await updateDoc(postRef, {
          likes: arrayRemove(user.uid),
          likesCount: likesCount - 1,
        });
        setLikedByUser(false);
        setLikesCount(likesCount - 1);
        setHeartColor('#000');
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(user.uid),
          likesCount: likesCount + 1,
        });
        setLikedByUser(true);
        setLikesCount(likesCount + 1);
        setHeartColor('red');
      }
    } catch (error) {
      console.error('Error updating likes:', error);
      Alert.alert('Error', 'Failed to update likes.');
    }
  };

  const toggleCommentColor = () => {
    setCommentColor((prevColor) => (prevColor === '#000' ? '#000' : '#000'));
    setShowCommentsModal(true);
  };

  const navigateToUserProfile = () => {
    navigation.navigate('UserProfile', { 
      userId: post.userId, 
      username: post.username, 
      userImgUrl: post.userImgUrl 
    });
  };

  const handleDeletePost = async () => {
    try {
      const postRef = doc(db, 'postsDesigner', post.id);
      await deleteDoc(postRef);
      onPostDelete(post.id);
      Alert.alert('Success', 'Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      Alert.alert('Error', 'Failed to delete post.');
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: handleDeletePost }
      ]
    );
  };

  const handleAddComment = async () => {
    if (newComment.trim().length === 0) {
      Alert.alert('Error', 'Comment cannot be empty.');
      return;
    }

    const commentData = {
      id: new Date().toISOString(),
      userId: user.uid,
      username: userName || 'USER',
      userImgUrl: userImgUrl || '../../pic/avtar.png',
      comment: newComment,
      timestamp: new Date().toISOString(),
    };

    try {
      const postRef = doc(db, 'postsDesigner', post.id);
      await updateDoc(postRef, {
        comments: arrayUnion(commentData),
      });

      setNewComment('');
      setComments([...comments, commentData]);
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const postRef = doc(db, 'postsDesigner', post.id);
      const updatedComments = comments.filter(comment => comment.id !== commentId);
      await updateDoc(postRef, {
        comments: updatedComments,
      });
      setComments(updatedComments);
      Alert.alert('Success', 'Comment deleted successfully!');
    } catch (error) {
      console.error('Error deleting comment:', error);
      Alert.alert('Error', 'Failed to delete comment.');
    }
  };

  const confirmDeleteComment = (commentId, commentUserId) => {
    if (user.uid === commentUserId) {
      Alert.alert(
        'Delete Comment',
        'Are you sure you want to delete this comment?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => handleDeleteComment(commentId) },
        ]
      );
    } else {
      Alert.alert('Error', 'You can only delete your own comments.');
    }
  };
  
///////////////////////////////


/////


///////////////////////
/* 
const handleReportSubmit = async () => {
  console.log(user.uid);
  if (!reportText.trim()) {
    Alert.alert('تنبيه', 'يرجى إدخال نص التقرير.');
    return;
  }

  try {
    const reportRef = doc(db, 'reports', post.id);
    const commentsRef = collection(reportRef, 'comments'); // مجموعة فرعية للتعليقات

    // إضافة تعليق جديد كمستند منفصل في مجموعة التعليقات
    await addDoc(commentsRef, {
      reportText: reportText.trim(),
      reportedBy: user.uid || 'unknown', // اسم الشخص الذي أبلغ
      postId: post.id, // معرف البوست
      reportedTo: post.userId,
      postTitle: post.title || 'بلا عنوان', // عنوان البوست أو أي معلومات أخرى ذات صلة
      timestamp: new Date(), // الوقت الذي تم فيه الإبلاغ
    });

    Alert.alert('نجاح', 'تم إرسال تقريرك بنجاح.');

    setModalVisible(false);
    setReportText('');
  } catch (error) {
    console.error('خطأ في إرسال التقرير:', error);
    Alert.alert('خطأ', 'حدث خطأ أثناء إرسال التقرير.');
  }
};
*/


const handleReportSubmit = async () => {
  // التحقق من إدخال نص التقرير
  if (!reportText.trim()) {
    Alert.alert('تنبيه', 'يرجى إدخال نص التقرير.');
    return;
  }
console.log(post.username)
console.log(post.id)
  // التأكد من صحة القيم قبل إرسالها
  if (!post.id || !post.userId  || !post.username || !user.uid ) {
    Alert.alert('خطأ', 'توجد بيانات مفقودة. يرجى التحقق من جميع الحقول.');
    return;
  }

  try {
    const reportRef = doc(db, 'reports', post.id);
    
    // البيانات التي نريد حفظها في وثيقة التقرير
    const reportData = {
      reportTexts: arrayUnion(reportText.trim()), // حفظ نصوص التقارير
      reportedUsers: arrayUnion(user.uid), // حفظ UID للمستخدم الذي أبلغ
      reportDetails: arrayUnion({
        reportText: reportText.trim(), // نص الإبلاغ
        reportedBy: user.uid || 'unknown', // UID الشخص الذي أبلغ
        reportedByName: userName|| 'unknown', // اسم الشخص الذي أبلغ
        postId: post.id || 'unknown', // معرف البوست
        reportedTo: post.userId || 'unknown', // UID الشخص الذي تم الإبلاغ عنه
        reportedToName: post.username || 'unknown', // اسم الشخص الذي تم الإبلاغ عنه
        postTitle: post.title || 'not', // عنوان البوست
         postImageUrl: post.imageUrl || 'unknown',
        timestamp: new Date(), // توقيت التقرير
      }),
    };

    // استخدام setDoc بدلاً من updateDoc لإنشاء الوثيقة إذا لم تكن موجودة
    await setDoc(reportRef, reportData, { merge: true });

    Alert.alert('نجاح', 'تم إرسال تقريرك بنجاح.');

    setReportText(''); // تنظيف النص بعد الإرسال
  } catch (error) {
    console.error('خطأ في إرسال التقرير:', error);
    Alert.alert('خطأ', 'حدث خطأ أثناء إرسال التقرير.');
  }
};




  

  const confirmReport = () => {
    setModalVisible(true);
  };
  
 const ReportModal = ({ modalVisible, setModalVisible, reportText, setReportText, handleReportSubmit }) => (
  <Modal
  animationType="slide"
  transparent={true}
  visible={modalVisible}
  onRequestClose={() => {
    setReportText(''); // قم بإعادة تعيين نص التقرير عند إغلاق الـ Modal
    setModalVisible(false);
  }}
>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.modalContainer}
    >
      <View style={styles.modalContentreport}>
        <Text style={styles.modalTitle}>Add Report</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.reportInput}
            placeholder="Enter report text here..."
            value={reportText}
            onChangeText={setReportText}
            multiline
            autoFocus
          />
          <View style={styles.buttonsContainer}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.iconButtonReport}>
              <Icon name="times" size={24} color="#F44336" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleReportSubmit} style={styles.iconButtonReport}>
              <Icon name="send" size={24} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);


  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.userInfo}>
          <Image
            style={styles.userImg}
            source={post.userimg ? { uri: post.userimg } : require('../../pic/avtar.png')}
            resizeMode="cover"
            onError={(error) => console.log('Image Load Error:', error)}
          />
          <View style={styles.userText}>
            <TouchableOpacity onPress={navigateToUserProfile}>
              <Text style={styles.userName}>{post.username}</Text>
              <Text style={styles.userName}>{post.category}</Text>
            </TouchableOpacity>
            <Text style={styles.postTime}>{new Date(post.timestamp).toLocaleString()}</Text>
          </View>
        </View>

        <Text style={styles.postTitle}>{post.title}</Text>
        {post.imageUrl && <Image source={{ uri: post.imageUrl }} style={styles.postImage} />}
        <Text style={styles.postContent}>{post.content}</Text>
        <View style={styles.separator}></View>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={toggleHeartColor} style={styles.iconButton}>
          <Icon name={likedByUser ? "heart" : "heart-o"} size={20} color={heartColor} />
            <Text style={styles.iconText}>{likesCount} likes</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowCommentsModal(true)} style={styles.iconButton}>
            <Icon name={showCommentsModal ? 'comment' : 'comment-o'} size={20} color={commentColor} />
            <Text style={styles.iconText}>{comments.length} comments</Text>
          </TouchableOpacity>

          {user.uid !== post.userId && (
      <TouchableOpacity onPress={confirmReport} style={styles.iconButton}>
        <Image
          source={require('../../pic/iconsPost/REPORT.png')} // Ensure the image path is correct
          style={styles.reportIcon}
        />
      </TouchableOpacity>
    )}
    <ReportModal
  modalVisible={modalVisible}
  setModalVisible={setModalVisible}
  reportText={reportText}
  setReportText={setReportText}
  handleReportSubmit={handleReportSubmit}
/>


          {user.uid === post.userId && (
            <TouchableOpacity onLongPress={confirmDelete} style={styles.iconButton}>
              <Icon name="trash" size={20} color="red" />
              <Text style={styles.iconText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Modal
  isVisible={showCommentsModal}
  onBackdropPress={() => setShowCommentsModal(false)}
  onSwipeComplete={() => setShowCommentsModal(false)}
  swipeDirection="down"
  style={styles.modal}
>
  <View style={styles.modalContent}>
    <FlatList
      data={comments}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity onLongPress={() => confirmDeleteComment(item.id, item.userId)}>
          <View style={styles.commentContainer}>
            <Image
              style={styles.commentUserImg}
              source={item.userImgUrl ? { uri: item.userImgUrl } : require('../../pic/avtar.png')}
              resizeMode="cover"
            />
            <View style={styles.commentTextContainer}>
              <Text style={styles.commentUsername}>{item.username}</Text>
              <Text style={styles.commentText}>{item.comment}</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
    <View style={styles.commentInputContainer}>
      <TextInput
        style={styles.commentInput}
        value={newComment}
        onChangeText={setNewComment}
        placeholder="Add a comment..."
      />
      <TouchableOpacity onPress={handleAddComment} style={styles.commentButton}>
        <Icon name="paper-plane" size={20} color="#8D493A" />
      </TouchableOpacity>
    </View>
    {/* Button to close the modal manually */}
    <TouchableOpacity 
      style={styles.closeButton} 
      onPress={() => setShowCommentsModal(false)}
    >
      <Text style={styles.closeButtonText}>Close</Text>
    </TouchableOpacity>
  </View>
</Modal>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#D0B8A8',
    flex: 1,
    padding: 10,
  },
  card: {
    backgroundColor: '#F8EDE3',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userText: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  postTime: {
    color: '#888',
    fontSize: 12,
  },
  postTitle: {
    fontSize: 16,
    marginBottom: 5,
  },
  postImage: {
    width: '100%',
    height: 500,
    borderRadius: 8,
    marginVertical: 10,
    resizeMode: 'cover', // Or 'contain' depending on your preference
  },
  postContent: {
    fontSize: 16,
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#D0B8A8',
    marginVertical: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  iconText: {
    marginLeft: 5,
    fontSize: 14,
  },
  reportIcon: {
    width: 20,
    height: 20,
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomColor: '#DFD3C3',
    borderBottomWidth: 1,
  },

  commentUserImg: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  commentTextContainer: {
    flex: 1,
  },
  commentUsername: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  commentText: {
    fontSize: 14,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    borderColor: '#8D493A',
    borderWidth: 1,
    borderRadius: 7,
    padding: 10,
    marginRight: 10,
  },
  commentButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#F8EDE3',
    backgroundColor: '#F8EDE3',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 20,
    height: '80%',
    justifyContent: 'space-between',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // خلفية مظللة
  },
  modalContentreport: {
    backgroundColor: '#F8F8F8',
    borderRadius: 15,
    padding: 20,
    width: '90%', // عرض أقل من الشاشة
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  inputContainer: {
    width: '100%',
    justifyContent: 'space-between', // لضبط الأزرار بشكل متباعد
    flexDirection: 'row', // لجعل الأزرار بجانب بعضها أفقياً
  },
  reportInput: {
    borderColor: '#8D493A',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#FFF',
    color: '#333',
    fontSize: 16,
    textAlignVertical: 'top', // لضبط النص في الأعلى
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    height: 100,
    width: '100%', // توسيع العرض ليكون بعرض الحاوية بالكامل
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center', // لجعل الحقل والأزرار في المنتصف
    flexDirection: 'column', // ترتيب عمودي للعناصر
  },
  buttonsContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between', // !توزيع الأزرار بالتساوي
    marginTop: 10, //! إضافة مسافة فوق الأزرار
    width: '99%', //! توسيع عرض الأزرار لتتناسب مع الحاوية
  },
  iconButtoniconButton: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1, // لضبط حجم الأزرار لتكون متساوية
  },
});

export default PostCard;
