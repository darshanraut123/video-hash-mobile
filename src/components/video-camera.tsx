import React, {useEffect, useState, useRef} from 'react';
import uuid from 'react-native-uuid';
import {StyleSheet, View, Text, TouchableOpacity, Alert} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {
  Camera,
  useCameraDevices,
  VideoFile,
  CameraDevice,
  // useFrameProcessor,
  // useFrameProcessor,
} from 'react-native-vision-camera';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {
  // FFmpegKit,
  FFmpegKitConfig,
} from 'ffmpeg-kit-react-native';
// import ImagePicker from 'react-native-image-crop-picker';
import RNFS from 'react-native-fs';

export default function VideoCamera() {
  const devices: any = useCameraDevices();
  const cameraRef = useRef<Camera | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [device, setDevice] = useState<CameraDevice>();
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isCameraInitialized, handleCameraInitialized] = useState(false);
  // const [video, setVideo] = useState<VideoFile | null>(null);
  const qrCodeRef = useRef<any>();
  const nistBeacon = useRef<any>();
  const outputArray = useRef<any>([]);
  const [jsonObject, setJsonObject] = useState({});

  let localBeacon = useRef<any>(null);
  useEffect(() => {
    if (devices.length) {
      setDevice(devices[0]);
      FFmpegKitConfig.init()
        .then(() => {
          console.log('FFmpegKit initialized');
        })
        .catch(error => {
          console.error('Error initializing FFmpegKit:', error);
        });
    }
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

    //Prefetch once
    getNistBeaconByCurrentTimestamp();
    fetchBeacon();

    requestPermissions();
    const fb = setInterval(() => {
      fetchBeacon();
    }, 3000);

    const nist = setInterval(() => {
      const captureFrameEx = async () => {
        await getNistBeaconByCurrentTimestamp();
      };
      captureFrameEx();
    }, 10000);

    return () => {
      clearInterval(fb);
      clearInterval(nist);
    };
  }, []);

  const generateAndSaveQRCode = async () => {
    if (qrCodeRef.current) {
      for (let index = 0; index < outputArray.current.length; index++) {
        const awaited = () => {
          return new Promise<void>((resolve): void => {
            const each = outputArray.current[index];
            setJsonObject(each);
            console.log('Processing qrcode for id: ' + each.id);
            qrCodeRef.current.toDataURL(async (data: string) => {
              try {
                const filePath = `${RNFS.PicturesDirectoryPath}/qrcode_${each.id}.png`;
                await RNFS.writeFile(filePath, data, 'base64');
                console.log('QR Code Saved', `Image saved at ${filePath}`);
                resolve();
              } catch (err) {
                console.error('Error saving QR code image:', err);
                resolve();
              }
            });
          });
        };
        await awaited();
      }
    }
  };

  // const pickVdoFun = async () => {
  //   const pickVdo = await ImagePicker.openPicker({
  //     mediaType: 'video',
  //     // Other options like cropping can be added here
  //   });
  //   convertVideo(pickVdo.path);
  // };

  // const convertVideo = async (videoInputPath: any) => {
  //   try {
  //     const inputPath = videoInputPath;
  //     const outputPath = RNFS.PicturesDirectoryPath + '/output.mp4';
  //     const watermarkPaths = [
  //       'temp_0_watermark.png',
  //       'temp_1_watermark.png',
  //       'temp_2_watermark.png',
  //       'temp_3_watermark.png',
  //       'temp_4_watermark.png',
  //       'temp_5_watermark.png',
  //       'temp_6_watermark.png',
  //       'temp_7_watermark.png',
  //       'temp_8_watermark.png',
  //       'temp_9_watermark.png',
  //       'temp_10_watermark.png',
  //       'temp_11_watermark.png',
  //       'temp_12_watermark.png',
  //     ];

  //     const overlayDuration = 5; // duration for each watermark in seconds

  //     // Construct the filter_complex argument
  //     const filterComplex = watermarkPaths
  //       .map((path, index) => {
  //         const startTime = index * overlayDuration;
  //         const endTime = startTime + overlayDuration;
  //         const prevOverlay = index === 0 ? '[0:v]' : `[v${index}]`;
  //         return `${prevOverlay}[${
  //           index + 1
  //         }:v] overlay=W-w-10:H-h-10:enable='between(t,${startTime},${endTime})'[v${
  //           index + 1
  //         }]`;
  //       })
  //       .join(';');

  //     // Complete filter_complex with the last output mapping
  //     const completeFilterComplex = `${filterComplex} -map [v${watermarkPaths.length}]`;

  //     // FFmpeg command to convert the video
  //     const command: string = `-i ${inputPath} ${watermarkPaths
  //       .map(path => `-i ${path}`)
  //       .join(
  //         ' ',
  //       )} -filter_complex "${completeFilterComplex}" -c:v libx264 -crf 30 -preset ultrafast -c:a copy ${outputPath}`; // Run FFmpeg command

  //     const session = await FFmpegKit.execute(command);
  //     // Unique session id created for this execution
  //     const sessionId = session.getSessionId();
  //     console.log(`sessionId===> ${sessionId}`);

  //     // Command arguments as a single string
  //     const comd = session.getCommand();
  //     console.log(`command===> ${comd}`);
  //   } catch (error) {
  //     console.error('FFmpeg command failed', error);
  //   }
  // };

  // // Function to capture the frame (implement your processing logic here)
  // const captureFrame = () => {
  //   console.log('Frame captured at:', new Date().toLocaleTimeString());
  //   // Add your frame capturing or processing logic here
  // };

  // const frameProcessor = useFrameProcessor(frame => {
  //   'worklet';
  //   if (frame.pixelFormat === 'rgb') {
  //     const buffer = frame.toArrayBuffer();
  //     const data = new Uint8Array(buffer);
  //     console.log(`Pixel at 0,0: RGB(${data[0]}, ${data[1]}, ${data[2]})`);
  //   }
  // }, []);

  const createFinalArrayOneByOne = () => {
    let eachSegmentData: any = {};
    eachSegmentData.id = outputArray.current.length + 1;
    eachSegmentData.beaconUniqueId = nistBeacon.current.pulse.outputValue;
    eachSegmentData.beaconTimeStamp = nistBeacon.current.pulse.timeStamp;
    eachSegmentData.beaconVersion = nistBeacon.current.pulse.version;
    eachSegmentData.unixTimestamp = Math.floor(Date.now() / 1000);
    eachSegmentData.localBeaconUniqueId = localBeacon.current.uniqueValue;
    eachSegmentData.localBeaconTimestamp = localBeacon.current.timestamp;
    eachSegmentData.timeStamp = new Date();
    eachSegmentData.hash = 'demo-temp-hash-from-video';
    eachSegmentData.uniqueSegmentId = uuid.v4();
    console.log(eachSegmentData.id + ' ' + JSON.stringify(eachSegmentData));
    console.log(
      '================================================================',
    );
    outputArray.current = [...outputArray.current, eachSegmentData];
  };

  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      try {
        setIsRecording(true);
        const startedTimer = setInterval(() => {
          createFinalArrayOneByOne();
        }, 5000);
        await cameraRef.current.startRecording({
          onRecordingFinished: (finishedVideo: VideoFile) => {
            console.log('Video==> ' + finishedVideo);
            setIsRecording(false);
            // setVideo(finishedVideo);
            saveVideo(finishedVideo.path);
            clearInterval(startedTimer);
            outputArray.current.forEach((element: any, index: number) => {
              console.log(
                'Index+1 ' +
                  index +
                  ' Each O/P ---> ' +
                  JSON.stringify(element),
              );
            });
            generateAndSaveQRCode();
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
      Alert.alert('Video Saved', 'Video has been saved to your gallery!');
      console.log('Video saved to camera roll:', savedUri);
    } catch (error) {
      console.log('Error saving video:', error);
      Alert.alert('Error', 'Failed to save video');
    }
  };

  const fetchBeacon = () => {
    fetch('https://rrdemo.buzzybrains.net/api/beacon')
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
      nistBeacon.current = await response.json();
    } catch (error) {
      console.error('Error fetching data from NIST Beacon:', error);
    }
  };

  // const frameProcessor = useFrameProcessor(frame => {
  //   'worklet';
  //   console.log(`Frame: ${frame.width}x${frame.height} (${frame.pixelFormat})`);
  // }, []);

  if (!device) {
    return <Text>Loading Camera...</Text>;
  }

  return (
    <View style={styles.container}>
      {hasPermissions ? (
        <>
          {/* QR Code Component */}
          <View style={styles.qrcodeContainer}>
            <QRCode
              value={JSON.stringify(jsonObject)}
              size={200}
              getRef={ref => (qrCodeRef.current = ref)}
            />
          </View>
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
  qrcodeContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
