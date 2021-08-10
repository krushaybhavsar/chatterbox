import React, { useLayoutEffect, useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Keyboard,
} from "react-native";
import { Avatar } from "react-native-elements";
import { AntDesign, Ionicons, Feather } from "@expo/vector-icons";
import { theme } from "../colors";
import firebase from "firebase";
import { db, auth } from "../firebase";
import moment from "moment";
import UserPermissions from "../utilities/UserPermissions";
import Toast from "react-native-simple-toast";
import * as ImagePicker from "expo-image-picker";

/********* FONT *********/
import * as Font from "expo-font";
import AppLoading from "expo-app-loading";
import { Image } from "react-native-elements/dist/image/Image";
import { ActivityIndicator } from "react-native";
const fetchFont = () => {
  return Font.loadAsync({
    Merriweather: require("../assets/fonts/Merriweather/Merriweather-Bold.ttf"),
    Raleway: require("../assets/fonts/Raleway/Raleway-Regular.ttf"),
    RalewayBold: require("../assets/fonts/Raleway/Raleway-Bold.ttf"),
  });
};
/************************/

console.warn = () => {};

const ChatScreen = ({ navigation, route }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const scrollViewRef = useRef();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setTimeout(
          () => scrollViewRef.current.scrollToEnd({ animated: true }),
          100
        );
      }
    );
    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Chat",
      headerBackTitleVisible: false,
      headerTitle: () => (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Avatar
            rounded
            source={{
              uri: route.params.chatImage,
            }}
          />
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              color: theme.primaryBlue,
              marginLeft: 10,
              marginRight: 42,
              fontFamily: "RalewayBold",
              fontSize: 18,
              maxWidth: 175,
              borderRadius: 100,
              // backgroundColor: "#f7f6f5",
              textAlign: "right",
            }}
          >
            {route.params.chatName}
          </Text>
        </View>
      ),
      headerLeft: () => (
        <TouchableOpacity
          style={{ marginLeft: 15 }}
          onPress={navigation.goBack}
        >
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            width: 75,
            marginRight: 15,
          }}
        >
          <TouchableOpacity activeOpacity={0.5}>
            <Feather name="video" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.5}>
            <Feather name="phone" size={24} color="black" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, messages]);

  const sendMessage = () => {
    setLoading(true);
    if (input.trim() !== "") {
      db.collection("chats").doc(route.params.id).collection("messages").add({
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        message: input,
        type: "text",
        timeVisible: false,
        displayName: auth.currentUser.displayName,
        email: auth.currentUser.email,
        photoURL: auth.currentUser.photoURL,
      });
    }
    setInput("");
    setLoading(false);
  };

  const setTimeVisible = (id, value) => {
    db.collection("chats")
      .doc(route.params.id)
      .collection("messages")
      .doc(id)
      .update({
        timeVisible: value,
      });
  };

  useLayoutEffect(() => {
    const unsubscribe = db
      .collection("chats")
      .doc(route.params.id)
      .collection("messages")
      .orderBy("timestamp", "asc")
      .onSnapshot((snapshot) =>
        setMessages(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }))
        )
      );
    return unsubscribe;
  }, [route]);

  const formatTime = (data) => {
    return moment(
      (data.timestamp.toDate() + "").substring(0, 24),
      "ddd MMM DD YYYY HH:mm:ss"
    ).format("h:mm A");
  };

  const deleteMessage = async (docID) => {
    setLoading(true);
    await db
      .collection("chats")
      .doc(route.params.id)
      .collection("messages")
      .doc(docID)
      .get()
      .then((doc) => {
        if (doc.data().type === "file") {
          var fileRef = firebase.storage().refFromURL(doc.data().message);
          fileRef.delete().catch(function (error) {
            Toast.show("An error occured.");
            console.log(error);
          });
        }
      });
    await db
      .collection("chats")
      .doc(route.params.id)
      .collection("messages")
      .doc(docID)
      .delete()
      .then(() => {
        Toast.show("Message deleted");
      })
      .catch((error) => {
        console.error("Error removing document: ", error);
      });
    setLoading(false);
  };

  const uploadMedia = async (uri) => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function () {
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });
    const ref = firebase
      .storage()
      .ref()
      .child("groupChatMedia/" + uri.substring(uri.lastIndexOf("/") + 1));

    return ref.put(blob).then((snapshot) => {
      return snapshot.ref.getDownloadURL().then((url) => {
        return url;
      });
    });
  };

  const handleSelectPicture = async () => {
    UserPermissions.getCameraPermission();
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowEditing: true,
      aspect: [4, 3],
    });
    if (!result.cancelled) {
      setLoading(true);
      db.collection("chats")
        .doc(route.params.id)
        .collection("messages")
        .add({
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          message: await uploadMedia(result.uri),
          type: "file",
          displayName: auth.currentUser.displayName,
          email: auth.currentUser.email,
          photoURL: auth.currentUser.photoURL,
        })
        .then(() => {
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error sending media: ", error);
          Toast.show(error.message, Toast.LONG);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.lightWhite }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.lightWhite} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={90}
      >
        <>
          <ScrollView
            contentContainerStyle={{ paddingTop: 15 }}
            ref={scrollViewRef}
            onContentSizeChange={() =>
              setTimeout(
                () => scrollViewRef.current.scrollToEnd({ animated: true }),
                10
              )
            }
          >
            {messages.map(({ id, data }, index) =>
              data.email === auth.currentUser.email ? (
                <TouchableOpacity
                  key={id}
                  style={{
                    padding: data.type === "text" ? 10 : 0,
                    backgroundColor:
                      data.type === "text" ? theme.primaryBlue : "transparent",
                    alignSelf: "flex-end",
                    borderRadius: 15,
                    marginRight: 50,
                    marginBottom: data.timeVisible ? 25 : 10,
                    maxWidth: "70%",
                    position: "relative",
                    justifyContent: "center",
                  }}
                  activeOpacity={0.8}
                  onPress={() => setTimeVisible(id, !data.timeVisible)}
                  onLongPress={async () => await deleteMessage(id)}
                >
                  <Avatar
                    rounded
                    size={35}
                    source={{
                      uri: data.photoURL,
                    }}
                    position="absolute"
                    right={-40}
                  />
                  {data.type === "text" ? (
                    <Text style={styles.senderText}>{data.message}</Text>
                  ) : (
                    <Image
                      style={styles.imageMessage}
                      source={{ uri: data.message }}
                    />
                  )}
                  {data.timeVisible && (
                    <Text style={styles.senderTimeSent}>
                      {formatTime(data)}
                    </Text>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  key={id}
                  style={{
                    padding: data.type === "text" ? 10 : 0,
                    backgroundColor:
                      data.type === "text" ? "#e3ddd5" : "transparent",
                    // backgroundColor: "#ECECEC",
                    alignSelf: "flex-start",
                    borderRadius: 15,
                    marginLeft: 50,
                    marginBottom: data.timeVisible ? 25 : 10,
                    maxWidth: "70%",
                    position: "relative",
                  }}
                  activeOpacity={0.8}
                  onPress={() => setTimeVisible(id, !data.timeVisible)}
                >
                  <Avatar
                    rounded
                    size={35}
                    source={{
                      uri: data.photoURL,
                    }}
                    position="absolute"
                    left={-40}
                  />
                  {data.type === "text" ? (
                    <Text style={styles.receiverText}>{data.message}</Text>
                  ) : (
                    <Image
                      style={styles.imageMessage}
                      source={{ uri: data.message }}
                    />
                  )}
                  {data.timeVisible && (
                    <Text style={styles.receiverTimeSent}>
                      {formatTime(data)}
                    </Text>
                  )}
                </TouchableOpacity>
              )
            )}
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={async () => {
                await handleSelectPicture();
              }}
              style={{
                width: 32,
                height: 32,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 15,
                marginLeft: 5,
                opacity: loading ? 0.5 : 1,
              }}
              disabled={loading}
            >
              <Ionicons
                name="image-outline"
                size={32}
                color={theme.primaryBlue}
              />
            </TouchableOpacity>
            <TextInput
              value={input}
              onChangeText={(text) => setInput(text)}
              placeholder="Send a message"
              style={styles.textInput}
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />
            {!loading ? (
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={sendMessage}
                style={{ marginRight: 3 }}
              >
                <Ionicons name="send" size={24} color={theme.primaryBlue} />
              </TouchableOpacity>
            ) : (
              <ActivityIndicator size="large" color={theme.primaryBlue} />
            )}
          </View>
        </>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 15,
  },
  receiverText: { color: "black", fontSize: 15, fontFamily: "Raleway" },
  senderText: { color: theme.lightWhite, fontSize: 15, fontFamily: "Raleway" },
  senderTimeSent: {
    color: "grey",
    fontSize: 10,
    position: "absolute",
    bottom: -15,
    right: 5,
    fontFamily: "Raleway",
  },
  receiverTimeSent: {
    color: "grey",
    fontSize: 10,
    position: "absolute",
    bottom: -15,
    left: 5,
    fontFamily: "Raleway",
  },
  textInput: {
    bottom: 0,
    height: 43,
    flex: 1,
    marginRight: 15,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#d9d5d0",
    paddingVertical: 10,
    paddingHorizontal: 15,
    color: "grey",
    borderRadius: 30,
    fontSize: 16,
    fontFamily: "Raleway",
  },
  imageMessage: {
    height: 150,
    width: 200,
    maxHeight: 150,
    maxWidth: 200,
    borderRadius: 15,
  },
});
