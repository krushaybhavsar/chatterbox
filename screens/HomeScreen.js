import React, { useState, useLayoutEffect, useEffect } from "react";
import {
  StatusBar,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from "react-native";
import { Avatar } from "react-native-elements";
import { theme } from "../colors";
import ChatListItem from "../components/ChatListItem";
import { auth, db } from "../firebase";
import { Ionicons, Feather } from "@expo/vector-icons";
import NoChatsSVG from "../assets/no-groupchats.svg";
import Toast from "react-native-simple-toast";
import firebase from "firebase";

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

const HomeScreen = ({ navigation }) => {
  const defaultGCImage =
    "https://firebasestorage.googleapis.com/v0/b/chatterbox-925c4.appspot.com/o/gc_placeholder.png?alt=media&token=d1716687-1abf-408c-b2e1-8a46343af4b5";
  const [chats, setChats] = useState([]);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [selectedChats, setSelectedChats] = useState([]);

  const signOutUser = () => {
    auth.signOut().then(() => {
      navigation.replace("Login");
    });
  };

  useEffect(() => {
    const unsubscribe = db.collection("chats").onSnapshot((snapshot) =>
      setChats(
        snapshot.docs
          .map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }))
          .filter((chat) =>
            chat["data"]["participants"].includes(auth.currentUser.uid)
          )
      )
    );
    return unsubscribe;
  }, []);

  useLayoutEffect(() => {
    if (selectedChats.length === 0) {
      navigation.setOptions({
        title: "Chatterbox",
        headerStyle: {
          backgroundColor: theme.lightWhite,
        },
        headerTitleStyle: {
          color: theme.primaryBlue,
          fontFamily: "RalewayBold",
          textAlign: "center",
        },
        headerTintColor: theme.primaryBlue,
        headerLeft: () => (
          <View style={styles.profileIconContainer}>
            <TouchableOpacity activeOpacity={0.5} onPress={signOutUser}>
              <Avatar rounded source={{ uri: auth?.currentUser?.photoURL }} />
            </TouchableOpacity>
          </View>
        ),
        headerRight: () => (
          <View style={styles.topBarIconContainer1}>
            <TouchableOpacity activeOpacity={0.3}>
              <Ionicons name="search" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("AddChat")}
              activeOpacity={0.3}
            >
              <Ionicons name="ios-add" size={34} color="black" />
            </TouchableOpacity>
          </View>
        ),
      });
    } else {
      navigation.setOptions({
        title: "Edit Chats",
        headerStyle: {
          backgroundColor: theme.lightWhite,
        },
        headerTitleStyle: {
          color: theme.primaryBlue,
          fontFamily: "RalewayBold",
          textAlign: "center",
        },
        headerTintColor: theme.primaryBlue,
        headerLeft: () => (
          <View style={{ marginLeft: 20 }}>
            <TouchableOpacity
              activeOpacity={0.3}
              onPress={() => setSelectedChats([])}
            >
              <Feather name="x" size={28} color="black" />
            </TouchableOpacity>
          </View>
        ),
        headerRight: () =>
          selectedChats.length === 1 ? (
            <View style={styles.topBarIconContainer1}>
              <TouchableOpacity activeOpacity={0.3}>
                <Feather name="edit" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.3}
                onPress={() => deleteSelectedChats()}
              >
                <Feather name="trash-2" size={24} color="black" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.topBarIconContainer2}>
              <TouchableOpacity
                activeOpacity={0.3}
                onPress={async () => await deleteSelectedChats()}
              >
                <Feather name="trash-2" size={24} color="black" />
              </TouchableOpacity>
            </View>
          ),
      });
    }
  }, [navigation, selectedChats]);

  const deleteSelectedChats = async () => {
    var participants = [];
    selectedChats.forEach((chat) => {
      db.collection("chats")
        .doc(chat)
        .get()
        .then((doc) => {
          participants = doc.data().participants;
        })
        .then(async () => {
          if (participants.length === 2) {
            await db
              .collection("chats")
              .doc(chat)
              .get()
              .then((doc) => {
                if (doc.data().chatImage !== defaultGCImage) {
                  var fileRef = firebase
                    .storage()
                    .refFromURL(doc.data().chatImage);
                  fileRef.delete().catch(function (error) {
                    Toast.show("An error occured.");
                    console.log(error);
                  });
                }
              });
            await db
              .collection("chats")
              .doc(chat)
              .delete()
              .then(() => {
                Toast.show("Chat deleted");
              });
          } else {
            await db
              .collection("chats")
              .doc(chat)
              .update({
                participants: participants.filter(
                  (uid) => uid !== auth.currentUser.uid
                ),
              })
              .then(() => {
                Toast.show("You left the chat");
              });
          }
        });
    });
    setSelectedChats([]);

    // db.collection("chats")
    //   .doc(chat)
    //   .delete()
    //   .then(() => {
    //     setSelectedChats([]);
    //     Toast.show("Successfully deleted");
    //   })
    //   .catch((error) => {
    //     console.error("Error removing document: ", error);
    //   });
  };

  const enterChat = (id, chatName, chatImage) => {
    if (selectedChats.length !== 0 && !selectedChats.includes(id)) {
      setSelectedChats([...selectedChats, id]);
    } else if (selectedChats.length !== 0 && selectedChats.includes(id)) {
      setSelectedChats(selectedChats.filter((c) => c !== id));
    } else {
      navigation.navigate("Chat", {
        id,
        chatName,
        chatImage,
      });
    }
  };

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
    <SafeAreaView>
      <StatusBar barStyle="dark-content" backgroundColor={theme.lightWhite} />
      {chats.length === 0 ? (
        <View
          style={{
            height: "100%",
            backgroundColor: theme.lightWhite,
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          <Image
            style={styles.curvedArrow}
            source={require("../assets/curved-arrow.png")}
          />
          <Text style={styles.addChatText}>
            {"Tap here to create a group chat!"}
          </Text>
          <NoChatsSVG height={255} width={375} opacity={0.5} />
          <Text style={styles.noChatsText}>
            {"Looks like you've got no one to chat with"}
          </Text>
          <View
            style={{ height: 70, backgroundColor: theme.lightWhite }}
          ></View>
        </View>
      ) : (
        <ScrollView style={styles.container}>
          {chats.map(({ id, data: { chatName, chatImage } }) => (
            <ChatListItem
              setSelectedChats={setSelectedChats}
              selectedChats={selectedChats}
              key={id}
              id={id}
              chatName={chatName}
              chatImage={chatImage}
              enterChat={enterChat}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { height: "100%", backgroundColor: theme.lightWhite },
  profileIconContainer: {
    marginLeft: 15,
  },
  topBarIconContainer1: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 80,
    marginRight: 20,
  },
  topBarIconContainer2: {
    flexDirection: "row",
    justifyContent: "center",
    width: 80,
    marginRight: 20,
  },
  noChatsText: {
    fontSize: 25,
    color: theme.primaryBlue,
    opacity: 0.5,
    fontFamily: "Raleway",
    textAlign: "center",
    marginHorizontal: 45,
  },
  curvedArrow: {
    width: 93.2395,
    height: 70,
    position: "absolute",
    top: 15,
    right: 24,
  },
  addChatText: {
    width: 120,
    fontSize: 15,
    color: theme.primaryBlue,
    fontFamily: "RalewayBold",
    textAlign: "center",
    position: "absolute",
    top: 58,
    right: 125,
  },
});
