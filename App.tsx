import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/rootNavigator';
import {AuthProvider} from './src/components/authProvider';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

const App: React.FC = () => {
  React.useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '589493241267-sa19b7j64ku4qls3e619l82nj4h1kr66.apps.googleusercontent.com',
    });
    console.log('GoogleSignin configured');
  }, []);
  return (
    <SafeAreaView style={{flex: 1}}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaView>
  );
};

export default App;
