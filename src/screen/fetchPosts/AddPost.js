import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  Alert,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { storage, db } from "../../../data/DataFirebase.js";
import { useAuth } from "../../context/AuthContext.js";
import { doc, setDoc, collection, onSnapshot } from "firebase/firestore";
import Icon from "react-native-vector-icons/FontAwesome";
import { Button } from "react-native-elements";

const AddPostComponent = ({ toggleModal }) => {
  const { user, userName, userType, userImgUrl } = useAuth();
  const [profileImage, setProfileImage] = useState(null);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedButton, setSelectedButton] = useState(null); 

  useEffect(() => {
    const fetchCategories = () => {
      try {
        const categoriesCollection = collection(db, "categories");
        const unsubscribe = onSnapshot(categoriesCollection, (snapshot) => {
          const categoriesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
          }));
          setCategories(categoriesData);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching categories:", error);
        Alert.alert(
          "Fetch Error",
          "Failed to fetch categories. Please try again later."
        );
      }
    };

    fetchCategories();
  }, []);

  const pickImage = async () => {
    setSelectedButton('pick'); // Set the selected button to 'pick'

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
    setSelectedButton(null); // Reset selected button
  };

  const takeImage = async () => {
    setSelectedButton('take'); // Set the selected button to 'take'
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
    setSelectedButton(null); // Reset selected button
  };

  const uploadImage = async () => {
    if (!image) {
      Alert.alert("No Image Selected", "Please select an image first.");
      return;
    }

    if (!category) {
      Alert.alert("Category Missing", "Please select a category.");
      return;
    }

    const uploadUri = image;
    let filename = uploadUri.substring(uploadUri.lastIndexOf("/") + 1);
    const ext = filename.split(".").pop();
    const name = filename.split(".").slice(0, -1).join(".");
    filename = name + Date.now() + "." + ext;

    setUploading(true);

    try {
      const response = await fetch(image);
      const blob = await response.blob();

      const storageRef = ref(storage, `posts/${filename}`);

      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress.toFixed());
        },
        (error) => {
          console.error(error);
          setUploading(false);
          Alert.alert(
            "Upload Error",
            "Failed to upload image. Please try again later."
          );
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setUploading(false);
          Alert.alert("Upload Success", "Image uploaded successfully!");

          if (user && user.uid) {
            try {
              const postRef = doc(collection(db, "postsDesigner"));
              await setDoc(postRef, {
                title: title,
                content: content,
                imageUrl: url,
                userId: user.uid,
                username: userName,
                timestamp: new Date().toISOString(),
                likes: 0,
                DisLike:0,
                comments: [],
                userimg: userImgUrl,
                category: category,
                color: color,
              });

              setImage(null);
              setTitle("");
              setContent("");
              setCategory("");
              setColor("");
              if (toggleModal) {
                toggleModal();
              }
            } catch (error) {
              console.error("Error adding document: ", error);
              Alert.alert(
                "Post Error",
                "Failed to create post. Please try again later."
              );
            }
          } else {
            Alert.alert("User Error", "User is not authenticated.");
          }
        }
      );
    } catch (error) {
      console.error("Upload Error: ", error);
      setUploading(false);
      Alert.alert(
        "Upload Error",
        "Failed to upload image. Please try again later."
      );
    }
  };

  const cancelImage = () => {
    setImage(null);
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const selectCategory = (selectedCategory) => {
    setCategory(selectedCategory);
    setShowOptions(false);
  };

  const handleColorChange = (text) => {
    setColor(text);
  };

  const renderContent = () => {
    return (
      <>
        {userType !== "Designer" ? (
          <Text style={styles.errorMessage}>
            Only Designers can post content.
          </Text>
        ) : (
          <>
            {image && (
              <Image
                source={{ uri: image }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
            {!image && profileImage && (
              <Image source={{ uri: profileImage }} style={styles.fullImage} />
            )}
            {image && (
              <>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.inputText}
                    placeholder="Title"
                    value={title}
                    onChangeText={setTitle}
                  />
                  <TextInput
                    style={styles.inputText}
                    placeholder="Content"
                    value={content}
                    onChangeText={setContent}
                  />
                </View>
                <TextInput
                  style={styles.inputFull}
                  placeholder="Color Name"
                  value={color}
                  onChangeText={handleColorChange}
                />
                <TouchableOpacity
                  onPress={toggleOptions}
                  style={styles.categoryInput}
                  activeOpacity={0.8}
                >
                  <Text style={styles.categoryText}>
                    Category: {category || "Select Category"}
                  </Text>
                  <Icon name="caret-down" size={20} color="#A67B5B" />
                </TouchableOpacity>
                {showOptions && (
                  <View style={styles.optionsContainer}>
                    <FlatList
                      data={categories}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          onPress={() => selectCategory(item.name)}
                          style={styles.option}
                        >
                          <Text style={styles.optionText}>{item.name}</Text>
                        </TouchableOpacity>
                      )}
                      style={styles.flatList}
                    />
                  </View>
                )}
                {uploading ? (
                  <ActivityIndicator
                    size="large"
                    color="#00ff00"
                    style={styles.activityIndicator}
                  />
                ) : (
                  <>
                    <Button
                      title="Upload Image"
                      onPress={uploadImage}
                      buttonStyle={styles.uploadButton}
                      titleStyle={styles.uploadButtonText}
                    />
                    <TouchableOpacity
                      onPress={cancelImage}
                      style={styles.closeButton}
                    >
                      <Icon name="times" size={25} color="#333" />
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
             {!image && (
             <View style={styles.buttonContainer}>
                <View style={styles.iconButtonContainer}>
                  <TouchableOpacity 
                    onPress={pickImage} 
                    style={[styles.iconButton, selectedButton === 'pick' && styles.selectedButton]}
                  >
                    <Icon name="photo" size={25} color={selectedButton === 'pick' ? "#000" : "#fff"} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={takeImage} 
                    style={[styles.iconButton, styles.iconButtonOverlap, selectedButton === 'take' && styles.selectedButton]}
                  >
                    <Icon name="camera" size={25} color={selectedButton === 'take' ? "#000" : "#fff"} />
                  </TouchableOpacity>
                </View>
             </View>
            )}
          </>
        )}
      </>
    );
  };
  

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.avoidingView}
      keyboardVerticalOffset={100}
    >
          <View style={styles.container}>
        {renderContent()}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#D0B8A8",
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  inputText: {
    flex: 1,
  
    marginRight: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#A67B5B",
    borderRadius: 4,
  },
  inputFull: {
    marginBottom: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#A67B5B",
    borderRadius: 4,
  },
  categoryInput: {
    marginBottom: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#A67B5B",
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryText: {
    color:'#3C4048',
    fontSize: 16,
  },
  optionsContainer: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#A67B5B",
    borderRadius: 4,
  },
  flatList: {
    maxHeight: 200,
  },
  option: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  optionText: {
    fontSize: 16,
  },
  fullImage: {
    width: "100%",
    height: 200,
    marginBottom: 12,
    borderRadius: 8,
    position: "relative", // Make sure the parent is relative
  },
  buttonContainer: {
    
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row', // Arrange buttons horizontally
  },
  iconButtonContainer: {
    position: 'relative', // Container to control the stacking of buttons
  },
  iconButton: {
   
    right:50,
    width: 150, // زيادة عرض الزر
    height: 150, // زيادة ارتفاع الزر
    borderRadius: 100, // نصف العرض والارتفاع لجعل الزر دائري
    backgroundColor: "#D0B8A8", // تغيير اللون الخلفي
    justifyContent: "center",
    alignItems: "center",
    elevation: 30,
    borderWidth : 1.5,
     borderColor: "#fff", 
     shadowColor: "#fff", // لون الظل على iOS
  
  },

  iconButtonOverlap: {
    position: 'absolute',
    left: 66, // Adjust to overlap the button below
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    marginTop: 10,
  },
  uploadButton: {
    backgroundColor: "#A67B5B",
    borderRadius: 20,
    marginVertical: 10,
    paddingVertical: 10, // Adjust vertical padding as needed
    paddingHorizontal: 60, // Adjust horizontal padding to reduce button width
    alignSelf: 'center', // Center the button horizontally
  },
  uploadButtonText: {
    fontSize: 16,
    color:"#fff"
  },
  closeButton: {
    position: "absolute",
    top: 1, 
    right: 10, 
    borderRadius: 50,
    padding: 10,
    zIndex: 1, 
  },
  activityIndicator: {
    marginVertical: 20,
  },
  errorMessage: {
    color: "red",
    marginVertical: 12,
    textAlign: "center",
  },
  avoidingView: {
    flex: 1,
  },
});



export default AddPostComponent;
