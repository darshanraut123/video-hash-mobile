import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {saveFeedback} from '../../../service/hash-requests';
import {Paths} from '../../../navigation/path';
import Loader from '../../../components/loader';

const FeedbackComponent = ({navigation}: any) => {
  const [feedback, setFeedback] = useState('');
  const [isLoading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      if (!feedback.trim()) {
        Alert.alert(
          'Feedback',
          'Please provide your feedback before submitting.',
        );
        return;
      }
      setLoading(true);
      let user: any = await AsyncStorage.getItem('user');
      if (user) {
        user = JSON.parse(user);
        const body = {email: user.email, message: feedback};
        console.log(body);
        await saveFeedback(body);
        Alert.alert('Feedback Submitted', 'Thank you for your feedback!');
        setFeedback(''); // Clear the feedback after submission
        navigation.navigate(Paths.VideoCamera);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && <Loader loaderText="Submitting..." />}

      <Text style={styles.title}>We Value Your Feedback</Text>
      <TextInput
        style={styles.textBox}
        placeholder="Write your feedback here..."
        multiline
        value={feedback}
        onChangeText={setFeedback}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  textBox: {
    width: '100%',
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    fontSize: 16,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default FeedbackComponent;
