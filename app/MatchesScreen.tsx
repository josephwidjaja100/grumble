import React, { useState, useRef, useEffect } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View, ScrollView, Dimensions } from "react-native";
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

  const renderMatchCard = (restaurant: any, index: number) => (
    <View style={styles.card} key={index}>
      <Image
        source={{ uri: restaurant.image }}
        style={styles.restaurantImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.restaurantName}>{restaurant.name}</Text>
        <Text style={styles.restaurantCuisine}>{restaurant.cuisine}</Text>
        <View style={styles.restaurantInfo}>
          <Text style={styles.rating}>⭐ {restaurant.rating}</Text>
          <Text style={styles.priceRange}>{restaurant.priceRange}</Text>
        </View>
        <Text style={styles.description}>{restaurant.description}</Text>
      </View>
    </View>
  );

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
        {matches.length > 0 ? (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>🎉 Great Choices!</Text>
              <Text style={styles.summarySubtitle}>
                Everyone agreed on these restaurants
              </Text>
              <Text style={styles.matchCount}>
                {matches.length} {matches.length === 1 ? 'Match' : 'Matches'}
              </Text>
            </View>
            
            <ScrollView 
              style={styles.matchesList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {matches.map((restaurant: any, index: number) => renderMatchCard(restaurant, index))}
              
              <View style={styles.footerSpace} />
            </ScrollView>
          </>
        ) : (
          <View style={styles.endCard}>
            <Text style={styles.endTitle}>No Matches Yet</Text>
            <Text style={styles.endSubtitle}>
              Keep swiping to find restaurants everyone loves!
            </Text>
            <Text style={styles.noMatchText}>
              💡 Try being more adventurous with your choices
            </Text>
          </View>
        )}
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
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  summarySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  matchCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#7084D7',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  matchesList: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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
    marginBottom: 20,
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
    marginBottom: 4,
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
    marginTop: 60,
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
  noMatchText: {
    fontSize: 14,
    color: '#7084D7',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footerSpace: {
    height: 20,
  },
});