import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import { Paths } from './path';
import SignInScreen from '../screens/authentication/login/SignInScreen';
import SignUpScreen from '../screens/authentication/signup/SignUpScreen';



const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator initialRouteName={Paths.Auth} screenOptions={{ headerShown: false }}>
      <Stack.Screen name={Paths.SignIn} component={SignInScreen} />
      <Stack.Screen name={Paths.SignUp} component={SignUpScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
