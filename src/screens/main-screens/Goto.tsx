import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {Paths} from '../../navigation/path';
import {useAuth} from '../../components/auth-provider';
import Icon from 'react-native-vector-icons/Ionicons'; // If you want to use vector icons
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Header from './../../components/Header';

const Goto = ({navigation}: any) => {
  const {logout} = useAuth(); // Get login status from AuthContext

  return (
    <>
      <Header
        onBackArrowPress={() => navigation.navigate(Paths.VideoCamera)}
        onMenuPress={() => navigation.navigate(Paths.Goto)}
      />
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            navigation.navigate(Paths.VideoCamera);
          }}>
          <Icon name="camera-outline" size={24} color="black" />
          <View>
            <Text style={styles.menuTitle}>Camera</Text>
            <Text style={styles.menuSubtitle}>
              Take videos and photos to share
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            navigation.navigate(Paths.Verify);
          }}>
          <Icon name="cloud-upload-outline" size={24} color="black" />
          <View>
            <Text style={styles.menuTitle}>Upload</Text>
            <Text style={styles.menuSubtitle}>
              Upload videos and photos received
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            navigation.navigate(Paths.VideoLibrary);
          }}>
          <Icon name="file-tray-outline" size={24} color="black" />
          <View>
            <Text style={styles.menuTitle}>Library</Text>
            <Text style={styles.menuSubtitle}>
              View videos and photos you have taken with Reality Registry
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            navigation.navigate(Paths.FeedBack);
          }}>
          <Icon name="document-text-outline" size={24} color="black" />
          <View>
            <Text style={styles.menuTitle}>Feedback</Text>
            <Text style={styles.menuSubtitle}>Would you like to rate us?</Text>
          </View>
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
          <MaterialIcons name="logout" size={24} color="black" />
          <View>
            <Text style={styles.menuTitle}>Sign out</Text>
            <Text style={styles.menuSubtitle}>Sign out from your account</Text>
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 15,
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
