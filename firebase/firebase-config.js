import firebase from 'firebase';
import 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyC4seU_Xpicvs-OQKtH-7o63-w5zhwq3l0',
  authDomain: "twoja-domena.firebaseapp.com",
  databaseURL: "https://twoja-domena.firebaseio.com",
  projectId: "twoj-projekt-id",
  storageBucket: "twoja-domena.appspot.com",
  messagingSenderId: "TwojSenderId",
  appId: "TwojAppId"
};


if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();