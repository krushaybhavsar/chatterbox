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

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      console.log(authUser);
      if (authUser) {
        navigation.replace("Home");
      }
    });

    return unsubscribe;
  }, []);

  const signIn = () => {
    auth
      .signInWithEmailAndPassword(email, password)
      .catch((error) => alert(error));
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#2C6BED" />
      <Image
        source={require("../assets/login_1.png")}
        style={styles.loginImage}
      />
      <View style={styles.inputContainer}>
        <Input
          placeholder="Email"
          type="email"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <Input
          placeholder="Password"
          secureTextEntry
          type="password"
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
      </View>
      <TouchableOpacity style={styles.loginButton} onPress={signIn}>
        <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
          {"Login"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate("Register")}
      >
        <Text
          style={{ color: theme.primaryBlue, fontSize: 16, fontWeight: "bold" }}
        >
          {"Sign Up"}
        </Text>
      </TouchableOpacity>
      <View style={{ height: 100 }} />
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
    backgroundColor: "white",
  },
  loginImage: {
    width: 270,
    height: 230,
    marginRight: 15,
  },
  inputContainer: {
    width: 300,
    backgroundColor: "white",
    borderRadius: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 7 },
    paddingHorizontal: 7,
    paddingTop: 15,
    marginBottom: 15,
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
    paddingVertical: 8,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: theme.primaryBlue,
    justifyContent: "center",
    alignItems: "center",
  },
});
