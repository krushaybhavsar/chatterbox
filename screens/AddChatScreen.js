import React, { useLayoutEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Input } from "react-native-elements";
import { theme } from "../colors";
import { db, auth } from "../firebase";
import { StatusBar } from "react-native";
import UserPermissions from "../utilities/UserPermissions";
import * as ImagePicker from "expo-image-picker";
import * as Firebase from "firebase";
import Toast from "react-native-simple-toast";
import { Image, ActivityIndicator } from "react-native";

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
  const defaultURL =
    "https://firebasestorage.googleapis.com/v0/b/chatterbox-925c4.appspot.com/o/gc_placeholder.png?alt=media&token=d1716687-1abf-408c-b2e1-8a46343af4b5";
  const [input, setInput] = useState("");
  const [participantEmailInput, setParticipantEmailInput] = useState("");
  const [fontLoaded, setFontLoaded] = useState(false);
  const [imageURI, setImageURI] = useState(defaultURL);
  const [loading, setLoading] = useState(false);

  const uploadGCImage = async () => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function () {
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", imageURI, true);
      xhr.send(null);
    });

    const ref = Firebase.storage()
      .ref()
      .child(
        "groupChatProfileImages/" +
          imageURI.substring(imageURI.lastIndexOf("/") + 1)
      );

    return ref.put(blob).then((snapshot) => {
      return snapshot.ref.getDownloadURL().then((url) => {
        return url;
      });
    });
  };

  const createChat = async () => {
    setLoading(true);
    var participantUID;
    if (participantEmailInput.trim() !== auth.currentUser.email) {
      await db
        .collection("users")
        .doc(participantEmailInput.trim())
        .get()
        .then(async (doc) => {
          if (doc.exists) {
            participantUID = doc.data().registeredUserID;
            db.collection("chats")
              .add({
                chatName: input,
                chatImage:
                  imageURI === defaultURL ? defaultURL : await uploadGCImage(),
                participants: [auth.currentUser.uid, participantUID],
              })
              .then(() => {
                setLoading(false);
                navigation.goBack();
              })
              .catch((error) => Toast.show(error.message, Toast.LONG));
          } else {
            Toast.show("No such registered user!", Toast.LONG);
            setLoading(false);
          }
        })
        .catch((error) => {
          console.log("Error getting document:", error);
          setLoading(false);
        });
    } else {
      Toast.show(
        "You can't chat with yourself! Don't worry though. If you're lonely, Chatterbox is here for you.",
        Toast.LONG
      );
      setLoading(false);
    }
  };

  const handlePickAvatar = async () => {
    UserPermissions.getCameraPermission();
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowEditing: true,
      aspect: [4, 3],
    });
    if (!result.cancelled) {
      setImageURI(result.uri);
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
      <View
        style={{
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TouchableOpacity activeOpacity={1} onPress={handlePickAvatar}>
          <Image
            style={{
              width: 125,
              height: 125,
              borderRadius: 200,
              borderWidth: 2,
              borderColor: theme.primaryBlue,
              marginBottom: imageURI === defaultURL ? 40 : 0,
            }}
            source={{
              uri: imageURI,
            }}
          />
          {imageURI === defaultURL ? (
            <TouchableOpacity
              activeOpacity={1}
              onPress={handlePickAvatar}
              style={styles.plusSignBtn}
            >
              <View
                style={{
                  backgroundColor: theme.lightWhite,
                  width: 25,
                  height: 3,
                  borderRadius: 100,
                }}
              />
              <View
                style={{
                  position: "absolute",
                  backgroundColor: theme.lightWhite,
                  width: 3,
                  height: 25,
                  borderRadius: 100,
                }}
              />
            </TouchableOpacity>
          ) : (
            <></>
          )}
          {imageURI !== defaultURL ? (
            <TouchableOpacity
              activeOpacity={0.5}
              style={styles.removeBtn}
              onPress={() => setImageURI(defaultURL)}
            >
              <Text
                style={{
                  color: theme.primaryBlue,
                  fontSize: 16,
                  fontFamily: "RalewayBold",
                }}
              >
                {"Reset Picture"}
              </Text>
            </TouchableOpacity>
          ) : (
            <></>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <Input
          inputStyle={{ fontFamily: "Raleway" }}
          placeholder="Chat name"
          value={input}
          onChangeText={(text) => setInput(text)}
        />
        <Input
          inputStyle={{ fontFamily: "Raleway" }}
          placeholder="Invite participants"
          value={participantEmailInput}
          onChangeText={(text) => setParticipantEmailInput(text)}
        />
      </View>
      {!loading ? (
        <TouchableOpacity
          activeOpacity={0.5}
          style={
            !input || !participantEmailInput
              ? styles.createButtonDisabled
              : styles.createButton
          }
          onPress={createChat}
          disabled={!input || !participantEmailInput}
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
      ) : (
        <ActivityIndicator size="large" color={theme.primaryBlue} />
      )}
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
  plusSignBtn: {
    width: 45,
    height: 45,
    borderWidth: 2,
    borderColor: theme.primaryBlue,
    backgroundColor: theme.primaryBlue,
    // backgroundColor: "#c7d5cd",
    position: "absolute",
    borderRadius: 200,
    justifyContent: "center",
    alignItems: "center",
    left: "25%",
    top: "50%",
  },
  removeBtn: {
    width: 120,
    marginBottom: 20,
    borderRadius: 10,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
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
  createButtonDisabled: {
    width: 300,
    marginVertical: 10,
    backgroundColor: theme.primaryBlue,
    borderRadius: 10,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    opacity: 0.6,
  },
});
