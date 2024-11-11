import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AuthStack from './AuthNavigator';
import HomeStack from './HomeNavigator';
import {useAuth} from '../components/authProvider';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const {isLoggedIn} = useAuth(); // Get login status from AuthContext
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {isLoggedIn ? (
          <Stack.Screen name="Home" component={HomeStack} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
