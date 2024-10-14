import { NavigationProp } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { Paths } from '../../../navigation/path';

interface SignUpScreenProps {
  navigation: NavigationProp<any>;  // Add explicit type for navigation
}

export default function SignUpScreen({ navigation }: SignUpScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // const [agree, setAgree] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>REALITY REGISTRY</Text>
      <View style={{width: '100%', alignItems: 'center'}}>
        <Image
          style={styles.rr_logo}
          source={require('../../../../android/assets/images/logo.png')}
        />
        </View>
      <Text style={styles.subTitle}>Create account</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={(text) => setName(text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Your email"
        keyboardType="email-address"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={(text) => setPassword(text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry={true}
        value={confirmPassword}
        onChangeText={(text) => setConfirmPassword(text)}
      />

      <View style={styles.agreement}>
        {/* <CheckBox
          value={agree}
          onValueChange={() => setAgree(!agree)}
        /> */}
        <Text style={styles.agreementText}>I agree to the <Text style={styles.link}>Terms of Service</Text> and <Text style={styles.link}>Privacy Policy</Text>.</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => Alert.alert('Sign Up Successful!')}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate(Paths.SignIn)}>
        <Text style={styles.linkText}>Already have an account? Sign in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    fontWeight: 'bold',
    fontSize: 28,
    color: '#007AFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  agreement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  agreementText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  rr_logo: {
    width: 80,
    height: 80,
    backgroundColor: '#ccc', // Placeholder for logo background
    borderRadius: 40,
    marginBottom: 10,
  },
});
