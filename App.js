

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import AuthStack from "./src/screen/navigation/AuthStack";
import MainStack from "./src/screen/navigation/AppStack";
import AdminStack from "./src/screen/navigation/AdminStack"; 

const Stack = createStackNavigator();

const AppNavigation = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="auth"
          component={AuthStack}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    );
  }

  // !!تحقق من ID المستخدم وتوجيهه بناءً على ذلك
  const isAdmin = user.uid === "FMELrIlq9sMB1Uk1x8V1GskOU8y2";

  return (
    <Stack.Navigator>
      {isAdmin ? (
        <Stack.Screen
          name="Admin"
          component={AdminStack}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="Home"
          component={MainStack}
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
