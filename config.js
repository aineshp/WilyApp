import * as firebase from 'firebase'
require('@firebase/firestore')

var firebaseConfig = {
  apiKey: "AIzaSyDBbJHhkuArW8VoSippcm_pNkaSBrhT0Qs",
  authDomain: "wily-app-e999f.firebaseapp.com",
  databaseURL: "https://wily-app-e999f.firebaseio.com",
  projectId: "wily-app-e999f",
  storageBucket: "wily-app-e999f.appspot.com",
  messagingSenderId: "159881987365",
  appId: "1:159881987365:web:bb654d30e95341c56f86cc"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();
