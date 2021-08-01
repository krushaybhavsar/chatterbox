import React from "react";
import { StyleSheet, Text, View } from "react-native";

const LoadingScreen = () => {
  return (
    <View>
      <Text
        style={{
          color: "black",
          fontSize: 28,
          fontWeight: "bold",
        }}
      >
        {"Loading..."}
      </Text>
    </View>
  );
};

export default LoadingScreen;

const styles = StyleSheet.create({});
