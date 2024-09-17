import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, FlatList, TextInput ,TouchableWithoutFeedback,KeyboardAvoidingView,Platform} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, deleteDoc ,getFirestore,collection,addDoc,setDoc} from 'firebase/firestore';
import { db } from '../../../data/DataFirebase'; // Adjust the import path as necessary
import { useAuth } from '../../context/AuthContext'; // Import your authentication context
import Icon from 'react-native-vector-icons/FontAwesome';
import Modal from 'react-native-modal';
import ReportModal from './ReportModal';
const PostCard = ({ post, onPostDelete }) => {
  const [heartColor, setHeartColor] = useState('#000');
  const [dislikeColor, setDislikeColor] = useState('#000');
  const [commentColor, setCommentColor] = useState('#000');
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [dislikesCount, setDislikesCount] = useState(post.dislikesCount || 0);
  const [likedByUser, setLikedByUser] = useState(false);
  const [dislikedByUser, setDislikedByUser] = useState(false);
  const [reportCount, setReportCount] = useState(post.reportCount || 0);
  const [reportedByUser, setReportedByUser] = useState(false);
  const [reportComment, setReportComment] = useState('');
  const [color, setColor] = useState('#FFFFFF'); // قيمة اللون الافتراضية

  // ? report commett***
  const [modalVisible, setModalVisible] = useState(false);
const [reportText, setReportText] = useState('');
const [isInputVisible, setIsInputVisible] = useState(false);

  const navigation = useNavigation();
  const { user, userName, userImgUrl } = useAuth();

  useEffect(() => {

    const postRef = doc(db, 'postsDesigner', post.id);
    const unsubscribe = onSnapshot(postRef, (doc) => {
      const postData = doc.data();
      setComments(postData.comments || []);
      setLikesCount(postData.likesCount || 0);
      setReportCount(postData.reportCount || 0);

      if (postData.color) {
        setColor(postData.color);
      }

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

  const HeartColor = async () => {
    const postRef = doc(db, 'postsDesigner', post.id);
    try {
      if (likedByUser) {
        // Remove like
        await updateDoc(postRef, {
          likes: arrayRemove(user.uid),
          likesCount: likesCount - 1,
        });
        setLikedByUser(false);
        setLikesCount(likesCount - 1);
        setHeartColor('#000');
      } else {
        if (dislikedByUser) {
          // Remove dislike and add like
          await updateDoc(postRef, {
            dislikes: arrayRemove(user.uid),
            dislikesCount: dislikesCount - 1,
            likes: arrayUnion(user.uid),
            likesCount: likesCount + 1,
          });
          setDislikedByUser(false);
          setDislikesCount(dislikesCount - 1);
          setLikedByUser(true);
          setLikesCount(likesCount + 1);
          setHeartColor('red');
          setDislikeColor('#000');
        } else {
          // Add like
          await updateDoc(postRef, {
            likes: arrayUnion(user.uid),
            likesCount: likesCount + 1,
          });
          setLikedByUser(true);
          setLikesCount(likesCount + 1);
          setHeartColor('red');
        }
      }
    } catch (error) {
      console.error('Error updating likes:', error);
      Alert.alert('Error', 'Failed to update likes.');
    }
  };
  
  const DislikeColor = async () => {
    const postRef = doc(db, 'postsDesigner', post.id);
  
    try {
      if (dislikedByUser) {
        // Remove dislike
        await updateDoc(postRef, {
          dislikes: arrayRemove(user.uid),
          dislikesCount: dislikesCount - 1,
        });
        setDislikedByUser(false);
        setDislikesCount(dislikesCount - 1);
        setDislikeColor('#000');
      } else {
        if (likedByUser) {
          // Remove like and add dislike
          await updateDoc(postRef, {
            likes: arrayRemove(user.uid),
            likesCount: likesCount - 1,
            dislikes: arrayUnion(user.uid),
            dislikesCount: dislikesCount + 1,
          });
          setLikedByUser(false);
          setLikesCount(likesCount - 1);
          setDislikedByUser(true);
          setDislikesCount(dislikesCount + 1);
          setHeartColor('#000');
          setDislikeColor('blue');
        } else {
          // Add dislike
          await updateDoc(postRef, {
            dislikes: arrayUnion(user.uid),
            dislikesCount: dislikesCount + 1,
          });
          setDislikedByUser(true);
          setDislikesCount(dislikesCount + 1);
          setDislikeColor('blue');
        }
      }
    } catch (error) {
      console.error('Error updating dislikes:', error);
      Alert.alert('Error', 'Failed to update dislikes.');
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
      userImgUrl: userImgUrl || null,
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
     return null ;
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




  const confirmReport = () => {
    setModalVisible(true);
  };

  const handleReportSubmit = async () => {
    if (!reportText.trim()) {
      Alert.alert('Alert', 'Please enter the report text.');
      return;
    }

    if (!post.id || !post.userId || !post.username || !user.uid) {
      Alert.alert('Error', 'Missing data. Please check all fields.');
      return;
    }

    try {
      const reportRef = doc(db, 'reports', post.id);
      const reportData = {
        reportTexts: arrayUnion(reportText.trim()),
        reportedUsers: arrayUnion(user.uid),
        reportDetails: arrayUnion({
          reportText: reportText.trim(),
          reportedBy: user.uid || 'unknown',
          reportedByName: userName || 'unknown',
          postId: post.id || 'unknown',
          reportedTo: post.userId || 'unknown',
          reportedToName: post.username || 'unknown',
          postTitle: post.title || 'not available',
          postImageUrl: post.imageUrl || 'unknown',
          timestamp: new Date(),
        }),
      };

      await setDoc(reportRef, reportData, { merge: true });

      Alert.alert('Success', 'Your report has been submitted successfully.');
      setReportText('');
      setModalVisible(false); // Close the modal after submission
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'An error occurred while submitting the report.');
    }
  };
  
 
  

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
            
          <View style={styles.postContainer}>
  {user.uid !== post.userId && (
    <TouchableOpacity onPress={confirmReport} style={styles.reportIcon}>
      <Image
        source={require('../../pic/iconsPost/REPORT.png')}
        style={{ width: '100%', height: '100%' }} // استخدام نسبة العرض والارتفاع لضمان حجم الأيقونة
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

  {/* باقي محتوى الكارد هنا */}
</View>

            <TouchableOpacity onPress={navigateToUserProfile}>
              <Text style={styles.userName}>{post.username}</Text>
              <Text style={styles.userNameCategory}>{post.category} {post .color}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {post.title ? <Text style={styles.postTitle}>{post.title}</Text> : null}
        {post.content ? <Text style={styles.postContent}>{post.content}</Text> : null}

        {post.imageUrl && <Image source={{ uri: post.imageUrl }} style={styles.postImage} />}
        <Text style={styles.postTime}>{new Date(post.timestamp).toLocaleString()}</Text>
        <View style={styles.separator}></View>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={HeartColor} style={styles.iconButton}>
          <Icon name={likedByUser ? "heart" : "heart-o"} size={20} color={heartColor} />
            <Text style={styles.iconText}>{likesCount} likes</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={DislikeColor} style={styles.iconButton}>
        <Icon name={dislikedByUser ? "thumbs-down" : "thumbs-o-down"} size={20} color={dislikeColor} />
        <Text style={styles.iconText}>{dislikesCount}</Text>
      </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowCommentsModal(true)} style={styles.iconButton}>
            <Icon name={showCommentsModal ? 'comment' : 'comment-o'} size={20} color={commentColor} />
            <Text style={styles.iconText}>{comments.length} comments</Text>
          </TouchableOpacity>

          
   

    

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
    padding: 10,//!size all covv
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
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  
  userImg: {//!img user profile 
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userText: {
    flex: 1,
    top:1
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 15,
  },

  userNameCategory:{
    fontSize: 15,
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
    height: 450,
    borderRadius: 8,
    marginVertical: 10,
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
    alignItems: 'center', //
  },
  iconButton: {
    flexDirection: 'row',
    //lignItems: 'stretch',
  },
  iconText: {
    marginLeft: 5,
    fontSize: 14,
  },
  iconWrapper: {
    left:37
  },
  reportIcon: {
    position: 'absolute', 
    top: 0, 
    right: 0, // Adjusts the icon to be on the top-right corner
    width: 20,
    height: 20,
    zIndex: 1, // Ensures the icon is above other content
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
  modal: {//! show the mosle comments in end screenn 
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#F8EDE3',
   // backgroundColor: '#F8EDE3',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 20,
    height: '80%',
    justifyContent: 'space-between',
  },
  
});

export default PostCard;

