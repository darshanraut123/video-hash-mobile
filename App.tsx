import React from 'react';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/root-navigator';
import {AuthProvider} from './src/components/auth-provider';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {resetTasksOnAppStart} from './src/util/queue';
import {StyleSheet} from 'react-native';
import {useGetShare} from './src/screens/main-screens/video-camera/useGetShare';
import TaskRunner from './task-runner';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://44f6c02b289242e785b6f9745f2b8225@o4508617635659776.ingest.us.sentry.io/4508617637298176',
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0,
  // profilesSampleRate is relative to tracesSampleRate.
  // Here, we'll capture profiles for 100% of transactions.
  profilesSampleRate: 1.0,
});

const App: React.FC = () => {
  useGetShare();
  React.useEffect(() => {
    resetTasksOnAppStart();
    GoogleSignin.configure({
      webClientId:
        '589493241267-sa19b7j64ku4qls3e619l82nj4h1kr66.apps.googleusercontent.com',
    });
    console.log('GoogleSignin configured');
  }, []);
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.appContainer}>
        <AuthProvider>
          <TaskRunner />
          <AppNavigator />
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  appContainer: {flex: 1},
});

export default App;
