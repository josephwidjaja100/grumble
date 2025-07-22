import React, { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View, Alert } from "react-native";
import 'react-native-url-polyfill/auto';
import GoogleAuth from "./GoogleAuth";

export default function HomeScreen() {

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.logoSection}>
          <View style={styles.logoRow}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>grumble</Text>
          </View>
        </View>
        <View style={styles.card}>
          <View style={styles.howToSection}>
            <Text style={styles.howToTitle}>How to use: </Text>
            <View style={styles.howToList}>
              <Text style={styles.howToItem}>• Create or join a room</Text>
              <Text style={styles.howToItem}>• Swipe on restaurants</Text>
              <Text style={styles.howToItem}>• Find a place in seconds</Text>
            </View>
          </View>
        <GoogleAuth />
        </View>
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
  },
  inner: {
    width: '100%',
    maxWidth: 400,
    marginTop: 0,
    alignItems: 'center',
  },
  logoSection: {
    marginBottom: 36,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 60,
    height: 60,
    marginRight: 16,
    marginTop: 4,
  },
  logoText: {
    fontSize: 56,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 2,
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
  howToSection: {
    marginTop: 0,
    marginBottom: 24,
    alignItems: "flex-start",
    width: "100%",
  },
  howToTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#7084D7",
    marginBottom: 16,
    letterSpacing: 1,
  },
  howToList: {
    gap: 6,
    paddingLeft: 18,
  },
  howToItem: {
    fontSize: 18,
    color: "#7084D7",
    marginBottom: 6,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
});