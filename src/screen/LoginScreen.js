import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Button,
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

const { width: screenWidth } = Dimensions.get('window');

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
      navigation.navigate('Main');
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


  const data = [
     { id: 5, image: require('../pic/des3.png') },
    
    { id: 2, image: require('../pic/des4.png') },
   
    { id: 6, image: require('../pic/des6.png') },
    { id: 4, image: require('../pic/des2.png') },
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
        <Text style={{ fontSize: 24, justifyContent: 'space-between', fontWeight: 'bold' }}>
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
        <Button title="Login" onPress={handleLogin} color={'#000'} disabled={loading} />
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
