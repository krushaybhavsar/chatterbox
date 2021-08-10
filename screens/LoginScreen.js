import React, { useState, useEffect } from "react";
import { theme } from "../colors";
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Input, Image, Text } from "react-native-elements";
import { auth } from "../firebase";
import LoginMessages from "../assets/login-messages.svg";
import LoadingScreen from "./LoadingScreen";
import Toast from "react-native-simple-toast";

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

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        navigation.replace("Home");
      }
    });

    return unsubscribe;
  }, []);

  const signIn = () => {
    auth
      .signInWithEmailAndPassword(email, password)
      .catch((error) => Toast.show(error.message, Toast.LONG));
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
      <Text
        style={{
          color: theme.primaryBlue,
          fontSize: 26,
          fontFamily: "RalewayBold",
        }}
      >
        {"Welcome to Chatterbox"}
      </Text>
      <Text
        style={{
          color: theme.darkBlack,
          fontSize: 18,
          fontFamily: "Raleway",
        }}
      >
        {"Let's get chatting!"}
      </Text>
      <LoginMessages height={250} width={300} />
      <View style={styles.inputContainer}>
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
          secureTextEntry
          type="password"
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
      </View>
      <TouchableOpacity
        activeOpacity={0.5}
        style={styles.loginButton}
        onPress={signIn}
      >
        <Text
          style={{
            color: theme.lightWhite,
            fontSize: 16,
            fontFamily: "RalewayBold",
          }}
        >
          {"Login"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.5}
        style={styles.registerButton}
        onPress={() => navigation.navigate("Register")}
      >
        <Text
          style={{
            color: theme.primaryBlue,
            fontSize: 16,
            fontFamily: "RalewayBold",
          }}
        >
          {"I'm new to Chatterbox!"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: theme.lightWhite,
  },
  inputContainer: {
    width: 300,
    backgroundColor: theme.lightWhite,
    marginBottom: 15,
    fontFamily: "Raleway",
  },
  loginButton: {
    width: 300,
    marginVertical: 10,
    backgroundColor: theme.primaryBlue,
    borderRadius: 10,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  registerButton: {
    width: 300,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
