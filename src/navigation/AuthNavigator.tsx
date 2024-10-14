import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { Paths } from './path';
import SignInScreen from '../screens/authentication/login/SignInScreen';
import SignUpScreen from '../screens/authentication/signup/SignUpScreen';



const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator initialRouteName={'Auth'} screenOptions={{ headerShown: false }}>
      <Stack.Screen name={Paths.SignIn} component={SignInScreen} />
      <Stack.Screen name={Paths.SignUp} component={SignUpScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
