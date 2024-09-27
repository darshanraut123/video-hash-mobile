import React from 'react';
import {
  View,
  Button,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import Steganography from './src/util/steganography';

const App = () => {
  const [text, setText] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const pickImage = async () => {
    try {
      const result: any = await launchImageLibrary({mediaType: 'photo'});
      const imageURI: any = result.assets[0].uri;
      console.log('imageURI==> ' + imageURI);
      return imageURI;
    } catch (error) {
      console.error('Error picking image: ', error);
    }
  };

  const encodeDataInImage = async () => {
    try {
      if (!text) {
        Alert.alert('Please provide text to encode');
        return;
      }
      setIsLoading(true);
      let imagePath: any = await pickImage();
      console.log(imagePath);
      const steganography = new Steganography(imagePath);
      const encodedImageUrl = await steganography.encode(text, {
        algorithm: 'LSBv1',
      });
      console.log('encodedImageUrl==> ' + encodedImageUrl);
      saveImageToFile(encodedImageUrl);
      Alert.alert('Encoded image saved to gallery');
      setText('');
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error encoding image: ', error);
    }
  };

  const decodeDataInImage = async () => {
    try {
      let imagePath: any = await pickImage();
      console.log(imagePath);
      setIsLoading(true);
      const steganography = new Steganography(imagePath);
      const decodedText = await steganography.decode();
      console.log('decodedText==> ' + decodedText);
      Alert.alert('Decoded text is ==> ' + decodedText);
      setIsLoading(false);
    } catch (e: any) {
      console.log('Error', e);
      Alert.alert(e);
      setIsLoading(false);
    }
  };

  const saveImageToFile = async (uri: string) => {
    const destPath = `${RNFS.PicturesDirectoryPath}/darshan_${Date.now()}.png`;
    await RNFS.copyFile(uri, destPath);
    console.log('Image saved to:', destPath);
  };

  return (
    <>
      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#00ff00" />
        </View>
      )}
      <View>
        <Button title="Pick Image to Encode" onPress={encodeDataInImage} />
        <TextInput
          onChangeText={setText}
          value={text}
          placeholder="Enter text to decode"
        />
        <Button title="Pick Image to Decode" onPress={decodeDataInImage} />
      </View>
    </>
  );
};

export default App;

const styles = StyleSheet.create({
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'gray',
  },
});
