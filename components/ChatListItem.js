import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ListItem, Avatar } from "react-native-elements";

const ChatListItem = ({ id, chatName, enterChat }) => {
  return (
    <ListItem>
      <Avatar rounded source={require("../assets/profile_placeholder.png")} />
      <ListItem.Content>
        <ListItem.Title style={styles.chatTitle}>Elon Musk</ListItem.Title>
        <ListItem.Subtitle
          style={styles.chatRecentMessage}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          This is a test message. I am trying to see if this text is too long.
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
