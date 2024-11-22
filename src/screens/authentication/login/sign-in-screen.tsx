import {NavigationProp} from '@react-navigation/native';
import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import {Button} from 'react-native-elements';
import {Paths} from '../../../navigation/path';
import {useAuth} from '../../../components/auth-provider';
import Loader from '../../../components/loader';
import OauthSignIn from '../../../components/oauth-signIn';
import Toast from 'react-native-toast-message';

interface SignInScreenProps {
  navigation: NavigationProp<any>; // Add explicit type for navigation
}

const SignInScreen = ({navigation}: SignInScreenProps) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const {login, isLoading} = useAuth(); // Get login status from AuthContext

  function onLogibBtnClick() {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: '😬',
        text2: 'Provide email and password',
        position: 'bottom',
      });
      return;
    }
    login({password, email, loginType: 'email'});
  }

  return isLoading ? (
    <Loader loaderText={'Logging in...'} />
  ) : (
    <View style={styles.container}>
      <Toast />
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Image
            style={styles.logo}
            source={require('../../../../android/assets/images/logo.png')}
          />
          <Text style={styles.title}>REALITY REGISTRY</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Your email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email..."
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={setEmail}
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password..."
            secureTextEntry
            onChangeText={setPassword}
          />
          {/* <View style={styles.options}>
            <CheckBox
              style={styles.checkbox}
              onClick={() => {
                console.log();
              }}
              isChecked={true}
              rightText={'Remember me'}
            />
            <TouchableOpacity>
              <Text style={styles.forgotPassword}>Forgot password?</Text>
            </TouchableOpacity>
          </View> */}

          {/* Sign In Button */}
          <Button
            title="Sign In"
            buttonStyle={styles.signInButton}
            onPress={onLogibBtnClick}
          />
          <TouchableOpacity
            style={styles.signUp}
            onPress={() => {
              navigation.navigate(Paths.Auth, {screen: Paths.SignUp});
            }}>
            <Text>
              Don't have an account?{'  '}
              <Text style={styles.signUpText}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />
        <OauthSignIn />
      </ScrollView>
    </View>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: '#ccc', // Placeholder for logo background
    borderRadius: 40,
    marginBottom: 10,
  },
  face_id_logo: {
    width: 60,
    height: 60,
    backgroundColor: '#fff', // Placeholder for logo background
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    padding: 0,
  },
  forgotPassword: {
    color: '#007AFF',
  },
  signInButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 5,
  },
  signUp: {
    alignItems: 'center',
    marginTop: 15,
  },
  signUpText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginVertical: 20,
  },
  faceIDButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  faceIDText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
});
