import React, { useState, useLayoutEffect } from "react";
import { StyleSheet, View, StatusBar, TouchableOpacity } from "react-native";
import { Input, Image, Text } from "react-native-elements";
import { theme } from "../colors";
import { auth, db } from "../firebase";
import UserPermissions from "../utilities/UserPermissions";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-simple-toast";
import * as Firebase from "firebase";

/********* FONT *********/
import * as Font from "expo-font";
import AppLoading from "expo-app-loading";
import { ActivityIndicator } from "react-native";
const fetchFont = () => {
  return Font.loadAsync({
    Raleway: require("../assets/fonts/Raleway/Raleway-Regular.ttf"),
    RalewayBold: require("../assets/fonts/Raleway/Raleway-Bold.ttf"),
  });
};
/************************/

const RegisterScreen = ({ navigation }) => {
  const defaultURL =
    "https://firebasestorage.googleapis.com/v0/b/chatterbox-925c4.appspot.com/o/profile_placeholder.png?alt=media&token=9481124e-6d5c-406e-9a99-5b4013da7ff9";
  const [name, setName] = useState("");
  // const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imageURI, setImageURI] = useState(defaultURL);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitle: "Back to Login",
    });
  }, [navigation]);

  const uploadProfilePicture = async () => {
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
        "userProfilePictures/" +
          imageURI.substring(imageURI.lastIndexOf("/") + 1)
      );

    return ref.put(blob).then((snapshot) => {
      return snapshot.ref.getDownloadURL().then((url) => {
        return url;
      });
    });
  };

  const register = async () => {
    if (name.trim().length > 1) {
      setLoading(true);
      auth
        .createUserWithEmailAndPassword(email, password)
        .then(async (authUser) => {
          authUser.user
            .updateProfile({
              displayName: name,
              photoURL:
                imageURI === defaultURL
                  ? defaultURL
                  : await uploadProfilePicture(),
            })
            .then(() => {
              db.collection("users")
                .doc(authUser.user.email)
                .set({
                  registeredUserID: authUser.user.uid,
                  userInviteID:
                    Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000,
                  userEmail: authUser.user.email,
                  userDisplayName: authUser.user.displayName,
                  userImage: authUser.user.photoURL,
                })
                .catch((error) => {
                  Toast.show(error.message, Toast.LONG);
                })
                .then(() => {
                  navigation.replace("Home");
                });
            });
        })
        .catch((error) => {
          Toast.show(error.message, Toast.LONG);
        });
    } else {
      Toast.show(
        "Your display name must be longer than 1 character!",
        Toast.LONG
      );
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
          placeholder="Display Name"
          type="text"
          value={name}
          onChangeText={(text) => setName(text)}
        />
        {/* <Input
          placeholder="Phone Number"
          type="tel"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={(text) => setPhoneNumber(text)}
        /> */}
        <Input
          inputStyle={{ fontFamily: "Raleway" }}
          placeholder="Email"
          type="email"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <Input
          inputStyle={{ fontFamily: "Raleway" }}
          placeholder="Password"
          type="password"
          value={password}
          secureTextEntry
          onChangeText={(text) => setPassword(text)}
        />
        {/* <Input
          placeholder="Profile Picture URL (optional)"
          type="text"
          value={imageUrl}
          onChangeText={(text) => setImageUrl(text)}
          onSubmitEditing={register}
        /> */}
      </View>
      {!loading ? (
        <>
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.signUpButton}
            onPress={register}
          >
            <Text
              style={{
                color: theme.lightWhite,
                fontSize: 16,
                fontFamily: "RalewayBold",
              }}
            >
              {"Sign Up"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.backToLogin}
            onPress={() => navigation.navigate("Login")}
          >
            <Text
              style={{
                color: theme.primaryBlue,
                fontSize: 16,
                fontFamily: "RalewayBold",
              }}
            >
              {"Back to login"}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <ActivityIndicator size="large" color={theme.primaryBlue} />
      )}
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
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
    left: "20%",
    top: "54%",
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
  inputContainer: {
    width: 300,
    marginBottom: 15,
  },
  signUpButton: {
    width: 300,
    marginVertical: 10,
    backgroundColor: theme.primaryBlue,
    borderRadius: 10,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  backToLogin: {
    width: 300,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
