import React, { useState, useLayoutEffect } from "react";
import { StyleSheet, View, StatusBar, TouchableOpacity } from "react-native";
import { Input, Image, Text } from "react-native-elements";
import { theme } from "../colors";
import { auth } from "../firebase";
import UserPermissions from "../utilities/UserPermissions";
import * as ImagePicker from "expo-image-picker";
import MessageOptions from "../components/MessageOptions";

//https://www.youtube.com/watch?v=UNFDILca9M8

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitle: "Back to Login",
    });
  }, [navigation]);

  const register = () => {
    if (name.trim().length > 1) {
      auth
        .createUserWithEmailAndPassword(email, password)
        .then((authUser) => {
          authUser.user.updateProfile({
            displayName: name,
            photoURL:
              imageUrl ||
              "https://firebasestorage.googleapis.com/v0/b/chatterbox-925c4.appspot.com/o/profile_placeholder.png?alt=media&token=9481124e-6d5c-406e-9a99-5b4013da7ff9",
          });
        })
        .catch((error) => alert(error.message));
    } else {
      alert("Your display name must be longer than 1 character!");
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
      setImageUrl(result.uri);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light" backgroundColor="#2C6BED" />
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={handlePickAvatar}
        style={{
          borderRadius: 100,
          backgroundColor: "#ECECEC",
          width: 120,
          height: 120,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 15,
        }}
      >
        <Image />
        <View
          style={{
            backgroundColor: "lightgrey",
            width: 60,
            height: 4,
            borderRadius: 100,
          }}
        ></View>
        <View
          style={{
            position: "absolute",
            backgroundColor: "lightgrey",
            width: 4,
            height: 60,
            borderRadius: 100,
          }}
        ></View>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.5}
        style={styles.addPictureButton}
        onPress={handlePickAvatar}
      >
        <Text
          style={{ color: theme.primaryBlue, fontSize: 16, fontWeight: "bold" }}
        >
          {"Add a profile picture"}
        </Text>
      </TouchableOpacity>
      <View style={styles.inputContainer}>
        <Input
          placeholder="Display Name"
          type="text"
          value={name}
          onChangeText={(text) => setName(text)}
        />
        <Input
          placeholder="Email"
          type="email"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <Input
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

      <TouchableOpacity
        activeOpacity={0.5}
        style={styles.signUpButton}
        onPress={register}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
          {"Sign Up"}
        </Text>
      </TouchableOpacity>
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
    backgroundColor: "white",
  },
  addPictureButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: theme.primaryBlue,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
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
});
