import {NavigationProp} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  Keyboard,
  TouchableHighlight,
} from 'react-native';
import {Paths} from '../../../navigation/path';
import CheckBoxIcon from 'react-native-elements/dist/checkbox/CheckBoxIcon';
import {signUpAPI} from '../../../service/auth-requests';
import Loader from '../../../components/loader';
import Toast from 'react-native-toast-message';

interface SignUpScreenProps {
  navigation: NavigationProp<any>; // Add explicit type for navigation
}

export default function SignUpScreen({navigation}: SignUpScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function signUp() {
    setIsLoading(true);
    if (!agree || !name || !email || !password || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: '😬',
        text2: 'Provide correct data!',
        position: 'bottom',
      });
      setIsLoading(false);
      return;
    }

    try {
      const response: any = await signUpAPI({
        email,
        password,
        name,
        loginType: 'email',
      });
      if (response && response.status === 200) {
        Toast.show({
          type: 'success',
          text1: '😬',
          text2: 'Sign Up Successful! Please login.',
          position: 'bottom',
        });
        navigation.navigate(Paths.SignIn);
      } else {
        Toast.show({
          type: 'error',
          text1: '😬',
          text2: 'Try again',
          position: 'bottom',
        });
      }
    } catch (e) {
      console.log(e);
      Alert.alert('Error! Try again.');
    }
    setIsLoading(false);
  }

  return isLoading ? (
    <Loader loaderText={'Signing you up...'} />
  ) : (
    <ScrollView>
      <TouchableHighlight onPress={Keyboard.dismiss} style={styles.container}>
        <>
          <Text style={styles.logo}>REALITY REGISTRY</Text>
          <View style={styles.imgCon}>
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
            placeholderTextColor="grey"
            onChangeText={text => setName(text)}
          />

          <TextInput
            style={styles.input}
            placeholder="Your email"
            keyboardType="email-address"
            value={email}
            placeholderTextColor="grey"
            onChangeText={text => setEmail(text)}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={true}
            value={password}
            placeholderTextColor="grey"
            onChangeText={text => setPassword(text)}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry={true}
            value={confirmPassword}
            onChangeText={text => setConfirmPassword(text)}
            placeholderTextColor="grey"
          />

          <View style={styles.agreement}>
            <CheckBoxIcon
              checked={agree}
              onIconPress={() => setAgree(!agree)}
            />
            <Text style={styles.agreementText}>
              I agree to the <Text style={styles.link}>Terms of Service</Text>{' '}
              and <Text style={styles.link}>Privacy Policy</Text>.
            </Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={signUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate(Paths.SignIn)}>
            <Text style={styles.linkText}>
              Already have an account? Sign in
            </Text>
          </TouchableOpacity>
        </>
      </TouchableHighlight>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 300,
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
    flexWrap: 'wrap',
    flex: 1,
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
    width: 100,
    height: 100,
    backgroundColor: '#FFF', // Placeholder for logo background
    marginBottom: 10,
  },
  imgCon: {width: '100%', alignItems: 'center'},
});
