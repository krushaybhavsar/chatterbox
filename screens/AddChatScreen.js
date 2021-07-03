import React, { useLayoutEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button, Input } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../colors";
import { db } from "../firebase";
import { StatusBar } from "react-native";

const AddChatScreen = ({ navigation }) => {
  const [input, setInput] = useState("");

  const createChat = async () => {
    await db
      .collection("chats")
      .add({
        chatName: input,
      })
      .then(() => {
        navigation.goBack();
      })
      .catch((error) => alert(error));
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Add a new Chat",
      headerBackTitle: "Chats",
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light" backgroundColor="#2C6BED" />
      <View style={styles.inputContainer}>
        <Input
          placeholder="Enter a chat name"
          value={input}
          onChangeText={(text) => setInput(text)}
          leftIcon={
            <Ionicons name="chatbubbles-outline" size={24} color="black" />
          }
        />
      </View>
      <TouchableOpacity
        activeOpacity={0.5}
        style={styles.createButton}
        onPress={createChat}
        disabled={!input}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
          Create a New Chat
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "white",
  },
  inputContainer: { width: 300 },
  createButton: {
    width: 300,
    marginVertical: 10,
    backgroundColor: theme.primaryBlue,
    borderRadius: 10,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
});
