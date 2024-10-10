import React from 'react';
import VideoCamera from './src/components/video-camera';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Verify from './src/components/verify';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native';

const App: React.FC = () => {
  const Stack = createNativeStackNavigator();
  return (
    <SafeAreaView style={{flex: 1}}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Record" component={VideoCamera} />
          <Stack.Screen name="Verify" component={Verify} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
};

export default App;
