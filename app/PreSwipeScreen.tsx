import { Image, Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import { doc, getFirestore, onSnapshot, setDoc } from '@react-native-firebase/firestore';
import React, { useState, useEffect } from "react";
import SwipeScreen from "./SwipeScreen";

const firestore = getFirestore();

export default function PreSwipeScreen({ roomData, user }: { roomData: any, user: any }) {
  const [currentScreen, setCurrentScreen] = useState('selection');

  const roomRef = doc(firestore, 'roomdb', roomData.code);

  useEffect(() => {
    const snapshot = onSnapshot(roomRef, (room) => {
      if (room.exists() && room.data().started) {
        handleStartRoom();
      }
    });

    return () => snapshot();
  }, [roomData.code]);

  const handleStartRoom = async () => {
    roomData.started = true;
    await setDoc(roomRef, roomData);
    setCurrentScreen('swipe');
  };

  if (currentScreen === 'swipe') {
    return <SwipeScreen roomData={roomData} user={user} />;
  }

  const isHost = roomData.host === user.uid;
  
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
      </View>

      <View style={styles.content}>
        <View style={styles.roomCodeSection}>
          <Text style={styles.roomCodeLabel}>Room Code</Text>
          <Text style={styles.roomCodeText}>{roomData.code}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Room Members</Text>
          
          <ScrollView style={styles.usersList} showsVerticalScrollIndicator={false}>
            {roomData.users.map((userId, index) => (
              <View key={userId} style={styles.userItem}>
                <Text style={styles.userName}>
                  {roomData.userNames[userId]}
                  {userId === roomData.host && (
                    <Text style={styles.hostLabel}> (Host)</Text>
                  )}
                </Text>
              </View>
            ))}
          </ScrollView>

          <Text style={styles.membersCount}>
            {roomData.users.length} member{roomData.users.length !== 1 ? 's' : ''}
          </Text>

          {isHost && (
            <Pressable style={styles.startButton} onPress={handleStartRoom}>
              <Text style={styles.startButtonText}>Start Room</Text>
            </Pressable>
          )}

          {!isHost && (
            <View style={styles.waitingSection}>
              <Text style={styles.waitingText}>
                Waiting for {roomData.userNames[roomData.host]} to start the room...
              </Text>
            </View>
          )}
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
    justifyContent: 'center',
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -100,
  },
  roomCodeSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  roomCodeLabel: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 8,
  },
  roomCodeText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 4,
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
    maxHeight: '60%',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  usersList: {
    width: '100%',
    maxHeight: 200,
    marginBottom: 16,
  },
  userItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#7084D7',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  hostLabel: {
    color: '#7084D7',
    fontWeight: '700',
  },
  membersCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: "#7084D7",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  waitingSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  waitingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});