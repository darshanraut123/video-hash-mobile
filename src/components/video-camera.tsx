import React, {useEffect, useState, useRef} from 'react';
import uuid from 'react-native-uuid';
import {StyleSheet, View, Text, TouchableOpacity, Alert} from 'react-native';
import {
  Camera,
  useCameraDevices,
  VideoFile,
  CameraDevice,
  // useFrameProcessor,
} from 'react-native-vision-camera';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';

export default function VideoCamera() {
  const devices: any = useCameraDevices();
  const cameraRef = useRef<Camera | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [device, setDevice] = useState<CameraDevice>();
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isCameraInitialized, handleCameraInitialized] = useState(false);
  const [video, setVideo] = useState<VideoFile | null>(null);
  const [outputArray, setOutputArray] = useState<any[]>([]);
  let localBeacon = useRef<any>(null);

  useEffect(() => {
    if (devices.length) setDevice(devices[0]);
  }, [devices]);

  useEffect(() => {
    const requestPermissions = async () => {
      const cameraPermission: string = await Camera.requestCameraPermission();
      const microphonePermission: string =
        await Camera.requestMicrophonePermission(); // For video capturing
      console.log('cameraPermission==> ' + cameraPermission);
      console.log('microphonePermission==> ' + microphonePermission);
      setHasPermissions(
        cameraPermission === 'granted' && microphonePermission === 'granted',
      );
    };

    requestPermissions();
    // const fb = setInterval(() => {
    //   fetchBeacon();
    // }, 3000);

    // const nist = setInterval(() => {
    //   captureFrameEx();
    // }, 5000);

    return () => {
      // clearInterval(fb);
      // clearInterval(nist);
    };
  }, []);

  // Function to capture the frame (implement your processing logic here)
  const captureFrame = () => {
    console.log('Frame captured at:', new Date().toLocaleTimeString());
    // Add your frame capturing or processing logic here
  };

  // const frameProcessor = useFrameProcessor(frame => {
  //   'worklet';
  //   if (frame.pixelFormat === 'rgb') {
  //     const buffer = frame.toArrayBuffer();
  //     const data = new Uint8Array(buffer);
  //     console.log(`Pixel at 0,0: RGB(${data[0]}, ${data[1]}, ${data[2]})`);
  //   }
  // }, []);

  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      try {
        setIsRecording(true);
        await cameraRef.current.startRecording({
          onRecordingFinished: video => {
            console.log('Video==> ' + video);
            setIsRecording(false);
            setVideo(video);
            saveVideo(video.path);
          },
          onRecordingError: error => {
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

  // Function to save the video to the Camera Roll
  const saveVideo = async (videoPath: string) => {
    try {
      const savedUri = await CameraRoll.save(videoPath, {type: 'video'});
      Alert.alert('Video Saved', `Video has been saved to your gallery!`);
      console.log('Video saved to camera roll:', savedUri);
    } catch (error) {
      console.log('Error saving video:', error);
      Alert.alert('Error', 'Failed to save video');
    }
  };

  const fetchBeacon = () => {
    fetch('http://localhost:4000/api/beacon')
      .then(response => response.json())
      .then(data => {
        localBeacon.current = data;
      })
      .catch(error => console.error('Error fetching beacon:', error));
  };

  const getNistBeaconByCurrentTimestamp = async () => {
    try {
      const unixTimestamp = Math.floor(Date.now() / 1000);
      const beaconUrl = `https://beacon.nist.gov/beacon/2.0/pulse/time/${unixTimestamp}`;
      const response = await fetch(beaconUrl);

      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
      const data = await response.json();
      let eachSegmentData: any = {};
      eachSegmentData.beaconUniqueId = data.pulse.outputValue;
      eachSegmentData.beaconTimeStamp = data.pulse.timeStamp;
      eachSegmentData.beaconVersion = data.pulse.version;
      eachSegmentData.unixTimestamp = unixTimestamp;
      eachSegmentData.localBeaconUniqueId = localBeacon.current.uniqueValue;
      eachSegmentData.localBeaconTimestamp = localBeacon.current.timestamp;
      eachSegmentData.timeStamp = new Date();
      eachSegmentData.timeStamp = new Date();
      eachSegmentData.hash = 'demo-temp-hash-from-video';
      eachSegmentData.uniqueSegmentId = uuid.v4();
      setOutputArray(prev => [...prev, eachSegmentData]);
      console.log(
        'EachSegmentData from NIST==> ' + JSON.stringify(eachSegmentData),
      );
    } catch (error) {
      console.error('Error fetching data from NIST Beacon:', error);
    }
  };

  const captureFrameEx = async () => {
    await getNistBeaconByCurrentTimestamp();
  };

  if (!device) return <Text>Loading Camera...</Text>;

  return (
    <View style={styles.container}>
      {hasPermissions ? (
        <>
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            // frameProcessor={frameProcessor} // Use the frame processor
            device={device}
            isActive={true}
            video={true}
            audio={true}
            onInitialized={() => handleCameraInitialized(true)} // Camera initialized callback
          />
          {isCameraInitialized && (
            <View style={styles.buttonContainer}>
              {isRecording ? (
                <TouchableOpacity onPress={stopRecording} style={styles.button}>
                  <Text style={styles.text}>Stop Recording</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={startRecording}
                  style={styles.button}>
                  <Text style={styles.text}>Start Recording</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </>
      ) : (
        <Text style={styles.text}>Requesting Permissions...</Text>
      )}
    </View>
  );
}

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

interface LocalBeacon {
  uniqueValue: string;
  timestamp: Date;
}
