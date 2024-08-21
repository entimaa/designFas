// src/screen/navigation/AdminStack.js
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AdminHome from "../Admin/AdminHome";
import  AddCategory from "../Admin/AddCategory"; // تأكد من صحة المسار
import UsersCountScreen from "../Admin/UsersCountScreen"; // تأكد من صحة المسار
import ProductsScreen from "../Admin/ProductsScreen"; // تأكد من صحة المسار
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
        options={{ title: 'الإشعارات' }}
      />
      <Stack.Screen
        name="UsersCount"
        component={UsersCountScreen}
        options={{ title: 'عدد المستخدمين' }}
      />
      <Stack.Screen
        name="Products"
        component={ProductsScreen}
        options={{ title: 'إضافة المنتجات' }}
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
