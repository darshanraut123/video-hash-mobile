// src/context/AuthContext.ts
import React, {createContext, useState, useContext, ReactNode} from 'react';
import {loginAPI} from '../service/authrequests';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert} from 'react-native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

// Define the context interface
interface AuthContextProps {
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (body: any) => void;
  logout: () => void;
  setLoginStatus: (loginSatus: boolean) => void;
  setLoadingStatus: (loadingSatus: boolean) => void;
}

// Provide a default context value with the correct types
const AuthContext = createContext<AuthContextProps>({
  isLoggedIn: false,
  isLoading: false,
  login: () => {},
  logout: () => {},
  setLoginStatus: () => {},
  setLoadingStatus: () => {},
});

export const AuthProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (body: any) => {
    setIsLoading(true);
    const response: any = await loginAPI(body);
    if (response && response.status === 200 && response.data) {
      const token = response.data.user?.googleToken || response.data.user.token;
      console.log(JSON.stringify(response.data));
      console.log('token', token);
      setAsyncStorage('token', token);
      setIsLoggedIn(true);
    } else {
      Alert.alert('Login failed!');
      setIsLoggedIn(false);
    }
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoggedIn(false);
    await GoogleSignin.signOut();
    await AsyncStorage.removeItem('token');
  };

  React.useEffect(() => {
    const asyncFunction = async () => {
      console.log('getting token from async storage');
      let token: any = await getAsyncStorage('token');
      console.log('Token: ' + token);
      if (!token) {
        logout();
        return;
      } else {
        setIsLoggedIn(true);
      }
      // try {
      //   const response = await authCheckAPI(token);
      //   console.log('authCheckAPI response: ' + response);
      //   if (!response || response.status !== 200) {
      //     logout();
      //   } else {
      //     setIsLoggedIn(true);
      //   }
      // } catch (error) {
      //   console.error('Auth check failed:', error);
      //   logout();
      // }
    };
    asyncFunction();
  }, []);

  async function setAsyncStorage(key: string, value: string) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.log(e);
    }
  }

  async function getAsyncStorage(key: string) {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.log(e);
    }
  }

  async function setLoginStatus(loginSatus: boolean) {
    setIsLoggedIn(loginSatus);
  }

  async function setLoadingStatus(loadingSatus: boolean) {
    setIsLoading(loadingSatus);
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        login,
        logout,
        setLoginStatus,
        setLoadingStatus,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
