import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import AuthStack from "./src/screen/navigation/AuthStack";
import Home from "./src/screen/navigation/AppStack"; // Ensure the path is correct
import LoginScreen from "./src/screen/LoginScreen"; // Ensure the path is correct

const Stack = createStackNavigator();

const AppNavigation = () => {
  const { user } = useAuth();
  return (
    <Stack.Navigator>
      {user ? (
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="auth"
          component={AuthStack}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <AuthProvider>
        <AppNavigation />
      </AuthProvider>
    </NavigationContainer>
  );
};

export default App;
