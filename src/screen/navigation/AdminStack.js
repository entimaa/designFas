import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AdminHome from "../Admin/AdminHome";
import AddCategory from "../Admin/AddCategory";
import UsersCountScreen from "../Admin/UsersCountScreen";
import Report from "../Admin/Report";
import EditCategory from "../Admin/EditCategory";
const Stack = createStackNavigator();
const AdminStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AdminHome"
        component={AdminHome}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddCategory"
        component={AddCategory}
        options={{ title: "Add category" }}
      />
      <Stack.Screen
        name="UsersCount"
        component={UsersCountScreen}
        options={{ headerShown: false }} // Hide title screenn0--
      />
      <Stack.Screen
        name="Report"
        component={Report}
        options={{ title: " Report" }}
      />
      <Stack.Screen
        name="EditCategory"
        component={EditCategory}
        options={{ headerShown: true, title: "Edit Category" }}
      />
    </Stack.Navigator>
  );
};
export default AdminStack;
