import React, { useState } from "react";
import {
  View,
  TextInput,
  Alert,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground
} from "react-native";
import { useAuth } from "../context/AuthContext";
import {
  validateEmail,
  validatePassword,
  getErrorText,
  InfoUser,
} from "../messegeErorr/errorMessage";
import { Button } from 'react-native-elements';
import LottieView from 'lottie-react-native'; // Import Lottie

const RegisterScreen = ({ navigation }) => {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState('');
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState(""); //save name about id
  const [loading, setLoading] = useState(false);

  const category = [
    {
      id: 1,
      name: 'Designer'
    },
    {
      id: 2,
      name: 'Client'
    }
  ];

  const handleRegister = async () => {
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setNameError("");

    if (!validateEmail(email)) {
      setEmailError("Invalid email format");
      setTimeout(() => setEmailError(""), 3000);
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 6 characters long');
      setTimeout(() => setPasswordError(''), 3000); 
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      setTimeout(() => setConfirmPasswordError(''), 3000); 
      return;
    }

    if (!InfoUser(name)) {
      setNameError("Name does not match");
      setTimeout(() => setNameError(""), 3000);
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password, name, selectedCategoryName);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      const errorCode = error.code;
      const errorMessage = getErrorText(errorCode);
      Alert.alert('Error', errorMessage);
    }
  };

  const handleSelectionRadio = (categoryName) => {
    setSelectedCategoryName(categoryName); // Update selected category name when radio button is pressed
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <ImageBackground 
      source={require('../pic/FsH.png')} // Add a background image related to fashion
      style={styles.container}
    >
      <View style={styles.overlay}>
       
        <Text style={styles.title}>Register</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

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

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

        <View style={styles.radioMain}>
          {category.map((item, index) => (
            <TouchableOpacity onPress={() => handleSelectionRadio(item.name)} key={index}>
              <View style={styles.radioMain}>
                <View style={styles.radio}>
                  {selectedCategoryName === item.name ? <View style={styles.radioDot}></View> : null}
                </View>
                <Text style={styles.radioText}>{item.name}  </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.loginButton}>
          <Button
            title="Register"
            buttonStyle={styles.buttonStyle}
            titleStyle={styles.buttonTitleStyle}
            onPress={handleRegister}
            loading={loading}
          />
        </View>

        <TouchableOpacity onPress={handleLogin}>
          <Text style={styles.loginText}>
            Already have an account? Login here
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    width: '90%',
    padding: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white background
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 2,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  radioMain: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderColor: '#333',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
    
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#333',
  },
  radioText: {
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    width: '100%',
    marginBottom: 20,
  },
  buttonStyle: {
    backgroundColor: '#584858',
    borderRadius: 18,
  },
  buttonTitleStyle: {
    fontSize: 18,
  },
  loginText: {
    fontSize: 16,
    color: '#007bff',
  },
  animation: {
    width: 150,
    height: 150,
    marginBottom: 20,
  }
});

export default RegisterScreen;
