import React, { useState } from 'react';
import { View, Button, Image } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const ImagePickerExample = () => {
  const [imageUri, setImageUri] = useState(null);

  // دالة لالتقاط صورة باستخدام الكاميرا
  const takePhoto = () => {
    const options = {
      mediaType: 'photo',
      saveToPhotos: true,
    };
    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  // دالة لاختيار صورة من المعرض
  const pickImageFromGallery = () => {
    const options = {
      mediaType: 'photo',
    };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={{ width: 200, height: 200, marginBottom: 20 }}
        />
      )}
      <Button title="التقاط صورة" onPress={takePhoto} />
      <Button title="اختر من المعرض" onPress={pickImageFromGallery} />
    </View>
  );
};

export default ImagePickerExample;
