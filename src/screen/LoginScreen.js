import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  Alert,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  ImageBackground,
  Animated,
  ScrollView,
  Image,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import {
  validateEmail,
  validatePassword,
  getErrorText,
} from "../messegeErorr/errorMessage";
import { styles } from "../styles/styles";
import { useNavigation } from "@react-navigation/native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../data/DataFirebase";
const LoginScreen = () => {
  const navigation = useNavigation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // !State showww password

  const handleLogin = async () => {
    setEmailError("");
    setPasswordError("");
    setLoading(true);

    if (!validateEmail(email)) {
      setEmailError("Invalid email format");
      setLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }
    try {
      const { isBlocked } = await signIn(email, password); // ! if the user alrdy boloked .. TRUE..
      //! in screen AUTHCONTAXT TKAE THE USER IN SCREEN lOGIN SHOW THE MESSGE
      if (isBlocked) {
        Alert.alert("Account Blocked", "Your account has been blocked.");
      }
    } catch (error) {
      const errorMessage = getErrorText(error.code);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate("Register");
  };
  const handleForgotPassword = () => {
    if (email === "") {
      Alert.alert("Error", "Please enter your email to reset password.");
      return;
    }
    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert("Success", "Password reset email sent!");
      })
      .catch((error) => {
        const errorMessage = getErrorText(error.code);
        Alert.alert("Error", errorMessage);
      });
  };

  const data = [
    { id: 1, image: require("../pic/men.jpg") },
    { id: 2, image: require("../pic/bacground1.jpg") },
    { id: 3, image: require("../pic/bacground2.jpg") },
  ];
  const X = useRef(new Animated.Value(0)).current;

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Animated.FlatList
        data={data}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: X } } }], //! contentOffset هذه القيمة لتطبيق تأثيرات متحركة أخرى مثل تحريك الصور أو تغيير حجمها
          { useNativeDriver: true }
        )}
        keyExtractor={(item) => item.id.toString()}
        horizontal //* אופקית
        pagingEnabled //*התמונה מוצגת במלואה לפני המעבר לתמונה הבאה
        renderItem={({ item }) => (
          <View style={styles.imageContainer}>
            <ImageBackground source={item.image} style={styles.image} />
          </View>
        )}
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={styles.formContainer}
      >
        <Text style={styles.title}>DFASHOIN</Text>
        <Text style={styles.inputLabel}> Login to your Account</Text>
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#aaa"
          />
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}
        </View>
        <View style={styles.inputGroup}>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword} // 
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Image
                source={
                  showPassword ? require("../pic/open_eye.png"): require("../pic/eys.png")
                }style={styles.eyeImage}/>
            </TouchableOpacity>
          </View>
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.loginButtonCustom}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonTextC}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.loginText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRegister}>
          <Text style={styles.loginText}>Don't have an account? Register</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="#4CAF50" />}
      </ScrollView>
    </View>
  );
};

export default LoginScreen;
