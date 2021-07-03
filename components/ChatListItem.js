import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { ListItem, Avatar } from "react-native-elements";
import { theme } from "../colors";
import { db } from "../firebase";

const ChatListItem = ({ id, chatName, enterChat }) => {
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    const unsubscribe = db
      .collection("chats")
      .doc(id)
      .collection("messages")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) =>
        setChatMessages(snapshot.docs.map((doc) => doc.data()))
      );

    return unsubscribe;
  }, []);

  return (
    <ListItem
      onPress={() => enterChat(id, chatName)}
      key={id}
      bottomDivider
      activeOpacity={0.9}
      underlayColor={theme.primaryBlue}
    >
      <Avatar
        rounded
        source={{
          uri:
            chatMessages?.[0]?.photoURL ||
            "https://firebasestorage.googleapis.com/v0/b/chatterbox-925c4.appspot.com/o/profile_placeholder.png?alt=media&token=9481124e-6d5c-406e-9a99-5b4013da7ff9",
        }}
      />
      <ListItem.Content>
        <ListItem.Title style={styles.chatTitle}>{chatName}</ListItem.Title>
        <ListItem.Subtitle
          style={styles.chatRecentMessage}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {chatMessages?.[0]?.displayName + ": " === "undefined: "
            ? "Type the first message and get chatting!"
            : chatMessages?.[0]?.displayName + ": "}
          {chatMessages?.[0]?.message}
        </ListItem.Subtitle>
      </ListItem.Content>
    </ListItem>
  );
};

export default ChatListItem;

const styles = StyleSheet.create({
  chatTitle: {
    fontWeight: "bold",
  },
  chatRecentMessage: {
    paddingRight: 10,
  },
});
