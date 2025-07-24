import React, { useState, useRef, useEffect } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { doc, setDoc, onSnapshot, getDoc } from '@react-native-firebase/firestore';
import { getFirestore } from '@react-native-firebase/firestore';

const firestore = getFirestore();

export default function MatchesScreen({ roomData, user }: { roomData: any; user: any; }) {
  const [matches, setMatches] = useState(roomData.matches || []);

  useEffect(() => {
    const roomRef = doc(firestore, 'roomdb', roomData.code);
    const unsubscribe = onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setMatches(data.matches || []);
      }
    });

    return () => unsubscribe();
  }, [roomData.code]);

  return (
  <View style={styles.container}>
    <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
        />
        <Text style={styles.logoText}>grumble</Text>
      </View>
    </View>
    
    <View style={styles.content}>
      <View style={styles.endCard}>
        <Text style={styles.endTitle}>No More Restaurants!</Text>
        <Text style={styles.endSubtitle}>
          You've swiped through all available options.
        </Text>
        <Text style={styles.matchCount}>
          Total Matches: {matches.length}
        </Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cardContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 350,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    overflow: 'hidden',
  },
  restaurantImage: {
    width: '100%',
    height: 250,
  },
  cardContent: {
    padding: 20,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 16,
    color: '#7084D7',
    fontWeight: '600',
    marginBottom: 8,
  },
  restaurantInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
  },
  priceRange: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  backgroundCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
    opacity: 0.9,
  },
  actionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  leftAction: {
    backgroundColor: '#ff4444',
    marginRight: 10,
  },
  rightAction: {
    backgroundColor: '#4CAF50',
    marginLeft: 10,
  },
  actionText: {
    fontSize: 48,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 300,
    marginVertical: 20,
  },
  actionButton: {
    backgroundColor: '#fff',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  passButton: {
    backgroundColor: '#ff4444',
  },
  likeButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    fontSize: 32,
  },
  buttonIcon: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7084D7',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 4,
  },
  matchText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  instructionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.8,
    fontStyle: 'italic',
  },
  endCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  endTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  endSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  matchCount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7084D7',
  },
});