import React, { useState } from "react";
import {
  View,
  TextInput,
  Alert,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import {
  validateEmail,
  validatePassword,
  InfoUser,
} from "../messegeErorr/errorMessage";
import { Button, Icon } from "react-native-elements";

const RegisterScreen = ({ navigation }) => {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  // State to  password
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);

  const category = [
    { id: 1, name: "Designer" },
    { id: 2, name: "Client" },
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
      setPasswordError("Password must be at least 6 characters long");
      setTimeout(() => setPasswordError(""), 3000);
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      setTimeout(() => setConfirmPasswordError(""), 3000);
      return;
    }
    if (!selectedCategoryName) {
      Alert.alert("Selection Required", "Please select-  Designer or Client.");
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
      Alert.alert("Error", errorMessage);
    }
  };

  const handleSelectionRadio = (categoryName) => {
    setSelectedCategoryName(categoryName);
  };

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <ImageBackground
      source={require("../pic/women5.jpeg")}
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

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={showPassword} />
          <Icon
            name={showPassword ? "eye-off" : "eye"}
            type="ionicon"
            onPress={() => setShowPassword(!showPassword)}
            containerStyle={styles.iconStyle}/>
        </View>
        {passwordError ? (
          <Text style={styles.errorText}>{passwordError}</Text>) : null}

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={showConfirmPassword}
          />
          <Icon
            name={showConfirmPassword ? "eye-off" : "eye"}
            type="ionicon"
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            containerStyle={styles.iconStyle}
          />
        </View>
        {confirmPasswordError ? (
          <Text style={styles.errorText}>{confirmPasswordError}</Text>
        ) : null}

        <View style={styles.radioMain}>
          {category.map((item, index) => (
            <TouchableOpacity
              onPress={() => handleSelectionRadio(item.name)}
              key={index}>
              <View style={styles.radioMain}>
                <View style={styles.radio}>
                  {selectedCategoryName === item.name ? (
                    <View style={styles.radioDot}></View>) : null}
                </View>
                <Text style={styles.radioText}>{item.name} </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.RigButton}>
          <Button title="Register" buttonStyle={styles.buttonStyle} titleStyle={styles.buttonTitleStyle}
            onPress={handleRegister}
            loading={loading} />
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
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    width: "90%",
    padding: 30,
    backgroundColor: "rgba(255, 255, 255, 0.7)",//!רקע לבן שקוף
    borderRadius: 20,
    alignItems: "center",//!ALL TEXTT CENTERR register  and type radio client or designer 
    elevation: 8,//!تضليل הוסף צללית שחורה
  },
  title: {//*rigester
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#603F26",//brownn
  },
  input: {
    height: 50,
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 12,
    backgroundColor: "#fff",//!!bacgrout the INPUTTTEXTT whiteee
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  passwordContainer: {
    flexDirection: "row",//!eeyy
    alignItems: "center",
    marginBottom: 12,
  },
  iconStyle: {//!eyyy
    position: "absolute",
    right: 10,
  },
  radioMain: {
    flexDirection: "row",
    marginBottom: 20,//bboton اسفل
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderColor: "#333",
    borderWidth: 2,
    justifyContent: "center",// the dott in radio 
    alignItems: "center",//anddd dott 
    marginRight: 10,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#333",
  },
  radioText: {
    fontSize: 18,
    color: "#333",
  },
  RigButton: {
    width: "100%",
    marginBottom: 20,
  },
  buttonStyle: {//!REIGESTER
    backgroundColor: "#603F26",
    borderRadius: 25,
    paddingVertical: 12,
  },
  buttonTitleStyle: {//TEXTT IN BUTTON
    fontSize: 18,
    fontWeight: "bold",
  },
  loginText: {
    fontSize: 16,
    color: "#007bff",
  },
});
export default RegisterScreen;
