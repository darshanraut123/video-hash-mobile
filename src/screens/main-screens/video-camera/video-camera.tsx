/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState, useRef, useCallback} from 'react';
import {
  Platform,
  PermissionsAndroid,
  GestureResponderEvent,
} from 'react-native';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Canvas, {Image as CanvasImage} from 'react-native-canvas';
import timer from 'react-native-timer';
import {Stopwatch} from 'react-native-stopwatch-timer';
import {useIsFocused} from '@react-navigation/native';
import {
  Camera,
  useCameraDevices,
  VideoFile,
  CameraDevice,
  useFrameProcessor,
  useCameraFormat,
} from 'react-native-vision-camera';
import {FFmpegKitConfig, Level} from 'ffmpeg-kit-react-native';
import {
  getLocalBeaconAPI,
  getNistBeaconAPI,
  savePhotoHash,
} from '../../../service/hash-requests';
import {Worklets, useSharedValue} from 'react-native-worklets-core';
import pHash from '../../../util/phash';
import QrCodeComponent from '../../../components/qr-code';
import RNFS from 'react-native-fs';
import Geolocation from 'react-native-geolocation-service';
import RNQRGenerator from 'rn-qr-generator';
import {
  embedQrCodeInPhoto,
  embedQrCodesInVideo,
  extractSegmentFramesForPHash,
} from '../../../util/ffmpeg-util';
import Icon from 'react-native-vector-icons/Ionicons';
import {Paths} from '../../../navigation/path';
import {getTasksFromQueue, updateTaskStatus} from '../../../util/queue';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomError from '../../../components/custom-error';
import styles, {options} from './styles';
import {useIsForeground} from './use-is-foreground';
import {fetchDeviceInfo, fetchVersionInfo} from '../../../util/device-info';
import {Image} from 'react-native';
import {getUniqueId, saveToCameraRoll} from '../../../util/common';
import eventEmitter from '../../../util/event-emitter';
import {useGetShare} from './useGetShare';

export default function VideoCamera({navigation}: any) {
  const devices: any = useCameraDevices();
  const cameraRef = useRef<Camera | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [timeDelay, setTimeDelay] = useState<any>(false);
  const [device, setDevice] = useState<CameraDevice>();
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isCameraInitialized, handleCameraInitialized] = useState(false);
  const [isStopwatchStart, setIsStopwatchStart] = useState(false);
  const [resetStopwatch, setResetStopwatch] = useState(false);
  const [cameraPosition, setCameraPosition] = useState('back');
  const locationRef = useRef<any>();
  const qrCodeRef = useRef<any>();
  const canvasRef = useRef<any>();
  const nistBeacon = useRef<any>();
  const [qrCodeData, setQrCodeData] = useState<any>([]);
  const qrCodeDataRef = useRef<any>([]);
  const qrCodeRefs = useRef<any>([]);
  const [jsonObject, setJsonObject] = useState({});
  const isRecordingShared = useSharedValue(isRecording);
  const lastFrameTimestamp = useSharedValue(0);
  const segmentNo = useSharedValue(0);
  const videoId = useSharedValue<any>(null);
  let localBeacon = useRef<any>(null);
  let userRef = useRef<any>(null);
  const isFocused = useIsFocused();
  const isForeground = useIsForeground();
  const [isCameraActive, setCameraActive] = useState(false);
  const [activeMode, setActiveMode] = useState<'photo' | 'video'>('video');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const format = useCameraFormat(device, [
    {fps: 30},
    {videoResolution: {width: 1280, height: 720}},
    {photoResolution: {width: 1280, height: 720}},
  ]);

  useGetShare();

  useEffect(() => {
    isRecordingShared.value = isRecording;
  }, [isRecording, isRecordingShared]);

  useEffect(() => {
    console.log(isFocused, isForeground);
    setCameraActive(isFocused && isForeground);
  }, [isFocused, isForeground, navigation]);

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
    setTimeout(() => {
      setTimeDelay(true);
    }, 4000);

    const requestPermissions = async () => {
      const cameraPermission: string = await Camera.requestCameraPermission();
      const microphonePermission: string =
        await Camera.requestMicrophonePermission(); // For video capturing
      console.log('cameraPermission==> ' + cameraPermission);
      console.log('microphonePermission==> ' + microphonePermission);

      if (Platform.OS === 'ios') {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        console.log('auth: ' + auth);
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
        FFmpegKitConfig.setLogLevel(Level.AV_LOG_DEBUG);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // videoId.value = uuid.v4();
        videoId.value = getUniqueId();
      }
      const eachQrcode = {
        no: ++segmentNo.value,
        id: videoId.value,
        // segmentId: uuid.v4(),
        // nist: nistBeacon.current?.pulse.outputValue,
        // localBeaconUniqueId: localBeacon.current?.uniqueValue,
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

  const generateQRCode = async (qrCodeDataLocal: any) => {
    return new Promise(async (resolve, reject) => {
      if (qrCodeDataLocal) {
        const savePromises = qrCodeDataLocal.map(
          (eachQrcodeData: any, index: number) => {
            return new Promise((resolveInner: any) => {
              RNQRGenerator.generate({
                value: JSON.stringify(eachQrcodeData), // Data to encode in the QR code
                height: 220, // Height of the QR code
                width: 220, // Width of the QR code
                correctionLevel: 'H', // Error correction level (H for high)
                fileName: `qrcode_${index}`,
              })
                .then(response => {
                  const {uri} = response;
                  console.log('QR code generated:', uri);
                  resolveInner(uri);
                })
                .catch(error => {
                  console.log('Cannot generate QR code in image', error);
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
    let isProcessing = await AsyncStorage.getItem('isProcessing');
    if (isProcessing === null) {
      await AsyncStorage.setItem('isProcessing', JSON.stringify(false));
      return;
    }
    isProcessing = JSON.parse(isProcessing);
    if (isProcessing) {
      return;
    }
    await AsyncStorage.setItem('isProcessing', JSON.stringify(true));
    const tasks = await getTasksFromQueue();
    const nextTask = tasks.find((task: any) => task.status === 'pending');
    // console.log(`nextTask: ${nextTask}`);
    if (nextTask) {
      try {
        await updateTaskStatus(nextTask.id, 'inprogress');
        await handleTask(nextTask);
      } catch (error) {
        console.error('Error processing task:', error);
        await updateTaskStatus(nextTask.id, 'pending');
        await AsyncStorage.setItem('isProcessing', JSON.stringify(false));
      }
    } else {
      await AsyncStorage.setItem('isProcessing', JSON.stringify(false));
    }
  }

  // Define the logic to handle tasks
  async function handleTask(nextTask: any): Promise<void> {
    const payload: any = nextTask.payload;
    const taskId: any = nextTask.id;
    console.log('Handling task of payload:', payload);

    return new Promise(async (resolve, reject) => {
      try {
        const qrCodePaths: any = await generateQRCode(payload.qrCodeData);
        console.log('QR Code paths (watermark paths):', qrCodePaths);
        const videoOutputPath: any = await embedQrCodesInVideo(
          payload.path,
          qrCodePaths,
        );
        console.log('QR Code embedded video path:', videoOutputPath);
        const segmentFramePaths: any = await extractSegmentFramesForPHash(
          videoOutputPath,
        );
        console.log(
          'Extracted frames paths:',
          JSON.stringify(segmentFramePaths),
        );
        eventEmitter.emit('extractFeamesAndSaveToAPI', {
          message: 'Hello from video-camera component!',
          taskId,
          segmentFramePaths,
          videoOutputPath,
          payload,
          latitude: locationRef.current?.latitude,
          longitude: locationRef.current?.longitude,
          altitude: locationRef.current?.altitude,
          nistBeaconUniqueId: nistBeacon.current?.pulse.outputValue,
        });
        console.log('Task resolved successfully');
        resolve();
      } catch (error) {
        console.error('Error in handling task:', error);
        reject(error);
      } finally {
        qrCodeDataRef.current = [];
        setQrCodeData([]);
      }
    });
  }

  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      lastFrameTimestamp.value = 0;
      isRecordingShared.value = true;
      setIsRecording(true);
      handleStartStopwatch();
      cameraRef.current.startRecording({
        onRecordingFinished: async (finishedVideo: VideoFile) => {
          isRecordingShared.value = false;
          setIsRecording(false);
          handleResetStopwatch();
          console.log('finishedVideo: ' + JSON.stringify(finishedVideo));
          const currentTime: any = Date.now();
          const task = {
            id: videoId.value,
            type: 'video',
            payload: {
              videoId: videoId.value,
              qrCodeData: qrCodeDataRef.current,
              duration: finishedVideo.duration,
              path: `file://${
                Platform.OS === 'ios'
                  ? RNFS.LibraryDirectoryPath
                  : RNFS.ExternalStorageDirectoryPath + '/Movies'
              }/video_${currentTime}.mov`,
            },
            status: 'pending',
            createdAt: new Date().toISOString(),
          };
          await RNFS.copyFile(finishedVideo.path, task.payload.path);
          const tasks = await getTasksFromQueue();
          tasks.push(task);
          await AsyncStorage.setItem('TASK_QUEUE', JSON.stringify(tasks));
          console.log('Tasks queue updated');
          videoId.value = null;
          qrCodeDataRef.current = [];
          setQrCodeData([]);
          segmentNo.value = 0;
        },
        onRecordingError: error => {
          isRecordingShared.value = false;
          setIsRecording(false);
          console.error(error);
          videoId.value = null;
          qrCodeDataRef.current = [];
          setQrCodeData([]);
          segmentNo.value = 0;
        },
      });
    }
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

    // For Android ios
    // Convert frame timestamp to seconds
    const frameTimestampInSeconds =
      Platform.OS === 'ios' ? frameTimestamp / 1e3 : frameTimestamp / 1e9; // Convert nanoseconds to seconds
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

  const startStopRecording = async () => {
    if (isRecording) {
      stopRecording(); // Stop recording if it is in progress.
    } else {
      startRecording();
    }
  };

  const takePhoto = async () => {
    if (!cameraRef.current) {
      return;
    }
    try {
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
      });
      console.log('Photo Captured', `Photo saved to: ${photo.path}`);

      setCapturedPhoto(photo.path); // Set the captured photo path
      setIsPreview(true); // Show the preview screen
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const savePhoto = async () => {
    try {
      if (capturedPhoto) {
        let photoHash: any = await generatePhashFromFrames([capturedPhoto]);
        photoHash = photoHash[0];
        console.log(photoHash);
        const photoId = getUniqueId();
        // const photoId = uuid.v4();
        const payloadInQrcode: any = {
          id: photoId,
          // nistBeaconUniqueId: nistBeacon.current?.pulse.outputValue,
          // localBeaconUniqueId: localBeacon.current?.uniqueValue,
        };
        console.log(payloadInQrcode);

        let qrCodePath: any = await generateQRCode([payloadInQrcode]);
        qrCodePath = qrCodePath[0];
        const path = await embedQrCodeInPhoto(capturedPhoto, qrCodePath);
        const deviceInfo: any = await fetchDeviceInfo();

        const apiBody = {
          photoId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          user: userRef.current,
          photoHash,
          publicData: {
            path,
            email: userRef.current.email,
            name: userRef.current.name,
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
        };
        await savePhotoHash(apiBody);
        await saveToCameraRoll(path, 'photo');
      }
    } catch (error) {
      console.log(error);
    } finally {
      discardPhoto();
    }
  };

  const discardPhoto = () => {
    setIsPreview(false);
    setCapturedPhoto(null);
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

  if (!hasPermissions && timeDelay) {
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
      {isPreview && capturedPhoto ? (
        <View style={styles.previewContainer}>
          <Image
            source={{uri: 'file://' + capturedPhoto}}
            style={styles.previewImage}
          />
          <View style={[styles.toggleContainer, styles.saveDiscardContainer]}>
            <TouchableOpacity
              style={[styles.toggleButton, styles.active, {marginRight: 20}]}
              onPress={savePhoto}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, styles.active, {marginLeft: 20}]}
              onPress={discardPhoto}>
              <Text style={styles.buttonText}>Discard</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            format={format}
            frameProcessor={frameProcessor} // Use the frame processor
            device={device}
            isActive={isCameraActive}
            video={activeMode === 'video'}
            audio={true}
            photo={activeMode === 'photo'}
            photoQualityBalance="speed"
            torch={isTorchOn ? 'on' : 'off'}
            enableZoomGesture={true}
            fps={30}
            onTouchStart={handleFocus}
            onInitialized={() => handleCameraInitialized(true)} // Camera initialized callback
          />

          <View style={styles.absQrcodeContainer}>
            <QrCodeComponent qrCodeData={qrCodeData} qrCodeRefs={qrCodeRefs} />
          </View>

          {isRecording && (
            <>
              <View style={styles.qrcodeContainer}>
                <QRCode
                  backgroundColor="white"
                  value={JSON.stringify(jsonObject)}
                  size={100}
                  getRef={ref => (qrCodeRef.current = ref)}
                />
              </View>

              <View style={styles.stopwatchContainer}>
                <Stopwatch
                  start={isStopwatchStart}
                  reset={resetStopwatch}
                  options={options}
                />
              </View>
            </>
          )}

          {!isRecording && (
            <View style={styles.topBar}>
              <TouchableOpacity onPress={() => setIsTorchOn(prev => !prev)}>
                <Icon
                  name={isTorchOn ? 'flash' : 'flash-off'}
                  size={24}
                  color={isTorchOn ? 'yellow' : 'gainsboro'}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={fetchVersionInfo}>
                <Text style={styles.headerText}>REALITY REGISTRY</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate(Paths.Goto)}>
                <Icon name="menu" size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.bottomBar}>
            {!isRecording ? (
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  onPress={() => setActiveMode('photo')}
                  style={[
                    styles.toggleButton,
                    activeMode === 'photo' && styles.active,
                  ]}>
                  <Text
                    style={[
                      styles.toggleText,
                      activeMode === 'photo' && styles.activeText,
                    ]}>
                    Photo
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveMode('video')}
                  style={[
                    styles.toggleButton,
                    activeMode === 'video' && styles.active,
                  ]}>
                  <Text
                    style={[
                      styles.toggleText,
                      activeMode === 'video' && styles.activeText,
                    ]}>
                    Video
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View />
            )}

            <View style={styles.bottomBtnContainer}>
              {!isRecording ? (
                <TouchableOpacity
                  onPress={() => navigation.navigate(Paths.VideoLibrary)}>
                  <Icon name="image-outline" size={50} color="white" />
                </TouchableOpacity>
              ) : (
                <View />
              )}

              {isCameraInitialized && (
                <>
                  {activeMode === 'photo' ? (
                    <TouchableOpacity
                      onPress={takePhoto}
                      style={styles.captureButton}>
                      <View style={styles.innerCaptureButton} />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={startStopRecording}
                      style={
                        isRecording ? styles.stopButton : styles.recordButton
                      }>
                      <View
                        style={
                          isRecording
                            ? styles.stopButtonInner
                            : styles.innerRecordButton
                        }
                      />
                    </TouchableOpacity>
                  )}
                </>
              )}
              {!isRecording ? (
                <TouchableOpacity
                  onPress={() =>
                    setCameraPosition(prev =>
                      prev === 'back' ? 'front' : 'back',
                    )
                  }>
                  <Icon name="camera-reverse" size={50} color="white" />
                </TouchableOpacity>
              ) : (
                <View />
              )}
            </View>
          </View>
        </>
      )}
    </View>
  );
}
