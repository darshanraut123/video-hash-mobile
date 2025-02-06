import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Paths} from './path';
import VideoCamera from '../screens/main-screens/video-camera/video-camera';
import Verify from '../screens/main-screens/verify-screen/verify-screen';
import VideoLibrary from '../screens/video-library/video-library';
import PhotoLibrary from '../screens/photo-library/photo-library';
import FeedbackComponent from '../screens/main-screens/feedback/feedback';
import Goto from '../screens/main-screens/Goto';

const Stack = createNativeStackNavigator();

const HomeStack: React.FC<any> = () => {
  return (
    <Stack.Navigator
      initialRouteName={Paths.VideoCamera}
      screenOptions={{headerShown: false}}>
      <Stack.Screen name={Paths.VideoCamera} component={VideoCamera} />
      <Stack.Screen name={Paths.Goto} component={Goto} />
      <Stack.Screen name={Paths.Verify} component={Verify} />
      <Stack.Screen name={Paths.VideoLibrary} component={VideoLibrary} />
      <Stack.Screen name={Paths.PhotoLibrary} component={PhotoLibrary} />
      <Stack.Screen name={Paths.FeedBack} component={FeedbackComponent} />
    </Stack.Navigator>
  );
};

export default HomeStack;
