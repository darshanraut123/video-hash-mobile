import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';
import React from 'react';

export default function Loader(props: any) {
  const {loaderText} = props;

  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color="#ffffff" />
      <Text style={styles.loadingText}>
        {loaderText ? loaderText : 'Loading, please wait...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    padding: 10,
    backgroundColor: 'lightblue',
    borderRadius: 5,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
    zIndex: 9999, // Makes sure the overlay appears above everything else
  },
  loadingText: {
    marginTop: 10,
    color: '#ffffff',
    fontSize: 16,
  },
});
