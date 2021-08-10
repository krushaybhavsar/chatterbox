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
import Tags from "react-native-tags";

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
  const [participantEmailInput, setParticipantEmailInput] = useState([]);
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
    var participantUIDs = [];
    if (!participantEmailInput.includes(auth.currentUser.email)) {
      for (const participantEmail of participantEmailInput) {
        await db
          .collection("users")
          .doc(participantEmail)
          .get()
          .then(async (doc) => {
            if (!doc.exists) {
              Toast.show(
                'An account with the email address "' +
                  participantEmail +
                  '" does not exist.',
                Toast.LONG
              );
            } else {
              participantUIDs.push(doc.data().registeredUserID);
            }
          })
          .catch((error) => {
            console.log("Error getting document:", error);
          });
      }
      if (participantUIDs.length === participantEmailInput.length) {
        // Checks if all emails are valid
        var isExsitingDM = false;
        if (participantUIDs.length === 1) {
          // Checks if new chat is already exisiting DM
          await db
            .collection("chats")
            .where("participants", "array-contains", auth.currentUser.uid)
            // .where("participants", "array-contains", auth.currentUser.uid)
            .where("chatType", "==", "direct")
            .get()
            .then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                if (doc.data().participants.includes(participantUIDs[0])) {
                  console.log(doc.id, " => ", doc.data());
                  isExsitingDM = true;
                }
              });
            })
            .catch((error) => {
              console.log("Error getting documents: ", error);
            });
        }
        if (!isExsitingDM) {
          await db
            .collection("chats")
            .add({
              chatName: input,
              chatImage:
                imageURI === defaultURL ? defaultURL : await uploadGCImage(),
              participants: [auth.currentUser.uid, ...participantUIDs],
              chatType: participantUIDs.length === 1 ? "direct" : "group",
            })
            .then(() => {
              navigation.goBack();
            })
            .catch((error) => Toast.show(error.message, Toast.LONG));
        } else {
          Toast.show(
            "You already have a direct message chat with this user",
            Toast.LONG
          );
        }
      }
    } else {
      Toast.show(
        "You can't chat with yourself! Don't worry though. If you're lonely, Chatterbox is here for you.",
        Toast.LONG
      );
    }
    setLoading(false);
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
          inputStyle={{
            fontFamily: "Raleway",
            fontSize: 18,
          }}
          placeholder="Chat name (if chat is not a DM)"
          value={input}
          onChangeText={(text) => setInput(text)}
        />
        <Tags
          initialText=""
          textInputProps={{
            placeholder: "Enter a participant's email",
          }}
          onChangeTags={(tags) => {
            setParticipantEmailInput(tags);
          }}
          containerStyle={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 10,
          }}
          inputContainerStyle={{
            backgroundColor: theme.lightWhite,
            padding: 0,
            margin: 0,
            borderRadius: 0,
          }}
          inputStyle={{
            fontFamily: "Raleway",
            fontSize: 18,
            backgroundColor: theme.lightWhite,
            borderBottomWidth: 1,
            borderBottomColor: "#9c9c9c",
            marginHorizontal: 10,
            paddingLeft: -10,
          }}
          createTagOnString={[" ", ",", "@gmail.com"]}
          renderTag={({ tag, index, onPress }) => (
            <TouchableOpacity
              key={`${tag}-${index}`}
              onPress={onPress}
              style={styles.tag}
            >
              <Text style={styles.tagText}>{tag}</Text>
            </TouchableOpacity>
          )}
        />
        <Text
          style={{
            fontFamily: "Raleway",
            color: "#9c9c9c",
            textAlign: "center",
            marginTop: 8,
            fontSize: 12,
            marginBottom: 30,
          }}
        >
          {"(add a space at the end of each email)"}
        </Text>
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
          disabled={!input || participantEmailInput.length === 0}
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
  tag: {
    backgroundColor: theme.primaryBlue,
    marginHorizontal: 2.5,
    marginBottom: 5,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  tagText: {
    color: theme.lightWhite,
    fontSize: 16,
    fontFamily: "Raleway",
  },
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
