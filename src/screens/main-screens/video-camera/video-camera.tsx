import React, {useEffect, useState, useRef, useCallback} from 'react';
import {
  Platform,
  PermissionsAndroid,
  GestureResponderEvent,
} from 'react-native';
import uuid from 'react-native-uuid';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Canvas, {Image as CanvasImage} from 'react-native-canvas';
import timer from 'react-native-timer';
import {Stopwatch} from 'react-native-stopwatch-timer';
import {useIsFocused} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import {
  Camera,
  useCameraDevices,
  VideoFile,
  CameraDevice,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {FFmpegKit, FFmpegKitConfig} from 'ffmpeg-kit-react-native';
import {
  getLocalBeaconAPI,
  getNistBeaconAPI,
  saveVideoHash,
} from '../../../service/hash-requests';
import {Worklets, useSharedValue} from 'react-native-worklets-core';
import pHash from '../../../util/phash';
import Svg, {Path} from 'react-native-svg';
import QrCodeComponent from '../../../components/qr-code';
import RNFS from 'react-native-fs';
import Geolocation from 'react-native-geolocation-service';
import RNQRGenerator from 'rn-qr-generator';
import {extractSegmentFramesForPHash} from '../../../util/ffmpeg-util';
import Icon from 'react-native-vector-icons/Ionicons';
import {Paths} from '../../../navigation/path';
import {
  addTaskToQueue,
  getTasksFromQueue,
  removeCompletedTask,
  updateTaskStatus,
} from '../../../util/queue';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomError from '../../../components/custom-error';
import styles from './styles';
import {useIsForeground} from './use-is-foreground';
import {fetchDeviceInfo} from '../../../util/device-info';

export default function VideoCamera({navigation}: any) {
  const devices: any = useCameraDevices();
  const cameraRef = useRef<Camera | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isLoaderActive, setIsLoaderActive] = useState<any>(null);
  const [device, setDevice] = useState<CameraDevice>();
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isCameraInitialized, handleCameraInitialized] = useState(false);
  const [isStopwatchStart, setIsStopwatchStart] = useState(false);
  const [resetStopwatch, setResetStopwatch] = useState(false);
  const [cameraPosition, setCameraPosition] = useState('back');
  const locationRef = useRef<any>();
  const qrCodeRef = useRef<any>();
  const canvasRef = useRef<any>();
  const canvasStegRef = useRef<any>(null);
  const nistBeacon = useRef<any>();
  const [qrCodeData, setQrCodeData] = useState<any>([]);
  const qrCodeDataRef = useRef<any>([]);
  const qrCodeRefs = useRef<any>([]);
  const [jsonObject, setJsonObject] = useState({});
  const isRecordingShared = useSharedValue(isRecording);
  const lastFrameTimestamp = useSharedValue(0);
  const segmentNo = useSharedValue(0);
  const videoId = useSharedValue<any>(null);
  let isProcessing = false;
  let localBeacon = useRef<any>(null);
  let userRef = useRef<any>(null);
  const isFocused = useIsFocused();
  const isForeground = useIsForeground();
  const [isCameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    isRecordingShared.value = isRecording;
  }, [isRecording, isRecordingShared]);

  useEffect(() => {
    console.log(isFocused, isForeground);
    setCameraActive(isFocused && isForeground);
  }, [isFocused, isForeground]);

  useEffect(() => {
    if (devices.length) {
      if (cameraPosition === 'back') {
        const back = devices.find((dev: any) => dev.position === 'back');
        setDevice(back);
      } else {
        const front = devices.find((dev: any) => dev.position === 'front');
        setDevice(front);
      }
    }
  }, [devices, cameraPosition]);

  useEffect(() => {
    const requestPermissions = async () => {
      const cameraPermission: string = await Camera.requestCameraPermission();
      const microphonePermission: string =
        await Camera.requestMicrophonePermission(); // For video capturing
      console.log('cameraPermission==> ' + cameraPermission);
      console.log('microphonePermission==> ' + microphonePermission);

      if (Platform.OS === 'ios') {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        console.log(auth);
      } else if (Platform.OS === 'android') {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (PermissionsAndroid.RESULTS.GRANTED === 'granted') {
          // Get GPS data
          Geolocation.getCurrentPosition(
            position => {
              const {latitude, longitude, altitude} = position.coords;
              locationRef.current = {latitude, longitude, altitude};
              setHasPermissions(
                cameraPermission === 'granted' &&
                  microphonePermission === 'granted' &&
                  PermissionsAndroid.RESULTS.GRANTED === 'granted',
              );
            },
            error => {
              console.error(error);
            },
            {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
          );
        }
      }
    };

    FFmpegKitConfig.init()
      .then(() => {
        console.log('FFmpegKit Initialized');
      })
      .catch(error => {
        console.error('Error Initializing FFmpegKit:', error);
      });

    async function getUser() {
      // Set user data
      const userLocal: any = await AsyncStorage.getItem('user');
      if (userLocal) {
        userRef.current = JSON.parse(userLocal);
      }
    }

    //Prefetch once
    getNistBeacon();
    fetchBeacon();
    requestPermissions();
    getUser();

    // timers maintained in the Map timer.intervals
    timer.setInterval('fbTimer', fetchBeacon, 3000);
    timer.setInterval('nistTimer', getNistBeacon, 10000);
    timer.setInterval('queueTimer', processNextTask, 8000);

    return () => {
      timer.intervalExists('fbTimer') && timer.clearInterval('fbTimer');
      timer.intervalExists('nistTimer') && timer.clearInterval('nistTimer');
      timer.intervalExists('queueTimer') && timer.clearInterval('queueTimer');
    };
  }, []);

  const handleFocus = useCallback(
    async ({nativeEvent}: GestureResponderEvent) => {
      console.log(`X: ${nativeEvent.pageX} Y: ${nativeEvent.pageY}`);
      await cameraRef?.current?.focus({
        x: Math.round(nativeEvent.pageX),
        y: Math.round(nativeEvent.pageY),
      });
    },
    [],
  );

  const setQrCodes = Worklets.createRunOnJS(() => {
    try {
      if (!videoId.value) {
        videoId.value = uuid.v4();
      }
      const eachQrcode = {
        segmentNo: ++segmentNo.value,
        videoId: videoId.value,
        segmentId: uuid.v4(),
        nistBeaconUniqueId: nistBeacon.current?.pulse.outputValue,
        localBeaconUniqueId: localBeacon.current?.uniqueValue,
      };
      setJsonObject(eachQrcode);
      setQrCodeData((prev: any) => {
        return [...prev, eachQrcode];
      });
      qrCodeDataRef.current = [...qrCodeDataRef.current, eachQrcode];
    } catch (error) {
      console.log('setQrCodes error==>', error);
    }
  });

  const generatePhashFromFrames = (framesPaths: any) => {
    return new Promise(async (resolve: any, reject: any) => {
      const finalPhashes: string[] = [];
      const promises = framesPaths.map(async (framePath: string) => {
        if (!canvasRef.current) {
          console.log('Inside if-condition returning');
          reject('CanvasRef not ready');
        }
        console.log('Running next lines');
        const base64Path = await RNFS.readFile(framePath, 'base64');
        const canvas: any = canvasRef.current;
        const ctx = await canvas.getContext('2d');
        canvas.width = 32;
        canvas.height = 32;
        const img = new CanvasImage(canvas);
        const base64complete: string =
          'data:image/png;base64,' + base64Path.replace('\n', '').trim();
        img.src = base64complete;

        await new Promise<void>((imgResolve: any, imgReject: any) => {
          img.addEventListener('load', onLoadImage);
          async function onLoadImage() {
            console.log(img.width, img.height);
            canvas.width = 32;
            canvas.height = 32;

            // Calculate aspect ratio to maintain
            const aspectRatio = img.width / img.height;

            let drawWidth, drawHeight;

            if (aspectRatio > 1) {
              // Image is wider than tall, fit by width
              drawWidth = 32;
              drawHeight = 32 / aspectRatio;
            } else {
              // Image is taller than wide, fit by height
              drawWidth = 32 * aspectRatio;
              drawHeight = 32;
            }

            // Center the image on the canvas
            const offsetX = (32 - drawWidth) / 2;
            const offsetY = (32 - drawHeight) / 2;

            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            try {
              const imageData = await ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height,
              );
              // console.log('Imagedata extracted');
              const pixels = imageData.data;
              const width = imageData.width; // Assuming you have width and height of the canvas
              const height = imageData.height;
              let formattedData = `# ImageMagick pixel enumeration: ${width},${height},255,srgb\n`;
              for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                  // Calculate the pixel's starting index in the array
                  const index = (y * width + x) * 4;
                  // Extract RGBA values
                  const red = pixels[index];
                  const green = pixels[index + 1];
                  const blue = pixels[index + 2];
                  // const alpha = pixels[index + 3]; // We're not using alpha in this case
                  // Convert RGB to hex format
                  const hex = `#${red.toString(16).padStart(2, '0')}${green
                    .toString(16)
                    .padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;
                  // Determine color name or closest match (e.g., "black", "white", "red")
                  const colorName = 'red';
                  // Append formatted pixel data to the string
                  formattedData += `${x},${y}: (${red},${green},${blue})  ${hex}  ${colorName}\n`;
                }
              }
              const eachPHash = pHash.hash(formattedData);
              finalPhashes.push(eachPHash);
              imgResolve();
            } catch (e: any) {
              console.error('Error with fetching image data:', e);
              imgReject();
            }
          }
        });
      }); // Wait for all promises (frames) to be processed
      try {
        await Promise.all(promises);
        resolve(finalPhashes); // Return the phashes after all frames are processed
      } catch (error) {
        reject(error); // Handle any errors in the entire process
      }
    });
  };

  const embedQrCodesInVideo = async (
    inputPath: string,
    watermarkPaths: string[],
  ) => {
    try {
      const fileName: any = inputPath.split('/').pop();
      const outputPath = `${RNFS.CachesDirectoryPath}/$${
        fileName.split('.')[0]
      }_temp.mov`;

      const overlayDuration = 5; // duration for each watermark in seconds

      // Construct the filter_complex argument
      const filterComplex =
        watermarkPaths
          .map((path: string, index: number) => {
            const startTime = index * overlayDuration;
            const endTime = startTime + overlayDuration;
            const prevOverlay = index === 0 ? '[0:v]' : `[v${index}]`;
            if (index < watermarkPaths.length - 1) {
              // For all watermarks except the last, set their visibility duration
              return `${prevOverlay}[${
                index + 1
              }:v] overlay=W-w-10:10:enable='between(t,${startTime},${endTime})'[v${
                index + 1
              }]`;
            } else {
              // For the last watermark, keep it visible until the end of the video
              return `${prevOverlay}[${
                index + 1
              }:v] overlay=W-w-10:10:enable='between(t,${startTime},9999)'[v${
                index + 1
              }]`;
            }
          })
          .join(';') + `; [v${watermarkPaths.length}] fps=fps=30 [vfinal]`; // Add fps filter

      // FFmpeg command to convert the video
      const command: string = `-r 30 -i ${inputPath} ${watermarkPaths
        .map((path: string) => `-i ${path}`)
        .join(
          ' ',
        )} -filter_complex "${filterComplex}" -map [vfinal] -c:v mpeg4 -q:v 10 -c:a copy ${outputPath}`; // Use [vfinal] as output

      const session = await FFmpegKit.execute(command);

      // Unique session id created for this execution
      const sessionId = session.getSessionId();
      console.log(`sessionId===> ${sessionId}`);

      // Command arguments as a single string
      const comd = session.getCommand();
      console.log(`command===> ${comd}`);
      // Delete the original file
      await RNFS.unlink(inputPath);
      // Rename the temporary file to replace the original file
      await RNFS.moveFile(outputPath, inputPath);
      console.log('File replaced successfully');
      return inputPath;
    } catch (error) {
      console.error('FFmpeg command failed', error);
    }
  };

  const saveQRCode = async (qrCodeDataLocal: any) => {
    return new Promise(async (resolve, reject) => {
      if (qrCodeDataLocal) {
        const savePromises = qrCodeDataLocal.map(
          (eachQrcodeData: any, index: number) => {
            return new Promise((resolveInner: any) => {
              RNQRGenerator.generate({
                value: JSON.stringify(eachQrcodeData), // Data to encode in the QR code
                height: 200, // Height of the QR code
                width: 200, // Width of the QR code
                correctionLevel: 'H', // Error correction level (H for high)
                fileName: `qrcode_${index}`,
              })
                .then(response => {
                  const {uri} = response;
                  console.log('QR code generated:', uri);
                  resolveInner(uri);
                })
                .catch(error => {
                  console.log('Cannot detect QR code in image', error);
                });
            });
          },
        );
        const filePaths = await Promise.all(savePromises); // Wait for all QR codes to be saved
        resolve(filePaths); // Resolve with array of file paths
      } else {
        reject('Error: qrCodeRefs not found');
      }
    });
  };

  async function processNextTask() {
    if (isProcessing) {
      return;
    }
    isProcessing = true;
    const tasks = await getTasksFromQueue();
    const nextTask = tasks.find((task: any) => task.status === 'pending');
    console.log(`nextTask: ${nextTask}`);
    if (nextTask) {
      try {
        await updateTaskStatus(nextTask.id, 'inprogress');
        await handleTask(nextTask.payload);
        await removeCompletedTask(nextTask.id);
        isProcessing = false;
      } catch (error) {
        console.error('Error processing task:', error);
        await updateTaskStatus(nextTask.id, 'pending');
        isProcessing = false;
      }
    } else {
      isProcessing = false;
    }
  }

  // Define the logic to handle tasks
  async function handleTask(payload: any): Promise<void> {
    console.log('Handling task of payload:', payload);

    return new Promise(async (resolve, reject) => {
      try {
        setIsLoaderActive('Generating QR codes...');
        const qrCodePaths: any = await saveQRCode(payload.qrCodeData);
        console.log('QR Code paths (watermark paths):', qrCodePaths);
        setIsLoaderActive('Embedding QR codes...');
        const videoOutputPath: any = await embedQrCodesInVideo(
          payload.path,
          qrCodePaths,
        );
        console.log('QR Code embedded video path:', videoOutputPath);
        setIsLoaderActive('Extracting frames for hashing...');
        const segmentFramePaths: any = await extractSegmentFramesForPHash(
          videoOutputPath,
        );
        console.log(
          'Extracted frames paths:',
          JSON.stringify(segmentFramePaths),
        );
        setIsLoaderActive('Generating hashes...');
        const pHashes: any = await generatePhashFromFrames(segmentFramePaths);
        setIsLoaderActive('Getting video duration...');
        const videoDuration = payload.duration;
        setIsLoaderActive('Saving to records...');
        await saveToAPI({pHashes, videoDuration, videoOutputPath});
        setIsLoaderActive(null);
        console.log('Task resolved successfully');
        resolve();
      } catch (error) {
        console.error('Error in handling task:', error);
        setIsLoaderActive(null); // Reset loader in case of an error
        reject(error);
      }
    });
  }

  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      try {
        lastFrameTimestamp.value = 0;
        isRecordingShared.value = true;
        setIsRecording(true);
        handleStartStopwatch();
        await cameraRef.current.startRecording({
          onRecordingFinished: async (finishedVideo: VideoFile) => {
            isRecordingShared.value = false;
            setIsRecording(false);
            handleResetStopwatch();
            console.log('finishedVideo: ' + JSON.stringify(finishedVideo));
            const currentTime: any = Date.now();
            const task = {
              id: uuid.v4(),
              type: 'video',
              payload: {
                qrCodeData: qrCodeDataRef.current,
                duration: finishedVideo.duration,
                path: `${RNFS.PicturesDirectoryPath}/video_${currentTime}.mov`,
                statusPath: `${RNFS.PicturesDirectoryPath}/video_${currentTime}_temp.mov`,
              },
              status: 'pending',
              createdAt: new Date().toISOString(),
            };
            await RNFS.copyFile(finishedVideo.path, task.payload.path);
            addTaskToQueue(task);
          },
          onRecordingError: error => {
            isRecordingShared.value = false;
            setIsRecording(false);
            console.error(error);
            setIsLoaderActive(false);
          },
        });
      } catch (error) {
        console.error(error);
        setIsRecording(false);
        setIsLoaderActive(false);
      }
    }
  };

  const saveToAPI = async ({pHashes, videoDuration, videoOutputPath}: any) => {
    const deviceInfo: any = await fetchDeviceInfo();
    const segments = qrCodeDataRef.current.map(
      (qrCodeDataItem: any, index: number) => {
        return {
          ...qrCodeDataItem,
          videoHash: pHashes[index],
        };
      },
    );
    const apiBody = {
      videoId: videoId.value,
      fullVideoHash: pHashes.join(''),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      duration: videoDuration,
      user: userRef.current,
      publicData: {
        path: videoOutputPath,
        email: userRef.current.email,
        name: userRef.current.name,
        duration: videoDuration,
        createdAt: new Date().toISOString(),
      },
      device: deviceInfo,
      gps: {
        latitude: locationRef.current?.latitude || 0,
        longitude: locationRef.current?.longitude || 0,
        altitude: locationRef.current?.altitude || 0,
        timestamp: new Date().toISOString(),
      },
      nistRandom: {
        nistBeaconUniqueId: nistBeacon.current?.pulse.outputValue,
      },
      segments,
    };
    console.log(JSON.stringify(apiBody));
    const res = await saveVideoHash(apiBody)
      .then(resp => resp)
      .finally(() => {
        qrCodeDataRef.current = [];
        setQrCodeData([]);
      });
    console.log(res);
  };

  const gotoVerify = async () => {
    navigation.navigate('Verify', {name: 'Verify'});
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };
  const fetchBeacon = async () => {
    localBeacon.current = await getLocalBeaconAPI();
  };

  const getNistBeacon = async () => {
    nistBeacon.current = await getNistBeaconAPI();
  };

  const frameProcessor = useFrameProcessor(frame => {
    'worklet';

    const frameTimestamp = frame.timestamp;
    const recordingStatus = isRecordingShared.value;

    // Convert frame timestamp to seconds
    const frameTimestampInSeconds = frameTimestamp / 1e9;

    // Call setQrCodes() immediately for the first frame (0th second)
    if (lastFrameTimestamp.value === 0 && recordingStatus) {
      lastFrameTimestamp.value = frameTimestampInSeconds;
      segmentNo.value = 0;
      setQrCodes(); // Trigger for 0th second
      return; // Exit the function early to prevent further processing in the first call
    }

    // Calculate the time difference in seconds between the current frame and the last processed frame
    const timeDiffInSeconds =
      frameTimestampInSeconds - lastFrameTimestamp.value;

    // If 5 seconds or more have passed and recording is active
    if (timeDiffInSeconds >= 5 && recordingStatus) {
      lastFrameTimestamp.value = frameTimestampInSeconds;
      setQrCodes(); // Call the JavaScript function
    }
  }, []);

  const handleStartStopwatch = () => {
    setIsStopwatchStart(!isStopwatchStart);
    setResetStopwatch(false);
  };

  const handleResetStopwatch = () => {
    setIsStopwatchStart(false);
    setResetStopwatch(true);
  };

  if (!device) {
    return (
      <CustomError
        imageName="nocamera"
        mainTxt="No Camera Detected"
        subTxt="We couldn't find a camera on your device. Please ensure the camera is
        properly connected or enabled."
      />
    );
  }

  if (!hasPermissions) {
    return (
      <CustomError
        imageName="nopermissions"
        mainTxt="Requesting permissions"
        subTxt="We need your camera, location, microphone permissions to provide services and enhance your experience."
      />
    );
  }

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvasStyle} ref={canvasRef} />
      <>
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          frameProcessor={frameProcessor} // Use the frame processor
          device={device}
          format={device?.formats[0]}
          isActive={isCameraActive}
          video={true}
          audio={true}
          torch={isTorchOn ? 'on' : 'off'}
          enableZoomGesture={true}
          fps={30}
          onTouchStart={handleFocus}
          onInitialized={() => handleCameraInitialized(true)} // Camera initialized callback
        />

        <Text>{isLoaderActive}</Text>
        <TouchableOpacity
          style={styles.flashLightContainer}
          onPress={() => setIsTorchOn(prev => !prev)}>
          <MaterialIcons
            name={'flashlight-on'}
            size={25}
            color={isTorchOn ? '#FFD700' : '#f4f3f4'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cameraSwicthContainer}
          onPress={() =>
            setCameraPosition(prev => (prev === 'back' ? 'front' : 'back'))
          }>
          <MaterialIcons name={'cameraswitch'} size={25} color={'gainsboro'} />
        </TouchableOpacity>

        {isRecording && (
          <View style={styles.stopwatchContainer}>
            <Stopwatch
              start={isStopwatchStart}
              reset={resetStopwatch}
              options={options}
            />
          </View>
        )}
        <View style={styles.absQrcodeContainer}>
          <QrCodeComponent qrCodeData={qrCodeData} qrCodeRefs={qrCodeRefs} />
          <Canvas style={{backgroundColor: 'white'}} ref={canvasStegRef} />
        </View>
        {isRecording && (
          <View style={styles.qrcodeContainer}>
            <QRCode
              backgroundColor="white"
              value={JSON.stringify(jsonObject)}
              size={80}
              getRef={ref => (qrCodeRef.current = ref)}
            />
          </View>
        )}
        {isCameraInitialized && (
          <View style={styles.buttonContainer}>
            {isRecording ? (
              <TouchableOpacity
                onPress={stopRecording}
                style={styles.stop_recording_button}>
                <Svg fill="none" stroke="#fff" viewBox="0 0 24 24">
                  <Path
                    fill="#1C274C"
                    fillRule="evenodd"
                    d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10ZM8.586 8.586C8 9.172 8 10.114 8 12c0 1.886 0 2.828.586 3.414C9.172 16 10.114 16 12 16c1.886 0 2.828 0 3.414-.586C16 14.828 16 13.886 16 12c0-1.886 0-2.828-.586-3.414C14.828 8 13.886 8 12 8c-1.886 0-2.828 0-3.414.586Z"
                    clipRule="evenodd"
                  />
                </Svg>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={startRecording}
                style={styles.start_recording_button}>
                <Svg fill="none" stroke="#fff" viewBox="0 0 24 24">
                  <Path
                    fill="#1C274C"
                    fillRule="evenodd"
                    d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Zm-1.306-6.154 4.72-2.787c.781-.462.781-1.656 0-2.118l-4.72-2.787C9.934 7.706 9 8.29 9 9.214v5.573c0 .923.934 1.507 1.694 1.059Z"
                    clipRule="evenodd"
                  />
                </Svg>
              </TouchableOpacity>
            )}
            {!isRecording && (
              <TouchableOpacity
                onPress={() => navigation.navigate(Paths.VideoLibrary)}
                style={styles.library_button_left}>
                <Icon name="image-outline" size={40} color="#00ACc1" />
              </TouchableOpacity>
            )}
            {!isRecording && (
              <TouchableOpacity
                onPress={gotoVerify}
                style={styles.library_button_right}>
                <Icon name="finger-print" size={40} color="#00ACc1" />
              </TouchableOpacity>
            )}
            <Toast />
          </View>
        )}
      </>
    </View>
  );
}

const options = {
  container: {
    backgroundColor: '#000',
    padding: 5,
    borderRadius: 5,
    width: 100,
  },
  text: {
    fontSize: 20,
    color: '#FFF',
    marginLeft: 7,
  },
};
