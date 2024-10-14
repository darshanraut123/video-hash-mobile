// src/navigation/AppNavigator.js
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
// import { useSelector } from 'react-redux';
import AuthStack from './AuthNavigator';
import {SafeAreaProvider} from 'react-native-safe-area-context';

const Stack = createStackNavigator();

const AppNavigator = () => {
  //   const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen name="Auth" component={AuthStack} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default AppNavigator;
