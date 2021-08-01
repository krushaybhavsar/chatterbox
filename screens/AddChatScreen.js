import React, { useLayoutEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button, Input } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../colors";
import { db, auth } from "../firebase";
import { StatusBar } from "react-native";

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

const AddChatScreen = ({ navigation }) => {
  const [input, setInput] = useState("");
  const [participantEmailInput, setParticipantEmailInput] = useState("");
  const [fontLoaded, setFontLoaded] = useState(false);

  const createChat = async () => {
    var participantUID;
    if (participantEmailInput.trim() !== auth.currentUser.email) {
      await db
        .collection("users")
        .doc(participantEmailInput.trim())
        .get()
        .then((doc) => {
          if (doc.exists) {
            participantUID = doc.data().registeredUserID;
            db.collection("chats")
              .add({
                chatName: input,
                chatSize: 0,
                participants: [auth.currentUser.uid, participantUID],
              })
              .then(() => {
                navigation.goBack();
              })
              .catch((error) => alert(error));
          } else {
            alert("No such registered user!");
          }
        })
        .catch((error) => {
          console.log("Error getting document:", error);
        });
    } else {
      alert(
        "You can't chat with yourself! Don't worry though. If you're lonely, Chatterbox is here for you."
      );
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Add a new Chat",
      headerBackTitle: "Chats",
      headerTitleStyle: {
        color: theme.primaryBlue,
        fontFamily: "RalewayBold",
      },
    });
  }, [navigation]);

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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.lightWhite} />
      <View style={styles.inputContainer}>
        <Input
          inputStyle={{ fontFamily: "Raleway" }}
          placeholder="Enter a chat name"
          value={input}
          onChangeText={(text) => setInput(text)}
          leftIcon={
            <Ionicons name="chatbubbles-outline" size={24} color="black" />
          }
        />
        <Input
          inputStyle={{ fontFamily: "Raleway" }}
          placeholder="Invite a participant"
          value={participantEmailInput}
          onChangeText={(text) => setParticipantEmailInput(text)}
          leftIcon={<Ionicons name="people-outline" size={24} color="black" />}
        />
      </View>
      <TouchableOpacity
        activeOpacity={0.5}
        style={styles.createButton}
        onPress={createChat}
        disabled={!input}
      >
        <Text
          style={{
            color: theme.lightWhite,
            fontSize: 16,
            fontFamily: "RalewayBold",
          }}
        >
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
    backgroundColor: theme.lightWhite,
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
