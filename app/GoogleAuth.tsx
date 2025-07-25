import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { Image, Pressable, StyleSheet, Text, View, Alert } from 'react-native';
import { GoogleAuthProvider, getAuth, signInWithCredential }  from '@react-native-firebase/auth'

export default function () {
  GoogleSignin.configure({
    webClientId: '28290380318-773ceo520kqdk7bpl5mcmc1274nst4c1.apps.googleusercontent.com', 
    scopes: ['profile', 'email', 'openid'], 
    iosClientId: '28290380318-up082tft5jsbv5q70jas5b7eqrtor17p.apps.googleusercontent.com',
  });

  return (
    <View style={styles.googleButtonWrapper}>
      <Pressable
        style={styles.googleButton}
        onPress={async () => {
          try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            if(userInfo.data){
              const idToken = GoogleAuthProvider.credential(userInfo.data.idToken);
              console.log(JSON.stringify(userInfo, null, 2));
              signInWithCredential(getAuth(), idToken);
            }
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
    color: '#7084D7',
    fontWeight: '600',
    letterSpacing: 0.2,
    flexShrink: 0,
  },
});