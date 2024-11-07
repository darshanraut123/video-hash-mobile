import {Alert, View} from 'react-native';
import React from 'react';
import {
  GoogleSignin,
  GoogleSigninButton,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {signUpAPI} from '../service/authrequests';
import {useAuth} from './authProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
            console.log(JSON.stringify(response.data));
            const token =
              apiresponse.data.user.googleToken || apiresponse.data.user.token;
            await AsyncStorage.setItem('token', token);
            setLoginStatus(true);
            console.log('Logged in');
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

  return (
    <View>
      <GoogleSigninButton
        color="light"
        onPress={onGoogleButtonPress}
        style={{width: '100%'}}
      />
    </View>
  );
}
