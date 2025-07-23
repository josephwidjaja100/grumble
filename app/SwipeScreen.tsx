import React, { useState, useEffect, useRef } from "react";
import { 
  Image, 
  Pressable, 
  StyleSheet, 
  Text, 
  View, 
  Animated, 
  Dimensions,
  Alert 
} from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Mock restaurant data - in real app, this would come from an API
const mockRestaurants = [
  {
    id: 1,
    name: "Tony's Italian Bistro",
    cuisine: "Italian",
    rating: 4.5,
    image: "https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Italian",
    description: "Authentic Italian cuisine with fresh pasta"
  },
  {
    id: 2,
    name: "Sakura Sushi",
    cuisine: "Japanese",
    rating: 4.7,
    image: "https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Sushi",
    description: "Fresh sushi and traditional Japanese dishes"
  },
  {
    id: 3,
    name: "El Mariachi",
    cuisine: "Mexican",
    rating: 4.3,
    image: "https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=Mexican",
    description: "Authentic Mexican flavors and vibrant atmosphere"
  },
  {
    id: 4,
    name: "The Burger Joint",
    cuisine: "American",
    rating: 4.2,
    image: "https://via.placeholder.com/300x200/F39C12/FFFFFF?text=Burgers",
    description: "Gourmet burgers made with premium ingredients"
  }
];

export default function SwipeScreen({ roomData: initialRoomData, user }) {
  const [restaurants] = useState(mockRestaurants);
  const [currentRestaurantIndex, setCurrentRestaurantIndex] = useState(0);
  const [userSwipes, setUserSwipes] = useState({});
  const [matches, setMatches] = useState([]);
  const [showMatch, setShowMatch] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [roomData, setRoomData] = useState(initialRoomData);
  
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const currentRestaurant = restaurants[currentRestaurantIndex];

  // Listen for real-time room updates
  useEffect(() => {
    // This would be where you set up a real-time listener to Firebase Firestore
    // For example, using onSnapshot to listen for changes to the room document
    
    // const unsubscribe = firestore()
    //   .collection('rooms')
    //   .doc(roomData.code)
    //   .onSnapshot((documentSnapshot) => {
    //     if (documentSnapshot.exists) {
    //       const updatedRoomData = documentSnapshot.data();
    //       setRoomData(updatedRoomData);
    //       setUserSwipes(updatedRoomData.userSwipes || {});
    //       setMatches(updatedRoomData.matches || []);
    //     }
    //   });

    // return () => unsubscribe();

    // For now, we'll simulate real-time updates with a simple interval
    const simulateRealTimeUpdates = setInterval(() => {
      // In a real app, this would be handled by the Firebase listener above
      console.log('Checking for room updates...');
    }, 5000);

    return () => clearInterval(simulateRealTimeUpdates);
  }, []);

  // Update room data in Firebase when user swipes
  const updateRoomData = async (newUserSwipes, newMatches = matches) => {
    const updatedRoomData = {
      ...roomData,
      userSwipes: newUserSwipes,
      matches: newMatches,
      lastUpdated: new Date().toISOString()
    };

    // This is where you would update Firebase Firestore
    // await firestore()
    //   .collection('rooms')
    //   .doc(roomData.code)
    //   .update(updatedRoomData);

    console.log('Would update room data:', updatedRoomData);
  };

  const handleSwipe = (direction) => {
    const restaurantId = currentRestaurant.id;
    const isRightSwipe = direction === 'right';
    
    // Update user swipes
    const newUserSwipes = {
      ...userSwipes,
      [`${restaurantId}_${user.uid}`]: isRightSwipe
    };
    setUserSwipes(newUserSwipes);

    // Check if all users in room have swiped on this restaurant
    const allUserIds = roomData.users;
    const swipesForRestaurant = allUserIds.every(userId => 
      newUserSwipes[`${restaurantId}_${userId}`] !== undefined
    );

    if (swipesForRestaurant) {
      // Check if all users swiped right
      const allSwipedRight = allUserIds.every(userId => 
        newUserSwipes[`${restaurantId}_${userId}`] === true
      );

      if (allSwipedRight) {
        // It's a match!
        setCurrentMatch(currentRestaurant);
        setShowMatch(true);
        
        const newMatches = [...matches, currentRestaurant];
        setMatches(newMatches);
        
        // Update room data with new match
        updateRoomData(newUserSwipes, newMatches);
        
        setTimeout(() => {
          setShowMatch(false);
        }, 4000);
      } else {
        // Update room data even if no match
        updateRoomData(newUserSwipes);
      }
    } else {
      // Update room data with new swipe
      updateRoomData(newUserSwipes);
    }

    // Animate card out and move to next restaurant
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: direction === 'right' ? screenWidth : -screenWidth,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Reset animations and move to next restaurant
      translateX.setValue(0);
      opacity.setValue(1);
      setCurrentRestaurantIndex((prev) => (prev + 1) % restaurants.length);
    });
  };

  if (showMatch && currentMatch) {
    return (
      <View style={styles.matchContainer}>
        <View style={styles.matchCard}>
          <Text style={styles.matchTitle}>🎉 IT'S A MATCH! 🎉</Text>
          <View style={styles.matchRestaurantInfo}>
            <Text style={styles.matchRestaurantName}>{currentMatch.name}</Text>
            <Text style={styles.matchRestaurantCuisine}>{currentMatch.cuisine}</Text>
            <Text style={styles.matchRestaurantRating}>⭐ {currentMatch.rating}</Text>
          </View>
          <Text style={styles.matchDescription}>
            Everyone in the room loves this place!
          </Text>
          <Text style={styles.matchSubtext}>
            {currentMatch.description}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Room: {roomData.code}</Text>
        <Text style={styles.usersText}>
          Users ({roomData.users.length}): {Object.values(roomData.userNames).join(', ')}
        </Text>
      </View>

      {matches.length > 0 && (
        <View style={styles.matchesHeader}>
          <Text style={styles.matchesText}>Matches: {matches.length}</Text>
        </View>
      )}

      <View style={styles.cardContainer}>
        <Animated.View 
          style={[
            styles.restaurantCard,
            {
              transform: [{ translateX }],
              opacity,
            }
          ]}
        >
          <View style={styles.restaurantImage}>
            <Text style={styles.placeholderImage}>{currentRestaurant.cuisine}</Text>
          </View>
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{currentRestaurant.name}</Text>
            <Text style={styles.restaurantCuisine}>{currentRestaurant.cuisine}</Text>
            <Text style={styles.restaurantRating}>⭐ {currentRestaurant.rating}</Text>
            <Text style={styles.restaurantDescription}>{currentRestaurant.description}</Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable 
          style={[styles.swipeButton, styles.rejectButton]} 
          onPress={() => handleSwipe('left')}
        >
          <Text style={styles.buttonText}>✕</Text>
        </Pressable>
        
        <Pressable 
          style={[styles.swipeButton, styles.likeButton]} 
          onPress={() => handleSwipe('right')}
        >
          <Text style={styles.buttonText}>♥</Text>
        </Pressable>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {currentRestaurantIndex + 1} of {restaurants.length}
        </Text>
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
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  usersText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  matchesHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  matchesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  restaurantImage: {
    height: 200,
    backgroundColor: '#f0f0f0',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderImage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#999',
  },
  restaurantInfo: {
    padding: 20,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  restaurantCuisine: {
    fontSize: 18,
    color: '#7084D7',
    fontWeight: '600',
    marginBottom: 8,
  },
  restaurantRating: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  restaurantDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 60,
    paddingBottom: 40,
  },
  swipeButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  rejectButton: {
    backgroundColor: '#FF6B6B',
  },
  likeButton: {
    backgroundColor: '#4ECDC4',
  },
  buttonText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  progressContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  matchContainer: {
    flex: 1,
    backgroundColor: "#A0AEE4",
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 40,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 15,
  },
  matchTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7084D7',
    marginBottom: 20,
    textAlign: 'center',
  },
  matchRestaurantInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  matchRestaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  matchRestaurantCuisine: {
    fontSize: 18,
    color: '#7084D7',
    marginBottom: 8,
  },
  matchRestaurantRating: {
    fontSize: 16,
    color: '#666',
  },
  matchDescription: {
    fontSize: 18,
    color: '#4ECDC4',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
  },
  matchSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});