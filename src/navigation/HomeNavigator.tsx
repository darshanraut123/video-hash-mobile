import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';
import {Paths} from './path';
import VideoCamera from '../components/video-camera';
import Verify from '../components/verify';
import VideoLibrary from '../screens/video-library/VideoLibrary';

const Stack = createNativeStackNavigator();

const HomeStack: React.FC<any> = ({navigation}) => {
  React.useEffect(() => {
    // To get All Recived Urls
    ReceiveSharingIntent.getReceivedFiles(
      (files: any) => {
        console.log('Intent: ' + JSON.stringify(files));
        if (files.length) {
          navigation.navigate(Paths.Verify, {path: files[0].filePath});
          console.log('NAVIGATED');
        } else {
          console.log('NOT NAVIGATED');
        }
      },
      (error: any) => {
        console.log(error);
      },
      'com.VideoHash', // share url protocol (must be unique to your app, suggest using your apple bundle id)
    );
    return () => {
      ReceiveSharingIntent.clearReceivedFiles();
    };
  }, []);

  return (
    <Stack.Navigator
      initialRouteName={Paths.VideoCamera}
      screenOptions={{headerShown: false}}>
      <Stack.Screen name={Paths.VideoCamera} component={VideoCamera} />
      <Stack.Screen name={Paths.Verify} component={Verify} />
      <Stack.Screen name={Paths.VideoLibrary} component={VideoLibrary} />
    </Stack.Navigator>
  );
};

export default HomeStack;
