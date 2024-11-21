import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {nocamera} from '../assets/images/imageExports';

interface NoCameraDeviceErrorI {
  imageName: string;
  mainTxt: string;
  subTxt: string;
}

const CustomError: React.FC<NoCameraDeviceErrorI> = ({
  imageName,
  mainTxt,
  subTxt,
}) => {
  function getImageByImageName(imageNameLocal: string) {
    switch (imageNameLocal) {
      case 'nocamera':
        return nocamera;
    }
  }

  return (
    <View style={styles.container}>
      <Image
        source={getImageByImageName(imageName)} // Replace with your actual icon/image URL
        style={styles.icon}
      />
      <Text style={styles.title}>{mainTxt}</Text>
      <Text style={styles.message}>{subTxt}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomError;
