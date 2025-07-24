import React, { useState, useRef, useEffect } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View, Animated } from "react-native";
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { GestureHandlerRootView, PanGestureHandler } from "react-native-gesture-handler";
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
  const [currentScreen, setCurrentScreen] = useState('swipe');
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Animation values
  const cardTranslateX = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const cardRotation = useRef(new Animated.Value(0)).current;

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
      }
    }
  };

  const animateCardOut = (direction: 'left' | 'right') => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const toValue = direction === 'left' ? -400 : 400;
    const rotationValue = direction === 'left' ? -0.3 : 0.3;

    Animated.parallel([
      Animated.timing(cardTranslateX, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(cardRotation, {
        toValue: rotationValue,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset animation values for next card
      cardTranslateX.setValue(0);
      cardOpacity.setValue(1);
      cardRotation.setValue(0);
      setIsAnimating(false);
      setCurrentIndex(prev => prev + 1);
    });
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!currentRestaurant || isAnimating) return;
    
    await checkForMatch(currentRestaurant.id, direction);
    animateCardOut(direction);
  };

  const nextRestaurant = restaurants[currentIndex + 1];

  const renderBackgroundCard = () => {
    if (!nextRestaurant) {
      return null;
    }

    return (
      <View style={[styles.card, styles.backgroundCard]}>
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

  useEffect(() => {
    if (currentIndex >= restaurants.length) {
      setCurrentScreen('matches');
    }
  }, [currentIndex, restaurants.length]);
  
  if (currentScreen === 'matches') {
    return <MatchesScreen roomData={roomData} user={user} />;
  }

  const cardAnimatedStyle = {
    transform: [
      { translateX: cardTranslateX },
      { 
        rotate: cardRotation.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: ['-30deg', '0deg', '30deg'],
        })
      }
    ],
    opacity: cardOpacity,
  };

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
          {/* Background card */}
          {renderBackgroundCard()}
          
          {/* Current card with animation */}
          {currentRestaurant && (
            <Animated.View style={[styles.card, styles.topCard, cardAnimatedStyle]}>
              <PanGestureHandler
                onGestureEvent={(event) => {
                  if (!isAnimating) {
                    const { translationX } = event.nativeEvent;
                    cardTranslateX.setValue(translationX);
                    cardRotation.setValue(translationX / 300); // Rotation based on translation
                  }
                }}
                onHandlerStateChange={(event) => {
                  if (event.nativeEvent.state === 5 && !isAnimating) { // END state
                    const { translationX, velocityX } = event.nativeEvent;
                    const swipeThreshold = 100;
                    const velocityThreshold = 500;
                    
                    if (translationX > swipeThreshold || velocityX > velocityThreshold) {
                      handleSwipe('right');
                    } else if (translationX < -swipeThreshold || velocityX < -velocityThreshold) {
                      handleSwipe('left');
                    } else {
                      // Snap back to center
                      Animated.parallel([
                        Animated.spring(cardTranslateX, {
                          toValue: 0,
                          useNativeDriver: true,
                        }),
                        Animated.spring(cardRotation, {
                          toValue: 0,
                          useNativeDriver: true,
                        }),
                      ]).start();
                    }
                  }
                }}
              >
                <View>
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
              </PanGestureHandler>
            </Animated.View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.actionButton}
            onPress={() => handleSwipe('left')}
            disabled={isAnimating}
          >
            <Text style={styles.buttonIcon}>✗</Text>
          </Pressable>
          
          <Pressable
            style={styles.actionButton}
            onPress={() => handleSwipe('right')}
            disabled={isAnimating}
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
    flex: 0.95,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cardContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 350,
    justifyContent: 'center',
    position: 'relative',
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
  topCard: {
    position: 'absolute',
    width: '100%',
    zIndex: 2,
  },
  backgroundCard: {
    position: 'absolute',
    width: '100%',
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
    zIndex: 1,
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
  buttonIcon: {
    fontSize: 28,
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
    fontSize: 13,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.8,
    fontStyle: 'italic',
  },
});