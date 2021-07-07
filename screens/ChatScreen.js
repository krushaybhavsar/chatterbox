import React, { useLayoutEffect, useState, useRef, useEffect } from "react";
import { TouchableOpacity } from "react-native";
import { StyleSheet, Text, View } from "react-native";
import { Avatar } from "react-native-elements";
import { AntDesign, FontAwesome, Ionicons, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native";
import { StatusBar } from "react-native";
import { KeyboardAvoidingView } from "react-native";
import { Platform } from "react-native";
import { ScrollView } from "react-native";
import { TextInput } from "react-native";
import { theme } from "../colors";
import { Keyboard } from "react-native";
import firebase from "firebase";
import { db, auth } from "../firebase";
import { LogBox } from "react-native";
import moment from "moment";
import MessageOptions from "../components/MessageOptions";

console.warn = () => {};

const ChatScreen = ({ navigation, route }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageOptionsVisibility, setMessageOptionsVisibility] =
    useState(false);

  let time = moment().format("LLLL");

  const scrollViewRef = useRef();
  const messageOptions = useRef();

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
    // const keyboardDidHideListener = Keyboard.addListener(
    //   "keyboardDidHide",
    //   () => {
    //     setTimeout(
    //       () => scrollViewRef.current.scrollToEnd({ animated: true }),
    //       100
    //     );
    //   }
    // );
    return () => {
      // keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Chat",
      headerBackTitleVisible: false,
      headerTitle: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Avatar
            rounded
            source={{
              uri: messages[messages.length - 1]?.data.photoURL,
            }}
          />
          <Text
            style={{
              color: "white",
              marginLeft: 10,
              fontWeight: "700",
              fontSize: 18,
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
          <AntDesign name="arrowleft" size={24} color="white" />
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
            <Feather name="video" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.5}>
            <Feather name="phone" size={24} color="white" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, messages]);

  const sendMessage = () => {
    const updateNumber = firebase.firestore.FieldValue.increment(1);

    // messages[0]["data"]["displayName"] !== auth.currentUser.displayName
    // db.collection("chats")
    //   .doc(route.params.id)
    //   .onSnapshot((snapshot) =>
    //     // console.log(messages[snapshot.get("chatSize")]["data"]["displayName"])
    //     // console.log(snapshot.get("chatSize"))
    //     console.log(messages.length)
    //   );

    if (input.trim() !== "") {
      db.collection("chats").doc(route.params.id).collection("messages").add({
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        message: input,
        displayName: auth.currentUser.displayName,
        email: auth.currentUser.email,
        photoURL: auth.currentUser.photoURL,
      });
      db.collection("chats").doc(route.params.id).update({
        chatSize: updateNumber,
      });
    }
    setInput("");
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
    var stringTime = "Just now";
    if (
      data.timestamp !== null &&
      moment(
        (data.timestamp.toDate() + "").substring(0, 24),
        "ddd MMM DD YYYY HH:mm:ss"
      ).fromNow() !== "in a few seconds"
    ) {
      if (
        moment(
          (data.timestamp.toDate() + "").substring(0, 24),
          "ddd MMM DD YYYY HH:mm:ss"
        )
          .fromNow()
          .indexOf("hour") !== -1
      ) {
        stringTime = moment(
          (data.timestamp.toDate() + "").substring(0, 24)
        ).format("hh:mm A");
      } else {
        stringTime = moment(
          (data.timestamp.toDate() + "").substring(0, 24),
          "ddd MMM DD YYYY HH:mm:ss"
        ).fromNow();
      }
    }
    return stringTime;
  };

  const deleteMessage = (docID) => {
    db.collection("chats")
      .doc(route.params.id)
      .collection("messages")
      .doc(docID)
      .delete()
      .then(() => {
        console.log("Text message successfully deleted");
      })
      .catch((error) => {
        console.error("Error removing document: ", error);
      });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar barStyle="light" backgroundColor="#2C6BED" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={90}
      >
        {/* <MessageOptions /> */}

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
                <View key={id} style={styles.sender}>
                  <Avatar
                    rounded
                    size={35}
                    source={{
                      uri: data.photoURL,
                    }}
                    position="absolute"
                    right={-40}
                  />
                  <Text
                    style={styles.senderText}
                    onPress={() => deleteMessage(messages[index].id)}
                  >
                    {data.message}
                  </Text>
                  <Text style={styles.senderTimeSent}>{formatTime(data)}</Text>
                </View>
              ) : (
                <View key={id} style={styles.receiver}>
                  <Avatar
                    rounded
                    size={35}
                    source={{
                      uri: data.photoURL,
                    }}
                    position="absolute"
                    left={-40}
                  />
                  <Text style={styles.receiverText}>{data.message}</Text>
                  <Text style={styles.receiverTimeSent}>
                    {" "}
                    {formatTime(data)}
                  </Text>
                </View>
              )
            )}
          </ScrollView>
          <View style={styles.footer}>
            <TextInput
              value={input}
              onChangeText={(text) => setInput(text)}
              placeholder="Send a message"
              style={styles.textInput}
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
              // onPress={scrollViewRef.current.scrollToEnd({ animated: true })}
            />
            <TouchableOpacity activeOpacity={0.5} onPress={sendMessage}>
              <Ionicons name="send" size={24} color={theme.primaryBlue} />
            </TouchableOpacity>
          </View>
        </>
        {/* </TouchableWithoutFeedback> */}
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
    // position: "absolute",
    // bottom: 0,
  },
  sender: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#ECECEC",
    alignSelf: "flex-end",
    borderRadius: 15,
    marginRight: 50,
    marginBottom: 25,
    maxWidth: "70%",
    position: "relative",
    justifyContent: "center",
  },
  receiver: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: theme.primaryBlue,
    alignSelf: "flex-start",
    borderRadius: 15,
    marginLeft: 50,
    marginBottom: 25,
    maxWidth: "70%",
    position: "relative",
  },
  receiverText: { color: "white", fontSize: 15 },
  senderText: { color: "black", fontSize: 15 },
  senderTimeSent: {
    color: "grey",
    fontSize: 10,
    position: "absolute",
    bottom: -15,
    right: 5,
  },
  receiverTimeSent: {
    color: "grey",
    fontSize: 10,
    position: "absolute",
    bottom: -15,
    left: 5,
  },
  textInput: {
    bottom: 0,
    height: 43,
    flex: 1,
    marginRight: 15,
    backgroundColor: "#ECECEC",
    paddingVertical: 10,
    paddingHorizontal: 15,
    color: "grey",
    borderRadius: 30,
    fontSize: 16,
  },
});
