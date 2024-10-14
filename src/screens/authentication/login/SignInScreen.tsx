import { NavigationProp } from '@react-navigation/native';
import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import {CheckBox, Button, Icon} from 'react-native-elements';
import { Paths } from '../../../navigation/path';

const {width} = Dimensions.get('window');

interface SignInScreenProps {
  navigation: NavigationProp<any>;  // Add explicit type for navigation
}

const SignInScreen = ({ navigation }: SignInScreenProps) => {
  return (
    <View style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton}>
        <Icon name="close" size={24} color="#000" />
      </TouchableOpacity>

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
          placeholder="name.name@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
        />
        <View style={styles.options}>
          <CheckBox
            title="Remember me"
            checked={false}
            containerStyle={styles.checkbox}
          />
          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Sign In Button */}
        <Button title="Sign In" buttonStyle={styles.signInButton} />
        <TouchableOpacity style={styles.signUp} onPress={() => {
          navigation.navigate(Paths.Auth, { screen: Paths.SignUp });
        }}>
          <Text>
            Don't have an account?{' '}
            <Text style={styles.signUpText}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Face ID Button */}
      <View style={{ alignItems: 'center' }}>
        <Image
          style={styles.face_id_logo}
          source={require('../../../../android/assets/images/face-id.png')}
        />
      </View>
      <TouchableOpacity style={styles.faceIDButton}>
        {/* <Icon name="face" size={32} color="#000" /> */}
        <Text style={styles.faceIDText}>Use Face ID</Text>
      </TouchableOpacity>
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


