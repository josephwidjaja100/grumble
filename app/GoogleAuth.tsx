import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { Image, Pressable, StyleSheet, Text, View, Alert } from "react-native";

export default function () {
  GoogleSignin.configure({
    webClientId: '155134834532-lams2c6hbc5clr31b68700rv7a3hcrq9.apps.googleusercontent.com', // client ID of type WEB for your server. Required to get the `idToken` on the user object, and for offline access.
    scopes: ['profile', 'email', 'openid'], // what API you want to access on behalf of the user, default is email and profile
    iosClientId: '155134834532-pgght1hkbk8p7uskrdprgc7l0h1ks7mf.apps.googleusercontent.com',
  });

  return (
    <View style={styles.googleButtonWrapper}>
      <Pressable
        style={styles.googleButton}
        onPress={async () => {
          try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            console.log(JSON.stringify(userInfo, null, 2));
          } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
              // user cancelled the login flow
              Alert.alert('Cancelled', 'Login was cancelled');
            } else if (error.code === statusCodes.IN_PROGRESS) {
              // operation (e.g. sign in) is in progress already
              Alert.alert('In Progress', 'Login is already in progress');
            } else {
              console.log(error);
              Alert.alert('Error', 'An error occurred during login');
            }
          }
        }}
      >
        <Image
          source={require("../assets/images/google-icon.png")}
          style={styles.googleIcon}
        />
        <Text style={styles.googleButtonText}>Sign in with Google</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  googleButtonWrapper: {
    marginTop: 0,
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 10,
    paddingHorizontal: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 2,
  },
  googleIcon: {
    width: 22,
    height: 22,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 11,
    overflow: 'hidden',
  },
  googleButtonText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '600',
    letterSpacing: 0.2,
    flexShrink: 0,
  },
});