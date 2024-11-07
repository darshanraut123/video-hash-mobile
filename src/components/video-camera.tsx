import React, {useEffect, useState, useRef} from 'react';
import {Platform, PermissionsAndroid} from 'react-native';
import uuid from 'react-native-uuid';
import {StyleSheet, View, Text, TouchableOpacity, Button} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Canvas, {Image as CanvasImage} from 'react-native-canvas';
import timer from 'react-native-timer';
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
} from '../service/hashrequests';
import {Worklets, useSharedValue} from 'react-native-worklets-core';
import pHash from '../util/phash';
import Svg, {Path} from 'react-native-svg';
import QrCodeComponent from './qr-code';
import RNFS from 'react-native-fs';
import Loader from './loader';
import DeviceInfo from 'react-native-device-info';
import Geolocation from 'react-native-geolocation-service';
import RNQRGenerator from 'rn-qr-generator';
import {extractSegmentFramesForPHash} from '../util/ffmpegUtil';

export default function VideoCamera({navigation}: any) {
  const devices: any = useCameraDevices();
  const cameraRef = useRef<Camera | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoaderActive, setIsLoaderActive] = useState<any>(null);
  const [device, setDevice] = useState<CameraDevice>();
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isCameraInitialized, handleCameraInitialized] = useState(false);
  const [location, setLocation] = useState<any>(null);
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

  useEffect(() => {
    isRecordingShared.value = isRecording;
  }, [isRecording, isRecordingShared]);

  let localBeacon = useRef<any>(null);
  useEffect(() => {
    if (devices.length) {
      setDevice(devices[0]);
      FFmpegKitConfig.init()
        .then(() => {
          console.log('FFmpegKit Initialized');
        })
        .catch(error => {
          console.error('Error Initializing FFmpegKit:', error);
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
      if (Platform.OS === 'ios') {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        console.log(auth);
      }

      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (PermissionsAndroid.RESULTS.GRANTED === 'granted') {
          // do something if granted...

          // Get GPS data
          Geolocation.getCurrentPosition(
            position => {
              const {latitude, longitude, altitude} = position.coords;
              setLocation({latitude, longitude, altitude});
            },
            error => {
              console.error(error);
            },
            {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
          );
        }
      }
    };

    //Prefetch once
    getNistBeacon();
    fetchBeacon();

    requestPermissions();

    // timers maintained in the Map timer.intervals
    timer.setInterval('fbTimer', fetchBeacon, 3000);
    timer.setInterval('nistTimer', getNistBeacon, 10000);

    return () => {
      timer.intervalExists('fbTimer') && timer.clearInterval('fbTimer');
      timer.intervalExists('nistTimer') && timer.clearInterval('nistTimer');
    };
  }, []);

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
      const outputPath = `${
        RNFS.PicturesDirectoryPath
      }/video_${Date.now()}.mov`;

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
      return outputPath;
    } catch (error) {
      console.error('FFmpeg command failed', error);
    }
  };

  const saveQRCode = async () => {
    return new Promise(async (resolve, reject) => {
      if (qrCodeDataRef.current) {
        console.log('qrCodeDataRef==> ' + qrCodeDataRef.current);
        const savePromises = qrCodeDataRef.current.map(
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

  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      try {
        lastFrameTimestamp.value = 0;
        isRecordingShared.value = true;
        setIsRecording(true);
        await cameraRef.current.startRecording({
          onRecordingFinished: async (finishedVideo: VideoFile) => {
            setIsLoaderActive('Generating QR codes...');
            isRecordingShared.value = false;
            setIsRecording(false);
            console.log('finishedVideo==> ' + JSON.stringify(finishedVideo));
            const qrCodePaths: any = await saveQRCode();
            console.log('qrCodePaths ie watermark paths==> ' + qrCodePaths);
            setIsLoaderActive('Embedding QR codes...');
            let videoOutputPath: any = await embedQrCodesInVideo(
              finishedVideo.path,
              qrCodePaths,
            );
            console.log('Qrcode embeded video path==> ' + videoOutputPath);
            setIsLoaderActive('Extracting frames for hashing...');
            const segmentFramePaths: any = await extractSegmentFramesForPHash(
              videoOutputPath,
            );
            console.log(
              'extractedFramesPaths==> ' + JSON.stringify(segmentFramePaths),
            );
            setIsLoaderActive('Generating hashes...');
            const pHashes: any = await generatePhashFromFrames(
              segmentFramePaths,
            );
            setIsLoaderActive('Getting video duration...');
            const videoDuration = finishedVideo.duration;
            setIsLoaderActive('Saving to records...');
            saveToAPI({pHashes, videoDuration});
            setIsLoaderActive(null);
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

  const saveToAPI = async ({pHashes, videoDuration}: any) => {
    const deviceId = await DeviceInfo.getUniqueId();
    const carrierName = await DeviceInfo.getCarrier();
    const ipAddress = await DeviceInfo.getIpAddress();
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
      duration: videoDuration,
      cellTower: {
        timestamp: new Date().toISOString(),
        network: {
          carrierName,
          ipAddress,
        },
      },
      gps: {
        latitude: location?.latitude || 0,
        longitude: location?.longitude || 0,
        altitude: location?.altitude || 0,
        timestamp: new Date().toISOString(),
      },
      nistRandom: {
        nistBeaconUniqueId: nistBeacon.current?.pulse.outputValue,
      },
      device: {
        appSpecificID: deviceId,
      },
      segments,
    };
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

  if (!device) {
    return <Text>Loading Camera...</Text>;
  }

  return (
    <View style={styles.container}>
      <Canvas
        style={{backgroundColor: 'white', height: 32, width: 32}}
        ref={canvasRef}
      />
      {hasPermissions ? (
        <>
          {isLoaderActive && <Loader loaderText={isLoaderActive} />}
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            frameProcessor={frameProcessor} // Use the frame processor
            device={device}
            format={device?.formats[0]}
            isActive={true}
            video={true}
            audio={true}
            fps={30}
            onInitialized={() => handleCameraInitialized(true)} // Camera initialized callback
          />

          <Button title="Go to verify" onPress={gotoVerify} />
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
  start_recording_button: {
    padding: 15,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#77c78d',
  },
  stop_recording_button: {
    padding: 15,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#CC0033',
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
  qrcodeContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  absQrcodeContainer: {
    position: 'absolute',
    zIndex: -1,
  },
});
