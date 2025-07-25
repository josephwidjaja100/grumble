import { getAuth, signOut } from '@react-native-firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore, query, setDoc, where } from '@react-native-firebase/firestore';
import React, { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import PreSwipeScreen from "./PreSwipeScreen"; 

const firestore = getFirestore();

export default function RoomSelection({ user }) {
  const [currentScreen, setCurrentScreen] = useState('selection');
  const [roomCode, setRoomCode] = useState('');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [currentRoomData, setCurrentRoomData] = useState({});

  const generateRoomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const createRoom = async () => {
    const roomDb = collection(firestore, 'roomdb');
    const snapshot = await getDocs(roomDb);

    snapshot.forEach(doc => {
      console.log(doc.id, '=>', doc.data());
    });

    let newRoomCode = '';

    while(true){
      newRoomCode = generateRoomCode();

      const roomExists = await getDocs(query(roomDb, where('code', '==', newRoomCode)));

      if (roomExists.empty) {
        setRoomCode(newRoomCode);
        break; 
      }
    }

    console.log('New room code:', newRoomCode);

    const roomData = {
      code: newRoomCode,
      host: user.uid,
      started: false,
      users: [user.uid],
      userNames: { [user.uid]: user.displayName },
      restaurants: [],
      userSwipes: {},
      matches: []
    };
    
    setCurrentRoomData(roomData);
    setCurrentScreen('pre-swiping');

    await setDoc(doc(firestore, 'roomdb', newRoomCode), roomData);
  };

  const joinRoom = async () => {
    if (joinRoomCode.length !== 6) {
      Alert.alert('Invalid Code', 'Room code must be 6 characters');
      return;
    }
    
    // fetch room data from Firebase Firestore and update data 
    const roomRef = doc(firestore, "roomdb", joinRoomCode);
    let roomData = (await getDoc(roomRef)).data();

    console.log('Room data:', roomData);
    if (!roomData) {
      Alert.alert('Room Not Found', 'The room you are trying to join does not exist.');
      return;
    }

    if(!roomData.users.includes(user.uid)) {
      roomData.users.push(user.uid);
      roomData.userNames[user.uid] = user.displayName;
    }

    await setDoc(roomRef, roomData);

    setCurrentRoomData(roomData);
    setCurrentScreen('pre-swiping');
    
    console.log('Joined room:', roomData);
  };

  const handleSignOut = async () => {
    try {
      await signOut(getAuth());
    } 
    catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (currentScreen === 'pre-swiping' && currentRoomData) {
    console.log('Current room data:', currentRoomData);
    return <PreSwipeScreen roomData={currentRoomData} user={user} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>nomble</Text>
        </View>
        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome, {user.displayName}!</Text>
        </View>

        <View style={styles.card}>
          <Pressable style={styles.actionButton} onPress={createRoom}>
            <Text style={styles.actionButtonText}>Create New Room</Text>
          </Pressable>

          <View style={styles.divider} />

          <View style={styles.joinSection}>
            <TextInput
              style={styles.codeInput}
              placeholder="Enter room code"
              value={joinRoomCode}
              onChangeText={setJoinRoomCode}
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <Pressable 
              style={[
                styles.actionButton, 
                styles.joinButton,
                joinRoomCode.length !== 6 && styles.disabledButton
              ]} 
              onPress={joinRoom}
              disabled={joinRoomCode.length !== 6}
            >
              <Text style={[
                styles.actionButtonText,
                joinRoomCode.length !== 6 && styles.disabledButtonText
              ]}>
                Join Room
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#A0AEE4",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  signOutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  signOutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -60,
  },
  welcomeSection: {
    marginBottom: 40,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 32,
    padding: 32,
    width: '90%',
    maxWidth: 350,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  actionButton: {
    backgroundColor: "#7084D7",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginVertical: 0,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 24,
  },
  joinSection: {
    width: '100%',
  },
  codeInput: {
    borderWidth: 2,
    borderColor: '#7084D7',
    borderRadius: 15,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: "#5A6FCC",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  disabledButtonText: {
    color: "#999",
  },
});