import "react-native-gesture-handler";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import AddChatScreen from "./screens/AddChatScreen";
import ChatScreen from "./screens/ChatScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { theme } from "./colors";

const Stack = createStackNavigator();

const globalScreenOptions = {
  headerStyle: { backgroundColor: theme.primaryBlue },
  headerTitleStyle: { color: "white" },
  headerTintColor: "white",
  headerTitleAlign: "center",
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          // initialRouteName="Home"
          screenOptions={globalScreenOptions}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: "Let's Get Chatting!" }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: "Sign Up" }}
          />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AddChat" component={AddChatScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
