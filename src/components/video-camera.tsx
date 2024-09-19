import React, {useEffect, useState, useRef, useCallback} from 'react';
import uuid from 'react-native-uuid';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
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
import {FFmpegKitConfig} from 'ffmpeg-kit-react-native';
import {getLocalBeaconAPI, getNistBeaconAPI} from '../api-requests/requests';
import {Worklets} from 'react-native-worklets-core';
import pHash from '../util/phash';
import Svg, {Path} from 'react-native-svg';

export default function VideoCamera() {
  const devices: any = useCameraDevices();
  const lastFrameTimestampRef = useRef<number | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [device, setDevice] = useState<CameraDevice>();
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isCameraInitialized, handleCameraInitialized] = useState(false);
  const qrCodeRef = useRef<any>();
  const canvasRef = useRef<any>();
  const nistBeacon = useRef<any>();
  const outputArray = useRef<any>([]);
  const [jsonObject, setJsonObject] = useState({});

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
        // console.log('formattedData===> ' + formattedData);
        const hash = pHash.hash(formattedData);
        const eachSegmentData: {} = {
          id: outputArray.current.length + 1,
          frameTimestamp: frameData.frameTimestamp,
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
        outputArray.current = [...outputArray.current, eachSegmentData];
        // console.log('Length==> ' + outputArray.current.length);
      } catch (e: any) {
        console.error('Error with fetching image data:', e);
      }
    }
  });

  // const generateAndSaveQRCode = async () => {
  //   if (qrCodeRef.current) {
  //     for (let index = 0; index < outputArray.current.length; index++) {
  //       const awaited = () => {
  //         return new Promise<void>((resolve): void => {
  //           const each = outputArray.current[index];
  //           setJsonObject(each);
  //           console.log('Processing qrcode for id: ' + each.id);
  //           qrCodeRef.current.toDataURL(async (data: string) => {
  //             try {
  //               const filePath = `${RNFS.PicturesDirectoryPath}/qrcode_${each.id}.png`;
  //               await RNFS.writeFile(filePath, data, 'base64');
  //               console.log('QR Code Saved', `Image saved at ${filePath}`);
  //               resolve();
  //             } catch (err) {
  //               console.error('Error saving QR code image:', err);
  //               resolve();
  //             }
  //           });
  //         });
  //       };
  //       await awaited();
  //     }
  //   }
  // };

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

  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      try {
        lastFrameTimestampRef.current = null;
        setIsRecording(true);
        await cameraRef.current.startRecording({
          onRecordingFinished: (finishedVideo: VideoFile) => {
            // console.log('Finished Video==> ' + finishedVideo);
            setIsRecording(false);
            // saveVideo(finishedVideo.path);
            // outputArray.current.forEach((element: any, index: number) => {
            //   console.log(
            //     'Index+1 ' +
            //       index +
            //       ' Each O/P ---> ' +
            //       JSON.stringify(element),
            //   );
            // });
            // generateAndSaveQRCode();
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

  // // Function to save the video to the Camera Roll
  // const saveVideo = async (videoPath: string) => {
  //   try {
  //     const savedUri = await CameraRoll.save(videoPath, {type: 'video'});
  //     Alert.alert('Video Saved', 'Video has been saved to your gallery!');
  //     console.log('Video saved to camera roll:', savedUri);
  //   } catch (error) {
  //     console.log('Error saving video:', error);
  //     Alert.alert('Error', 'Failed to save video');
  //   }
  // };

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
        const result = crop(frame, {
          includeImageBase64: true,
          saveAsFile: false,
        });
        generatePhash(result);
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
          {/* <Button title="Click" onPress={generatePhash} /> */}
          {isRecording && (
            <View style={styles.qrcodeContainer}>
              <QRCode
                backgroundColor="white"
                value={JSON.stringify(jsonObject)}
                size={50}
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
