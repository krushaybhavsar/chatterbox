import React, { useState, useLayoutEffect, useEffect } from "react";
import {
  StatusBar,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Avatar } from "react-native-elements";
import { theme } from "../colors";
import ChatListItem from "../components/ChatListItem";
import { auth, db } from "../firebase";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";

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
  const [chats, setChats] = useState([]);
  const [fontLoaded, setFontLoaded] = useState(false);

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
        <View style={styles.topBarIconContainer}>
          <TouchableOpacity activeOpacity={0.3}>
            <AntDesign name="camerao" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("AddChat")}
            activeOpacity={0.3}
          >
            <MaterialIcons name="add-circle-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  const enterChat = (id, chatName) => {
    navigation.navigate("Chat", {
      id,
      chatName,
    });
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
      <ScrollView style={styles.container}>
        {chats.map(({ id, data: { chatName } }) => (
          <ChatListItem
            key={id}
            id={id}
            chatName={chatName}
            enterChat={enterChat}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { height: "100%", backgroundColor: theme.lightWhite },
  profileIconContainer: {
    marginLeft: 15,
  },
  topBarIconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 80,
    marginRight: 20,
  },
});
