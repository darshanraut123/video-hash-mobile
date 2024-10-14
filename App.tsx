

import React from 'react';
// import VideoCamera from './src/components/video-camera';
// import {NavigationContainer} from '@react-navigation/native';
// import {createStackNavigator} from '@react-navigation/stack';
// import SignInScreen from './src/screens/authentication/login/SignInScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/RootNavigator';
import Header from './src/components/Header';


// const Stack = createStackNavigator();

const App: React.FC = () => {
  // return <VideoCamera />;
  return (
    <GestureHandlerRootView>
      <Header />
      <AppNavigator />
    </GestureHandlerRootView>
  );
};

export default App;
