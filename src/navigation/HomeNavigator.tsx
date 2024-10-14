import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import { Paths } from './path';
import VideoCamera from '../components/video-camera';
import Verify from '../components/verify';



const Stack = createNativeStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator initialRouteName={Paths.Home} screenOptions={{ headerShown: false }}>
      <Stack.Screen name={Paths.VideoCamera} component={VideoCamera} />
      <Stack.Screen name={Paths.Verify} component={Verify} />
    </Stack.Navigator>
  );
};

export default HomeStack;
