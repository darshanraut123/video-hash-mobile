import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {saveFeedback} from '../../../service/hash-requests';
import {Paths} from '../../../navigation/path';
import Loader from '../../../components/loader';
import Ionicon from 'react-native-vector-icons/Ionicons';
import Header from '../../../components/header';

const FeedbackComponent = ({navigation}: any) => {
  const [feedback, setFeedback] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [selectedRating, setSelectedRating] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState<any>(false);

  const handleSubmit = async () => {
    try {
      if (!selectedRating) {
        Alert.alert('Please select a rating!');
        return;
      }
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
        const body = {
          email: user.email,
          message: feedback,
          rating: selectedRating,
        };
        console.log(body);
        await saveFeedback(body);
        Alert.alert('Feedback Submitted', 'Thank you for your feedback!');
        setFeedback(''); // Clear the feedback after submission
        setIsSubmitted(true);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const ratings = [
    {label: 'Terrible', value: 1},
    {label: 'Poor', value: 2},
    {label: 'Average', value: 3},
    {label: 'Good', value: 4},
    {label: 'Great', value: 5},
  ];

  if (isLoading) {
    return <Loader />;
  } else {
    return (
      <>
        <ScrollView>
          <Header
            screenName="Feedback"
            onBackArrowPress={() => navigation.navigate(Paths.VideoCamera)}
            onMenuPress={() => navigation.navigate(Paths.Goto)}
          />
          {isSubmitted ? (
            <View style={styles.container}>
              <View style={styles.tytxt}>
                <Text>Thank you for your feedback</Text>
              </View>
              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => navigation.navigate(Paths.VideoCamera)}>
                <Text style={styles.submitButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.container}>
              {/* Rating Section */}
              <Text style={styles.sectionTitle}>RATE YOUR EXPERIENCE</Text>
              <View style={styles.ratingContainer}>
                {ratings.map(rating => (
                  <TouchableOpacity
                    key={rating.value}
                    onPress={() => setSelectedRating(rating.value)}
                    style={styles.ratingItem}>
                    <Ionicon
                      name={
                        selectedRating >= rating.value ? 'star' : 'star-outline'
                      }
                      size={30}
                      color={
                        selectedRating >= rating.value ? '#4285F4' : '#ccc'
                      }
                    />

                    <Text
                      style={[
                        styles.ratingLabel,
                        selectedRating === rating.value && {color: '#4285F4'},
                      ]}>
                      {rating.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Comment Section */}
              <Text style={styles.sectionTitle}>Comment or suggestion</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter text here"
                value={feedback}
                onChangeText={setFeedback}
                multiline
                numberOfLines={4}
              />

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Submit feedback</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 300,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  ratingItem: {
    alignItems: 'center',
  },
  ratingLabel: {
    marginTop: 5,
    fontSize: 12,
    color: '#333',
  },
  textInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: '#4285F4',
    borderRadius: 5,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  icon: {
    width: 50,
    height: 50,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#36454F',
    borderRadius: 25,
  },
  tytxt: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
});

export default FeedbackComponent;
