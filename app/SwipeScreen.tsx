import React, { useState, useRef, useEffect } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { doc, setDoc, onSnapshot, getDoc } from '@react-native-firebase/firestore';
import { getFirestore } from '@react-native-firebase/firestore';
import MatchesScreen from "./MatchesScreen";

const firestore = getFirestore();

// Sample restaurant data
const sampleRestaurants = [
  {
    id: "1",
    name: "Giuseppe's Italian",
    cuisine: "Italian",
    rating: 4.5,
    priceRange: "$$",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
    description: "Authentic Italian cuisine with fresh pasta and wood-fired pizzas"
  },
  {
    id: "2",
    name: "Dragon Palace",
    cuisine: "Chinese",
    rating: 4.2,
    priceRange: "$",
    image: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400&h=300&fit=crop",
    description: "Traditional Chinese dishes with modern presentation"
  },
  {
    id: "3",
    name: "Burger Junction",
    cuisine: "American",
    rating: 4.0,
    priceRange: "$$",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    description: "Gourmet burgers made with locally sourced ingredients"
  },
  {
    id: "4",
    name: "Sakura Sushi",
    cuisine: "Japanese",
    rating: 4.7,
    priceRange: "$$$",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop",
    description: "Fresh sushi and sashimi prepared by master chefs"
  },
  {
    id: "5",
    name: "Taco Libre",
    cuisine: "Mexican",
    rating: 4.3,
    priceRange: "$",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    description: "Authentic Mexican street food and craft cocktails"
  },
];

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  priceRange: string;
  image: string;
  description: string;
}

export default function SwipeScreen({ roomData, user }: { roomData: any; user: any; }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [restaurants] = useState<Restaurant[]>(sampleRestaurants);
  const [userSwipes, setUserSwipes] = useState<{[key: string]: {[key: string]: 'left' | 'right'}}>({});
  const [matches, setMatches] = useState<Restaurant[]>([]);
  const swipeableRef = useRef<Swipeable>(null);
  const [currentScreen, setCurrentScreen] = useState('swipe');

  const currentRestaurant = restaurants[currentIndex];

  // Listen for real-time updates to room data
  useEffect(() => {
    const roomRef = doc(firestore, 'roomdb', roomData.code);
    const unsubscribe = onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();

        setUserSwipes(data.userSwipes || {});
        setMatches(data.matches || []);
      }
    });

    return () => unsubscribe();
  }, [roomData.code]);

  const checkForMatch = async (restaurantId: string, swipeDirection: 'left' | 'right') => {
    const updatedSwipes = {
      ...userSwipes,
      [restaurantId]: {
        ...userSwipes[restaurantId],
        [user.uid]: swipeDirection
      }
    };

    roomData.userSwipes = updatedSwipes;

    // Check if all users have swiped right on this restaurant
    const allUsersSwipedRight = roomData.users.every((userId: string) => 
      updatedSwipes[restaurantId][userId] === 'right'
    );
    const roomRef = doc(firestore, 'roomdb', roomData.code);
    await setDoc(roomRef, roomData);

    if (allUsersSwipedRight) {
      const matchedRestaurant = restaurants.find(r => r.id === restaurantId);
      if (matchedRestaurant) {
        const updatedMatches = [...matches, matchedRestaurant];
        roomData.matches = updatedMatches;
        // Update Firestore
        await setDoc(roomRef, roomData);

        // Show match alert
        Alert.alert(
          "It's a Match! 🎉",
          `Everyone loved ${matchedRestaurant.name}!`,
          [{ text: "Awesome!", style: "default" }]
        );
        // setCurrentScreen('matches');
      }
    }
  };

  const nextRestaurant = restaurants[currentIndex + 1];

  const renderCard = () => {
    if (!nextRestaurant) {
      return (
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.restaurantName}>No More Restaurants!</Text>
            <Text style={styles.description}>You've swiped through all available options.</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <Image
          source={{ uri: nextRestaurant.image }}
          style={styles.restaurantImage}
        />
        <View style={styles.cardContent}>
          <Text style={styles.restaurantName}>{nextRestaurant.name}</Text>
          <Text style={styles.restaurantCuisine}>{nextRestaurant.cuisine}</Text>
          <View style={styles.restaurantInfo}>
            <Text style={styles.rating}>⭐ {nextRestaurant.rating}</Text>
            <Text style={styles.priceRange}>{nextRestaurant.priceRange}</Text>
          </View>
          <Text style={styles.description}>{nextRestaurant.description}</Text>
        </View>
      </View>
    );
  };

  // Handle swipe gestures
  const onSwipeableOpen = async (direction: 'left' | 'right') => {
    swipeableRef.current?.close();
    
    if (direction === 'left') {
      await checkForMatch(currentRestaurant.id, 'left');
    } 
    else {
      await checkForMatch(currentRestaurant.id, 'right');
    }

    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 300);
  };

  useEffect(() => {
    if (currentIndex >= restaurants.length) {
      setCurrentScreen('matches');
    }
  }, [currentIndex, restaurants.length]);
  
  if (currentScreen === 'matches') {
    return <MatchesScreen roomData={roomData} user={user} />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
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
        <View style={styles.cardContainer}>
          { currentRestaurant && (
            <Swipeable
              ref={swipeableRef}
              renderLeftActions={renderCard}
              renderRightActions={renderCard}
              onSwipeableOpen={onSwipeableOpen}
              leftThreshold={100}
              rightThreshold={100}
            >
              <View style={styles.card}>
                <Image
                  source={{ uri: currentRestaurant.image }}
                  style={styles.restaurantImage}
                />
                <View style={styles.cardContent}>
                  <Text style={styles.restaurantName}>{currentRestaurant.name}</Text>
                  <Text style={styles.restaurantCuisine}>{currentRestaurant.cuisine}</Text>
                  <View style={styles.restaurantInfo}>
                    <Text style={styles.rating}>⭐ {currentRestaurant.rating}</Text>
                    <Text style={styles.priceRange}>{currentRestaurant.priceRange}</Text>
                  </View>
                  <Text style={styles.description}>{currentRestaurant.description}</Text>
                </View>
              </View>
            </Swipeable>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.actionButton}
            onPress={() => onSwipeableOpen('left')}
          >
            <Text style={styles.buttonIcon}>✗</Text>
          </Pressable>
          
          <Pressable
            style={styles.actionButton}
            onPress={() => onSwipeableOpen('right')}
          >
            <Text style={styles.buttonIcon}>✓</Text>
          </Pressable>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentIndex + 1} of {restaurants.length}
          </Text>
          <Text style={styles.matchText}>
            Matches: {matches.length}
          </Text>
        </View>

        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            Swipe left to pass, right to like, or use buttons below
          </Text>
        </View>
      </View>
    </GestureHandlerRootView>
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