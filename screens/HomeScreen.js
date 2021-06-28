import React, { useLayoutEffect } from "react";
import {
  StatusBar,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { Avatar } from "react-native-elements";
import { theme } from "../colors";
import ChatListItem from "../components/ChatListItem";
import { auth, db } from "../firebase";

const HomeScreen = ({ navigation }) => {
  const signOutUser = () => {
    auth.signOut().then(() => {
      navigation.replace("Login");
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Chatterbox",
      headerStyle: { backgroundColor: "white" },
      headerTitleStyle: { color: theme.primaryBlue },
      headerTintColor: theme.primaryBlue,
      headerLeft: () => (
        <View style={styles.topBarIconContainer}>
          <TouchableOpacity activeOpacity={0.5} onPress={signOutUser}>
            <Avatar rounded source={{ uri: auth?.currentUser?.photoURL }} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, []);

  return (
    <SafeAreaView>
      <ScrollView>
        <ChatListItem />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  topBarIconContainer: {
    marginLeft: 15,
  },
});
