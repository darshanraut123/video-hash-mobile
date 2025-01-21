import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {signUpAPI} from '../service/auth-requests';
import {useAuth} from './auth-provider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import {LoginManager, AccessToken} from 'react-native-fbsdk-next';
import Toast from 'react-native-toast-message';
const googleLogo =
  'https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-1024.png';
const facebookLogo =
  'https://cdn2.iconfinder.com/data/icons/social-media-2285/512/1_Facebook_colored_svg_copy-1024.png';

export default function OauthSignIn() {
  // Somewhere in your code
  const {setLoadingStatus, setLoginStatus} = useAuth(); // Get login status from AuthContext

  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      console.log('userInfo: ' + JSON.stringify(response.data));
      if (isSuccessResponse(response)) {
        setLoadingStatus(true);

        try {
          const apiresponse: any = await signUpAPI({
            googleToken: response.data.idToken,
            email: response.data.user.email,
            name: response.data.user.name,
            loginType: 'google',
          });
          if (apiresponse && apiresponse.status === 200) {
            console.log(JSON.stringify(apiresponse.data));
            const token =
              apiresponse.data.user.googleToken || apiresponse.data.user.token;
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem(
              'user',
              JSON.stringify(apiresponse.data.user),
            );
            setLoginStatus(true);
            console.log('Logged in');
            console.log(JSON.stringify(apiresponse.data.user));
          } else {
            Alert.alert('Sign Up Failed! Try again.');
          }
        } catch (e) {
          console.log(e);
          Alert.alert('Error! Try again.');
        }
      } else {
        // sign in was cancelled by user
        console.log('sign in was cancelled by user');
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            // operation (eg. sign in) already in progress
            console.log('operation (eg. sign in) already in progress');

            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // Android only, play services not available or outdated
            console.log(
              'Android only, play services not available or outdated',
            );

            break;
          default:
          // some other error happened
        }
      } else {
        // an error that's not related to google sign in occurred
        console.log('an error thats not related to google sign in occurred');
      }
    }
    setLoadingStatus(false);
  };

  async function onFacebookButtonPress() {
    try {
      // Attempt login with permissions
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ]);

      if (result.isCancelled) {
        throw 'User cancelled the login process';
      }

      // Once signed in, get the users AccessToken
      const data = await AccessToken.getCurrentAccessToken();

      if (!data) {
        throw 'Something went wrong obtaining access token';
      }
      console.log('data: ' + JSON.stringify(data));

      const facebookCredential = auth.FacebookAuthProvider.credential(
        data.accessToken,
      );
      setLoadingStatus(true);

      // Sign-in the user with the credential
      const moreInfoFb = await auth().signInWithCredential(facebookCredential);
      console.log('moreInfoFb: ' + JSON.stringify(moreInfoFb));
      const apiresponse: any = await signUpAPI({
        googleToken: data.accessToken,
        email: moreInfoFb.user.email,
        name: moreInfoFb.user.displayName,
        loginType: 'google',
      });
      if (apiresponse && apiresponse.status === 200) {
        console.log(JSON.stringify(apiresponse.data));
        const token =
          apiresponse.data.user.googleToken || apiresponse.data.user.token;
        await AsyncStorage.setItem('token', token);
        setLoginStatus(true);
        console.log('Logged in');
        console.log(JSON.stringify(apiresponse.data.user));
      } else {
        Toast.show({
          type: 'info',
          text1: 'Sign Up Failed! Try again. 👋',
          position: 'bottom',
        });
      }
    } catch (e) {
      console.log(e);
      Toast.show({
        type: 'info',
        text1: 'Error! Try again. 👋',
        position: 'bottom',
      });
    }
    setLoadingStatus(false);
  }

  return (
    <View style={styles.container}>
      {/* Google Sign-In Button */}
      <TouchableOpacity
        style={styles.googleButton}
        onPress={onGoogleButtonPress}>
        <Image source={{uri: googleLogo}} style={styles.logo} />
        <Text style={styles.buttonText}>Sign in with Google</Text>
      </TouchableOpacity>

      {/* Facebook Sign-In Button */}
      <TouchableOpacity
        style={styles.facebookButton}
        onPress={() =>
          onFacebookButtonPress().then(() =>
            console.log('Signed in with Facebook!'),
          )
        }>
        <Image source={{uri: facebookLogo}} style={styles.logo} />
        <Text style={styles.buttonText}>Sign in with Facebook</Text>
      </TouchableOpacity>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffa031',
    borderColor: '#ffa031',
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    width: '80%',
    justifyContent: 'center',
  },
  facebookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1877F2',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    width: '80%',
    justifyContent: 'center',
  },
  logo: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
