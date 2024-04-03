import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text, TouchableOpacity, StyleSheet, ActivityIndicator ,StatusBar,FlatList,ImageBackground} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePassword, getErrorText } from '../messegeErorr/errorMessage';//erroe:
import { styles } from '../styles/styles'; 


const LoginScreen = ({ navigation }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');
    setLoading(true);
    if (!validateEmail(email)) {
      setEmailError('Invalid email format');
      setTimeout(() => setEmailError(''), 3000); 
      setLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 6 characters long');
      setTimeout(() => setPasswordError(''), 3000); 
      setLoading(false);
      return;
    }

    try {
      await signIn(email, password);
    } catch (error) {
      const errorMessage = getErrorText(error.code);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  //image fashoin
  const data = [
    { id: 1, image: require('../pic/des1.png') },
    { id: 2, image: require('../pic/des3.png') },
    { id: 3, image: require('../pic/des1.png') },
    { id: 4, image: require('../pic/des4.png') },
    { id: 5, image: require('../pic/des5.png') },
    { id: 6, image: require('../pic/des6.png') },
  ];
  
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <ImageBackground
        source={item.image}
        style={styles.image}
      />
    </View>
  );
  return (
    <View style={styles.container}>
       <StatusBar hidden />
      <View style={styles.container}>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          renderItem={renderItem}
        />
      </View>
      <View style={{ width: '100%', height: '60%' , alignItems:'center'}}>
      <Text style={{fontSize: 24, justifyContent: 'space-between',fontWeight:'bold'}}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
    

      <Button   title="Login" onPress={handleLogin}
    color={'#584858'}
       disabled={loading} />
       
      <TouchableOpacity  onPress={handleRegister}>
        <Text style={styles.loginText}>
          Don't have an account? Register
        </Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color="#4CAF50" />}
    </View>
   </View>
   
  );
};



export default LoginScreen;
