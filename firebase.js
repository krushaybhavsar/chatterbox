import firebase from "firebase";
import "firebase/firestore";
import "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDoGizfQBTeY385abVkc4zSaXQL_8seX58",
  authDomain: "chatterbox-925c4.firebaseapp.com",
  projectId: "chatterbox-925c4",
  storageBucket: "chatterbox-925c4.appspot.com",
  messagingSenderId: "673693565044",
  appId: "1:673693565044:web:787ae8a60e25416dcb1121",
};

let app;

if (firebase.apps.length === 0) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app();
}

const db = app.firestore();
const auth = firebase.auth();

export { db, auth };
