import React, { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View, Alert } from "react-native";
import 'react-native-url-polyfill/auto';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import GoogleAuth from "./GoogleAuth";
import RoomSelection from "./RoomSelection";

export default function HomeScreen() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);

  if (user) {
    return <RoomSelection user={user} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>grumble</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.bulletItem}>
          <View style={styles.bullet} />
          <Text style={styles.howToItem}>Create or join a room</Text>
        </View>
        <View style={styles.bulletItem}>
          <View style={styles.bullet} />
          <Text style={styles.howToItem}>Swipe on restaurants</Text>
        </View>
        <View style={[styles.bulletItem, styles.lastBulletItem]}>
          <View style={styles.bullet} />
          <Text style={styles.howToItem}>Find a place in seconds</Text>
        </View>
        <GoogleAuth />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#A0AEE4",
    width: '100%',
  },
  logoContainer: {
    marginBottom: 36,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    flexDirection: "row",
  },
  logoImage: {
    width: 60,
    height: 60,
    marginRight: 8,
    marginTop: 4,
  },
  logoText: {
    fontSize: 56,
    fontWeight: "bold",
    color: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 32,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    minHeight: 0,
    overflow: 'visible',
    width: '80%',
    maxWidth: 320,
    alignSelf: 'center',
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
  },
  lastBulletItem: {
    marginBottom: 24,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#7084D7",
    marginRight: 16,
  },
  howToItem: {
    fontSize: 20,
    color: "#7084D7",
    fontWeight: "bold",
    letterSpacing: 0.3,
    flex: 1,
    flexWrap: "nowrap",
  },
});