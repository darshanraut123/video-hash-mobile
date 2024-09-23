import React, {useEffect, useState, useRef} from 'react';
import uuid from 'react-native-uuid';
import {StyleSheet, View, Text, TouchableOpacity, Button} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Canvas, {Image as CanvasImage} from 'react-native-canvas';
import {crop} from 'vision-camera-cropper';
import {
  Camera,
  useCameraDevices,
  VideoFile,
  CameraDevice,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {FFmpegKit, FFmpegKitConfig} from 'ffmpeg-kit-react-native';
import {getLocalBeaconAPI, getNistBeaconAPI} from '../api-requests/requests';
import {Worklets} from 'react-native-worklets-core';
import pHash from '../util/phash';
import Svg, {Path} from 'react-native-svg';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import QrCodeComponent from './qr-code';
import RNFS from 'react-native-fs';
import Loader from './loader';

export default function VideoCamera() {
  const devices: any = useCameraDevices();
  const lastFrameTimestampRef = useRef<number | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoaderActive, setIsLoaderActive] = useState(false);
  const [device, setDevice] = useState<CameraDevice>();
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isCameraInitialized, handleCameraInitialized] = useState(false);
  const qrCodeRef = useRef<any>();
  const canvasRef = useRef<any>();
  const nistBeacon = useRef<any>();
  const [qrCodeData, setQrcodeData] = useState<any>([]);
  const qrCodeRefs = useRef<any>([]);
  const extractedFramesDataArray = useRef<any>([]);
  const [jsonObject, setJsonObject] = useState({});
  let tempIndex = 0;

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
    };

    //Prefetch once
    getNistBeacon();
    fetchBeacon();

    requestPermissions();
    const fb = setInterval(fetchBeacon, 3000);
    const nist = setInterval(getNistBeacon, 10000);

    return () => {
      clearInterval(fb);
      clearInterval(nist);
    };
  }, []);

  const generatePhash = Worklets.createRunOnJS(async (frameData: any) => {
    if (!canvasRef.current) {
      console.log('In if-condition');
      return;
    }

    const canvas: any = canvasRef.current;
    const ctx = await canvas.getContext('2d');
    canvas.width = 32;
    canvas.height = 32;
    const img = new CanvasImage(canvas);
    const base64complete: string =
      'data:image/png;base64,' + frameData.base64.replace('\n', '').trim();
    img.src = base64complete;
    img.addEventListener('load', onLoadImage);
    async function onLoadImage() {
      if (tempIndex % 2 !== 0) {
        tempIndex++;
        return;
      }
      tempIndex++;
      ctx.drawImage(img, 0, 0, img.width, img.height);
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
        const hash = pHash.hash(formattedData);
        const eachSegmentData: {} = {
          id: extractedFramesDataArray.current.length + 1,
          nistBeaconUniqueId: nistBeacon.current.pulse.outputValue,
          nistBeaconTimeStamp: nistBeacon.current.pulse.timeStamp,
          beaconVersion: nistBeacon.current.pulse.version,
          unixTimestamp: Math.floor(Date.now() / 1000),
          localBeaconUniqueId: localBeacon.current.uniqueValue,
          localBeaconTimestamp: localBeacon.current.timestamp,
          timeStamp: new Date(),
          hash,
          uniqueSegmentId: uuid.v4(),
        };

        console.log(eachSegmentData);
        console.log(
          '=======================================================================================================',
        );
        extractedFramesDataArray.current = [
          ...extractedFramesDataArray.current,
          eachSegmentData,
        ];
        setJsonObject(eachSegmentData);
        setQrcodeData((prev: any) => [...prev, eachSegmentData]);
      } catch (e: any) {
        console.error('Error with fetching image data:', e);
      }
    }
  });

  const convertVideo = async (inputPath: string) => {
    try {
      // inputPath =
      //   '/data/user/0/com.awesomeproject/cache/mrousavy8939969087001153279.mov';
      const outputPath = `${
        RNFS.PicturesDirectoryPath
      }/video_${Date.now()}.mp4`;
      // const watermarkPaths = [
      //   '/data/user/0/com.awesomeproject/cache/qrcode_0.png',
      //   '/data/user/0/com.awesomeproject/cache/qrcode_1.png',
      //   '/data/user/0/com.awesomeproject/cache/qrcode_2.png',
      // ];

      const watermarkPaths = extractedFramesDataArray.current.map(
        (e: any) => e.qrcodePath,
      );

      const overlayDuration = 5; // duration for each watermark in seconds

      // Construct the filter_complex argument
      const filterComplex = watermarkPaths
        .map((path: string, index: number) => {
          const startTime = index * overlayDuration;
          const endTime = startTime + overlayDuration;
          const prevOverlay = index === 0 ? '[0:v]' : `[v${index}]`;
          return `${prevOverlay}[${
            index + 1
          }:v] overlay=W-w-10:H-h-10:enable='between(t,${startTime},${endTime})'[v${
            index + 1
          }]`;
        })
        .join(';');

      // FFmpeg command to convert the video
      const command: string = `-i ${inputPath} ${watermarkPaths
        .map((path: string) => `-i ${path}`)
        .join(' ')} -filter_complex "${filterComplex}" -map [v${
        watermarkPaths.length
      }] -c:v mpeg4 -q:v 20 -c:a copy ${outputPath}`; // Run FFmpeg command

      const session = await FFmpegKit.execute(command);
      // `-i /data/user/0/com.awesomeproject/cache/mrousavy8939969087001153279.mov -i /data/user/0/com.awesomeproject/cache/qrcode_0.png -i /data/user/0/com.awesomeproject/cache/qrcode_1.png -i /data/user/0/com.awesomeproject/cache/qrcode_2.png -filter_complex "[0:v][1:v] overlay=W-w-10:H-h-10:enable='between(t,0,5)'[v1];[v1][2:v] overlay=W-w-10:H-h-10:enable='between(t,5,10)'[v2];[v2][3:v] overlay=W-w-10:H-h-10:enable='between(t,10,15)'[v3]" -map [v3] -c:a copy /storage/emulated/0/Pictures/video_1727097387107.mp4`,

      // Unique session id created for this execution
      const sessionId = session.getSessionId();
      console.log(`sessionId===> ${sessionId}`);

      // Command arguments as a single string
      const comd = session.getCommand();
      console.log(`command===> ${comd}`);
    } catch (error) {
      console.error('FFmpeg command failed', error);
    } finally {
      setIsLoaderActive(false);
    }
  };

  const saveQRCode = async () => {
    return new Promise(async (resolve, reject) => {
      if (qrCodeRefs.current) {
        const savePromises = qrCodeRefs.current.map(
          (eachRef: any, index: number) => {
            return new Promise((resolveInner: any) => {
              eachRef.toDataURL(async (data: string) => {
                try {
                  const filePath = `${RNFS.CachesDirectoryPath}/qrcode_${index}.png`;
                  const fileExists = await RNFS.exists(filePath);
                  if (fileExists) {
                    await RNFS.unlink(filePath);
                  }
                  await RNFS.writeFile(filePath, data, 'base64');
                  extractedFramesDataArray.current[index].qrcodePath = filePath;
                  resolveInner(filePath); // Resolve the promise with file path
                } catch (err) {
                  console.error('Error saving QR code image:', err);
                  resolveInner(undefined); // Resolve with undefined in case of error
                }
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
        tempIndex = 0;
        extractedFramesDataArray.current = [];
        setQrcodeData([]);
        lastFrameTimestampRef.current = null;
        setIsRecording(true);
        await cameraRef.current.startRecording({
          onRecordingFinished: async (finishedVideo: VideoFile) => {
            setIsLoaderActive(true);
            setIsRecording(false);
            const paths = await saveQRCode();
            console.log('Paths==> ' + paths);
            convertVideo(finishedVideo.path);
          },
          onRecordingError: error => {
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

  // Frame processor to process frames based on 5-second interval
  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet'; // Declare worklet function

      const frameTimestamp = frame.timestamp; // Timestamp of the current frame in nanoseconds

      if (!lastFrameTimestampRef.current) {
        lastFrameTimestampRef.current = frameTimestamp; // Store the first frame's timestamp
      }

      // Calculate the time difference in seconds
      const timeDiffInSeconds =
        (frameTimestamp - lastFrameTimestampRef.current) / 1e9; // Convert from nanoseconds to seconds
      if (timeDiffInSeconds >= 5 && isRecording) {
        // If 5 seconds have passed since the last frame was extracted
        lastFrameTimestampRef.current = frameTimestamp; // Update last extracted time
        const imgData = crop(frame, {
          includeImageBase64: true,
          saveAsFile: false,
        });
        generatePhash(imgData);
      }
    },
    [isRecording],
  );

  if (!device) {
    return <Text>Loading Camera...</Text>;
  }

  return (
    <View style={styles.container}>
      {hasPermissions ? (
        <>
          {isLoaderActive && <Loader />}
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            frameProcessor={frameProcessor} // Use the frame processor
            device={device}
            isActive={true}
            video={true}
            audio={true}
            onInitialized={() => handleCameraInitialized(true)} // Camera initialized callback
          />

          <Canvas
            style={{backgroundColor: 'white', height: 32, width: 32}}
            ref={canvasRef}
          />
          <QrCodeComponent
            qrCodeData={qrCodeData}
            extractedFramesDataArray={extractedFramesDataArray}
            qrCodeRefs={qrCodeRefs}
          />

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

        //   <TouchableOpacity
        //     onPress={() => {
        //       processImagesFromQueue(IMAGE_URLS);
        //     }}
        //     style={styles.button}>
        //     <Text style={styles.text}>Start Recording</Text>
        //   </TouchableOpacity>
        //   {pixelDataArray.map((a: any) => (
        //     <Text style={{color: 'white'}}>{JSON.stringify(a)}</Text>
        //   ))}
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
});
