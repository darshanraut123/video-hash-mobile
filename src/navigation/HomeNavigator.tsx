import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {Paths} from './path';
import VideoCamera from '../components/video-camera';
import Verify from '../components/verify';
import VideoLibrary from '../screens/video-library/VideoLibrary';

const Stack = createNativeStackNavigator();

const HomeStack = () => {
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
