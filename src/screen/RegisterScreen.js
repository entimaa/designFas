
import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Alert,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import {
  validateEmail,
  validatePassword,
  getErrorText,
  InfoUser,
} from "../messegeErorr/errorMessage";
import { styles } from "../styles/styles";
import { set } from "firebase/database";

const RegisterScreen = ({ navigation }) => {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState('');
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [selectedCategoryNameError,setSelectedCategoryNameError]=useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState(""); //save name about id
  const [loading, setLoading] = useState(false);

  const category = [//type person client or designer
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
      setNameError("Name do not match");
      setTimeout(() => setNameError(""), 3000);
      return;
    }
   


    try {
      setLoading(true);
      console.log(name , selectedCategoryName ,  email , password);
      
      await signUp(email, password, name, selectedCategoryName);
       // Pass selected category name to signUp function
      setLoading(false);
      
    } catch (error) {
      setLoading(false);
      const errorCode = error.code;
      const errorMessage = getErrorText(errorCode);
      console.log(errorCode)
      
      Alert.alert('Error', errorMessage);
    }
  };

  const handleSelectionRadio = (categoryName) => {
    console.log(categoryName);
     setSelectedCategoryName(categoryName); // Update selected category name when radio button is pressed
   };
 

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
     
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
           {confirmPasswordError ? (
        <Text style={styles.errorText}>{confirmPasswordError}</Text>
      ) : null}
      <View style={styles.radioMain}>
        {category.map((item, index) => (
          <TouchableOpacity onPress={() => handleSelectionRadio(item.name)} key={index}>
            <View style={styles.radioMain}>
              <View style={styles.radio}>
                {selectedCategoryName === item.name ? <View style={styles.radioDot}></View> : null}
              </View>
              <Text style={styles.radioText}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.loginButton}>
        <Button
          title="Register"
          color={"#fff"}
          onPress={handleRegister}
          disabled={loading}
        />
      </View>
      <TouchableOpacity onPress={handleLogin}>
        <Text style={styles.loginText}>
          Already have an account? Login here
        </Text>
      </TouchableOpacity>
    </View>
  );
};


export default RegisterScreen;
