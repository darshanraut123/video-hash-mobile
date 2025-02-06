import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {Paths} from '../../navigation/path';
import {useAuth} from '../../components/auth-provider';
import Icon from 'react-native-vector-icons/Ionicons'; // If you want to use vector icons

const Goto = ({navigation}: any) => {
  const {logout} = useAuth(); // Get login status from AuthContext

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>REALITY REGISTRY</Text>
        <TouchableOpacity onPress={() => navigation.navigate(Paths.Goto)}>
          <Icon name="menu" size={24} color="#007BFF" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => {
          navigation.navigate(Paths.VideoCamera);
        }}>
        <Text style={styles.menuTitle}>Camera</Text>
        <Text style={styles.menuSubtitle}>Take videos and photos to share</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => {
          navigation.navigate(Paths.Verify);
        }}>
        <Text style={styles.menuTitle}>Upload</Text>
        <Text style={styles.menuSubtitle}>
          Upload videos and photos received
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => {
          navigation.navigate(Paths.VideoLibrary);
        }}>
        <Text style={styles.menuTitle}>Library</Text>
        <Text style={styles.menuSubtitle}>
          View videos and photos you have taken with Reality Registry
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => {
          navigation.navigate(Paths.FeedBack);
        }}>
        <Text style={styles.menuTitle}>Feedback</Text>
        <Text style={styles.menuSubtitle}>Would you like to rate us?</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => {
          Alert.alert(
            'Logout', // Title of the alert
            'Do you really want to Sign Out?', // Message in the alert
            [
              {
                text: 'Cancel', // Cancel button
                style: 'cancel', // The cancel button style
              },
              {
                text: 'OK', // OK button
                onPress: logout,
              },
            ],
            {cancelable: true}, // Allows closing the alert by tapping outside
          );
        }}>
        <Text style={styles.menuTitle}>Sign out</Text>
        <Text style={styles.menuSubtitle}>Sign out from your account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});

export default Goto;
