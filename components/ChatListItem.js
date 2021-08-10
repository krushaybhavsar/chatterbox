import React, { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import { ListItem, Avatar } from "react-native-elements";
import { theme } from "../colors";
import { db } from "../firebase";

/********* FONT *********/
import * as Font from "expo-font";
import AppLoading from "expo-app-loading";
const fetchFont = () => {
  return Font.loadAsync({
    Merriweather: require("../assets/fonts/Merriweather/Merriweather-Bold.ttf"),
    Raleway: require("../assets/fonts/Raleway/Raleway-Regular.ttf"),
    RalewayBold: require("../assets/fonts/Raleway/Raleway-Bold.ttf"),
  });
};
/************************/

const ChatListItem = ({
  setSelectedChats,
  selectedChats,
  id,
  chatName,
  chatImage,
  enterChat,
}) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [fontLoaded, setFontLoaded] = useState(false);

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

  if (!fontLoaded) {
    return (
      <AppLoading
        startAsync={fetchFont}
        onError={() => console.log("Error loading fonts")}
        onFinish={() => {
          setFontLoaded(true);
        }}
      />
    );
  }

  return (
    <ListItem
      onPress={() => enterChat(id, chatName, chatImage)}
      onLongPress={() => setSelectedChats([...selectedChats, id])}
      key={id}
      bottomDivider
      activeOpacity={0.9}
      underlayColor={theme.primaryBlue}
      containerStyle={{
        backgroundColor: selectedChats.includes(id)
          ? theme.lightGreen
          : theme.lightWhite,
      }}
    >
      <Avatar
        rounded
        source={{
          uri: chatImage,
        }}
      />
      <ListItem.Content>
        <ListItem.Title
          style={styles.chatTitle}
          ellipsizeMode="tail"
          numberOfLines={1}
        >
          {chatName}
        </ListItem.Title>
        <ListItem.Subtitle
          style={styles.chatRecentMessage}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {chatMessages?.[0]?.displayName === undefined
            ? "Type the first message and get chatting!"
            : chatMessages?.[0]?.displayName +
              ": " +
              (chatMessages?.[0]?.type === "text"
                ? chatMessages?.[0]?.message
                : "Image 📷")}
        </ListItem.Subtitle>
      </ListItem.Content>
    </ListItem>
  );
};

export default ChatListItem;

const styles = StyleSheet.create({
  chatTitle: {
    fontFamily: "RalewayBold",
    paddingRight: 5,
  },
  chatRecentMessage: {
    fontFamily: "Raleway",
    paddingRight: 10,
  },
  topBarIconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 80,
    marginRight: 20,
  },
});
