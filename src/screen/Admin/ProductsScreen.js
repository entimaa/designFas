// src/screen/Admin/ProductsScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, SafeAreaView } from "react-native";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../data/DataFirebase";

const ProductsScreen = () => {
  const [productName, setProductName] = useState("");

  const handleAddProduct = async () => {
    try {
      const productId = Date.now().toString(); // أو استخدم ID فريد آخر
      await setDoc(doc(db, 'products', productId), { name: productName });
      setProductName(""); // إعادة تعيين الحقل
      alert("تم إضافة المنتج بنجاح!");
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  return (
    <Text>gg</Text>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    marginBottom: 16,
  },
});

export default ProductsScreen;
