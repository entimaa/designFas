import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Alert,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  FlatList,
  ImageBackground,
  Animated,
  Dimensions,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePassword, getErrorText } from '../messegeErorr/errorMessage';
import { styles } from '../styles/styles';
import { useNavigation } from '@react-navigation/native';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../../data/DataFirebase';

const { width: screenWidth } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation();
  const { signIn, isBlocked } = useAuth();
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
      setLoading(false);
      return;
    }
  
    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { isBlocked } = await signIn(email, password);

      if (isBlocked) {
        Alert.alert('Account Blocked', 'Your account has been blocked.');
      } else {
        // السماح بالدخول إذا لم يكن محظورًا
      }
    } catch (error) {
      console.error("Error signing in:", error);
      const errorMessage = getErrorText(error.code);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleForgotPassword = () => {
    if (email === '') {
      Alert.alert('Error', 'Please enter your email to reset password.');
      return;
    }
    
    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert('Success', 'Password reset email sent!');
      })
      .catch(error => {
        Alert.alert('Error', error.message);
      });
  };

  const data = [
    { id: 2, image: require('../pic/women2.jpeg') },

    { id: 5, image: require('../pic/man.jpeg') },
    { id: 6, image: require('../pic/women4.jpeg') },
    { id: 4, image: require('../pic/women1.jpeg') },
  ];

  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={StyleSheet.absoluteFillObject}>
        {data.map((item, index) => {
          const inputRange = [
            (index - 1) * screenWidth,
            index * screenWidth,
            (index + 1) * screenWidth,
          ];
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0, 3, 0],
          });
          return (
            <Animated.Image
              key={`image-${index}`}
              source={item.image}
              style={[StyleSheet.absoluteFill, { opacity }]}
              blurRadius={67}
              borderRadius={10}
            />
          );
        })}
      </View>
      <View style={styles.overlay} />
      <Animated.FlatList
        data={data}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        renderItem={({ item }) => (
          <View style={styles.item}>
            <ImageBackground
              source={item.image}
              style={[
                styles.image,
                { borderWidth: 0.7, borderColor: 'white', borderRadius: 24 },
              ]}
              borderRadius={20}
            />
          </View>
        )}
      />

      <View style={{ width: '100%', height: '60%', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, justifyContent: 'space-between', fontWeight: 'bold',color:'#000' }}>
          Login
        </Text>
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

        {/* زر تسجيل الدخول المعدل */}
        <TouchableOpacity
          style={styles.loginButtonCustom}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonTextCustom}>Login</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.loginText}>Forgot Password?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleRegister}>
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
