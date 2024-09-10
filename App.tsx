import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, PermissionsAndroid, Platform, Alert } from 'react-native';
import { Camera, useCameraDevices, VideoFile, CameraDevice } from 'react-native-vision-camera';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const App: React.FC = () => {
  const devices = useCameraDevices();
  const [device, setDevice] = useState<CameraDevice | undefined>(undefined);
  const cameraRef = useRef<Camera | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [video, setVideo] = useState<VideoFile | null>(null);

  useEffect(() => {
    if (devices?.[0]) {
      setDevice(devices[0]); // Set the first available camera device (whether front or back)
    }
  }, [devices]);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const cameraPermission = await request(PERMISSIONS.ANDROID.CAMERA);
      const audioPermission = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
      
      if (cameraPermission === RESULTS.GRANTED && audioPermission === RESULTS.GRANTED) {
        setHasPermissions(true);
      } else {
        Alert.alert('Permissions required', 'Please grant camera and audio permissions.');
      }
    } else {
      const cameraPermission = await request(PERMISSIONS.IOS.CAMERA);
      const audioPermission = await request(PERMISSIONS.IOS.MICROPHONE);
      
      if (cameraPermission === RESULTS.GRANTED && audioPermission === RESULTS.GRANTED) {
        setHasPermissions(true);
      } else {
        Alert.alert('Permissions required', 'Please grant camera and audio permissions.');
      }
    }
  };

  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      try {
        setIsRecording(true);
        await cameraRef.current.startRecording({
          onRecordingFinished: (video) => {
            setIsRecording(false);
            setVideo(video);
            saveVideo(video.path);
          },
          onRecordingError: (error) => {
            setIsRecording(false);
            console.error(error);
          },
        });
      } catch (error) {
        console.error(error);
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  const saveVideo = (uri: string) => {
    Alert.alert('Video saved', `Video saved to: ${uri}`);
    // You can implement saving to gallery if required here
  };

  if (!device) return <Text>Loading Camera...</Text>;

  return (
    <View style={styles.container}>
      {hasPermissions ? (
        <>
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            video={true}
          />
          <View style={styles.buttonContainer}>
            {isRecording ? (
              <TouchableOpacity onPress={stopRecording} style={styles.button}>
                <Text style={styles.text}>Stop Recording</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={startRecording} style={styles.button}>
                <Text style={styles.text}>Start Recording</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      ) : (
        <Text style={styles.text}>Requesting Permissions...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 50,
  },
  button: {
    padding: 15,
    backgroundColor: 'red',
    borderRadius: 10,
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
});

export default App;
