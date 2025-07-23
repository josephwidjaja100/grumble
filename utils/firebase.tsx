import { initializeApp } from '@react-native-firebase/app';
import { getFirestore } from '@react-native-firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC5lSyDRKCZ0pmqzK1zgwwWnn4RDevx83g",
  authDomain: "grumble-466615.firebaseapp.com",
  projectId: "grumble-466615",
  storageBucket: "grumble-466615.firebasestorage.app",
  messagingSenderId: "155134834532",
  appId: "1:155134834532:web:62d5030ae7cf76a923ec71",
  measurementId: "G-CW4EDE2W73"
};

const app = initializeApp(firebaseConfig); 
export const firestore = getFirestore(app);