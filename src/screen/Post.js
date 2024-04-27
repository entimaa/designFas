import { View, Text,Platform ,Image,Button,StyleSheet} from 'react-native'
import React,{useState} from 'react'
import  Icon from "react-native-vector-icons";
import {ref,uploadBytes,getDownloadURL} from 'firebase/storage';
import {storage} from '../../data/DataFirebase'
import * as ImagePicker from 'expo-image-picker';

const  Post= ()=> {

  const [image,setImage] = useState(null);
  const [downloadURL,setDownloadURL] = useState(null)

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4,3],//الفرف بين الارتفاع والعرض:
      quality:1

    })
    if(!result.cancelled){
      setImage(result.uri)
    }
  }
  const takeImage = async() => {
    ImagePicker.opencamera({})
    
  }
  const uploadImage = async() => {}
  return (
    <View>
      <Button title='pic an image fri=om gallery' onPress={pickImage} />
      <Button title='Take a Photo' onPress={takeImage} />
      {image && <Image source={{uri: image}} style={{width:200,higth:200}}/>}
      <Button title='Save'  onPress={uploadImage}/>
      {
        downloadURL && (
          <>
          <Image source={{uri :downloadURL}} style={{width:200,higth:200}}/>
          </>
        )
      }

    </View>
  )
}

export default Post;
