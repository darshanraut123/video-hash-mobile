import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import React from 'react';
import {launchImageLibrary} from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import RNQRGenerator from 'rn-qr-generator';
import {findVideoInfo, saveVerifyLogs} from '../../../service/hash-requests';
import Loader from '../../../components/loader';
import Canvas, {Image as CanvasImage} from 'react-native-canvas';
import pHash from '../../../util/phash';
import {
  extractEveryFrameWithTimestamp,
  extractFirstFrameAndGetVideoInfoFromDB,
  extractSegmentFramesForPHash,
  extractSegmentFramesForQrcode,
  getPhotoInfoFromDb,
  getVideoDuration,
} from '../../../util/ffmpeg-util';
import {calculateHammingDistance, percentageMatch} from '../../../util/common';
import Video from 'react-native-video';
import {Paths} from '../../../navigation/path';
import Toast from 'react-native-toast-message';
import styles from './style';
import {Image} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../../components/header';
import Icon from 'react-native-vector-icons/Ionicons'; // If you want to use vector icons

const VerifyScreen: React.FC<any> = ({route, navigation}) => {
  const [videoRecordFoundInfo, setVideoRecordFoundInfo] =
    React.useState<any>(null);
  const [isLoaderActive, setIsLoaderActive] = React.useState<any>(null);
  const [uri, setUri] = React.useState<any>(null);
  const canvasRef = React.useRef<any>();
  let currentSegmentInfo: any = null;
  const routeParams = route.params; // Extract path from route.params

  React.useEffect(() => {
    if (routeParams?.path) {
      console.log('path: ' + routeParams.path);
      routeParams.isPhoto
        ? verifyPhoto('file://' + routeParams.path)
        : verifyVideo('file://' + routeParams.path); // Call verifyVideo when the component mounts or path changes
      setUri('file://' + routeParams.path);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeParams]); // Dependency array ensures this runs only when `path` changes

  const pickAndVerifyVideo = async () => {
    const res: any = await launchImageLibrary({mediaType: 'mixed'});
    if (!res) {
      return;
    }
    console.log(res);
    const pickedUri: any = res.assets[0].uri;
    console.log('pickedUri: ' + pickedUri);
    setUri(pickedUri);

    if (res.assets[0].type.includes('image')) {
      verifyPhoto(pickedUri); // Call verifyVideo when the component mounts or path changes
    } else {
      verifyVideo(pickedUri); // Call verifyVideo when the component mounts or path changes
    }
  };

  async function verifyPhoto(localUri: string) {
    setIsLoaderActive('Starting verification process');
    let user: any = await AsyncStorage.getItem('user');
    user = JSON.parse(user);
    const response = await getPhotoInfoFromDb(localUri);
    let generatedPhash: any = await generatePhashFromFrames([localUri]);
    generatedPhash = generatedPhash[0];
    if (response && response.document && generatedPhash) {
      const photoHash: string = response.document.photoHash;
      console.log('photoHash ==> ' + JSON.stringify(photoHash));
      console.log('generatedPhash ==> ' + JSON.stringify(generatedPhash));

      const hammingDistanceLocal = calculateHammingDistance(
        photoHash,
        generatedPhash,
      );
      let percentageHammingDistance =
        (hammingDistanceLocal / photoHash.length) * 100;
      percentageHammingDistance = 100 - percentageHammingDistance;

      setVideoRecordFoundInfo({
        ...response.document,
        averageDistance: percentageHammingDistance,
      });
      console.log(
        JSON.stringify({...response.document, percentageHammingDistance}),
      );
    } else {
      console.log({
        email: user.email,
        name: user.name,
        message: 'No video id was found or qr code read failed',
        uri,
      });
      Toast.show({
        type: 'info',
        text1: 'Not found',
        text2: 'No data found in records 👋',
        position: 'bottom',
      });
    }
    setIsLoaderActive(null);
  }

  function roundToNearest(value: number) {
    // If the value has a decimal part >= 0.5, round up, else round down
    return value % 1 >= 0.5 ? Math.ceil(value) : Math.floor(value);
  }

  async function verifyVideo(pickedUri: string) {
    try {
      setIsLoaderActive('Preparing verification');
      setVideoRecordFoundInfo(null);
      let videoInfoFromDB = await extractFirstFrameAndGetVideoInfoFromDB(
        pickedUri,
      );
      if (!videoInfoFromDB?.document) {
        let user: any = await AsyncStorage.getItem('user');
        user = JSON.parse(user);
        await saveVerifyLogs({
          verifierEmail: user.email,
          verifierName: user.name,
          message: 'No video id was found or qr code read failed',
          uri: pickedUri,
          videoId: 'NA',
          verifyVideoHashes: [],
          originalVideoHashes: [],
        });
        Toast.show({
          type: 'info',
          text1: 'Not found',
          text2: 'No matching records found👋',
          position: 'bottom',
        });
        return;
      }
      console.log(
        'videoInfoFromDB: ' + JSON.stringify(videoInfoFromDB.document),
      );
      let verifyVideoDuration: number = await getVideoDuration(pickedUri);
      verifyVideoDuration = roundToNearest(verifyVideoDuration);
      const dbVideoDuration = roundToNearest(videoInfoFromDB.document.duration);
      console.log(`pickedUri: ${pickedUri}`);
      if (verifyVideoDuration === dbVideoDuration) {
        await verifyNonTrimmedVideo(pickedUri);
      } else {
        setIsLoaderActive('Starting verification process');
        await verifyTrimmedVideo({
          pickedUri,
          videoInfoFromDB: videoInfoFromDB.document,
        });
      }
    } catch (error) {
      console.log('Error picking video: ', error);
      setVideoRecordFoundInfo(null);
    } finally {
      setIsLoaderActive(null);
    }
  }

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

  async function verifyNonTrimmedVideo(uriLocal: string) {
    let user: any = await AsyncStorage.getItem('user');
    user = JSON.parse(user);
    setIsLoaderActive('Extracting frames for decoding qrcode');
    const frms = await extractSegmentFramesForPHash(uriLocal);
    console.log('extractSegmentFramesForPHash ==> ' + JSON.stringify(frms));
    const generatedHashes: any = await generatePhashFromFrames(frms);
    const verifycroppedframePaths: any = await extractSegmentFramesForQrcode(
      uriLocal,
    );
    console.log(
      'verifycroppedframePaths paths ==> ' +
        JSON.stringify(verifycroppedframePaths),
    );

    let videoId: string = '';
    setIsLoaderActive('Decoding qr codes');

    for (let index = 0; index < verifycroppedframePaths.length; index++) {
      const response = await RNQRGenerator.detect({
        uri: 'file://' + verifycroppedframePaths[index],
      });
      const {values} = response; // Array of detected QR code values. Empty if nothing found.
      console.log('values: ' + JSON.stringify(values));
      if (values.length) {
        const decodedQrcode: any = JSON.parse(values[0]);
        videoId = decodedQrcode.id;
        break;
      }
    }
    setIsLoaderActive('Fetching records for matching videos');
    if (!videoId) {
      await saveVerifyLogs({
        verifierEmail: user.email,
        verifierName: user.name,
        message: 'No video id was found or qr code read failed',
        uri: uriLocal,
        videoId: 'NA',
        verifyVideoHashes: [],
        originalVideoHashes: [],
      });
      Toast.show({
        type: 'info',
        text1: 'Not found',
        text2: 'No matching records found👋',
        position: 'bottom',
      });
      return;
    }
    const response = await findVideoInfo(videoId);
    if (response.document) {
      const dbHashSegments: any[] = response.document.segments.map(
        (s: any) => s.videoHash,
      );
      console.log('dbSegments ==> ' + JSON.stringify(dbHashSegments));
      console.log('generatedSegments ==> ' + JSON.stringify(generatedHashes));

      if (dbHashSegments.length === generatedHashes.length) {
        const averageDistance = percentageMatch(
          dbHashSegments,
          generatedHashes,
        );
        setVideoRecordFoundInfo({...response.document, averageDistance});
        console.log(JSON.stringify({...response.document, averageDistance}));
        await saveVerifyLogs({
          verifierEmail: user.email,
          verifierName: user.name,
          message: 'Found a match',
          uri: uriLocal,
          videoId,
          verifyVideoHashes: generatedHashes,
          originalVideoHashes: dbHashSegments,
          averageDistance,
        });
      } else {
        await saveVerifyLogs({
          verifierEmail: user.email,
          verifierName: user.name,
          message: 'No data found',
          uri: uriLocal,
          videoId,
          verifyVideoHashes: generatedHashes,
          originalVideoHashes: dbHashSegments,
        });
        Toast.show({
          type: 'info',
          text1: 'Not found',
          text2: 'No data found in records 👋',
          position: 'bottom',
        });
      }
    } else {
      setVideoRecordFoundInfo(null);
      await saveVerifyLogs({
        verifierEmail: user.email,
        verifierName: user.name,
        message: 'No video id was found in DB',
        uri: uriLocal,
        videoId,
        verifyVideoHashes: generatedHashes,
      });
      Toast.show({
        type: 'info',
        text1: 'Not found',
        text2: 'No data found in records 👋',
        position: 'bottom',
      });
    }
  }

  async function verifyTrimmedVideo({pickedUri, videoInfoFromDB}: any) {
    let user: any = await AsyncStorage.getItem('user');
    user = JSON.parse(user);
    console.log('duration not same ie video is trimmed ' + pickedUri);
    const videoSegmentsInfoFromDB: any = videoInfoFromDB.segments;
    let videoSegmentInfoFromVerifyVideo: any[] = [];
    const sortedFilePaths: string[] = await extractEveryFrameWithTimestamp(
      pickedUri,
    );
    console.log('first ' + sortedFilePaths[0]);
    console.log(`last ${sortedFilePaths[sortedFilePaths.length - 1]}`);
    console.log('length ' + sortedFilePaths.length);
    let flag: boolean = true;
    setIsLoaderActive('Extracting QR codes');
    for (let index = 0; index < sortedFilePaths.length; index++) {
      const response = await RNQRGenerator.detect({
        uri: 'file://' + sortedFilePaths[index],
      });
      const {values}: any = response; // Array of detected QR code values. Empty if nothing found.
      let timestampOfChange: string = sortedFilePaths[index]
        .split('_')[1]
        .split('.')[0];
      const timeStampseconds: number = +timestampOfChange / 30;
      if (values.length) {
        const qrcodeData: any = JSON.parse(values[0]);
        if (!currentSegmentInfo) {
          console.log('Found first segment ID of trimmed part');
          currentSegmentInfo = qrcodeData;

          const generatedHashes: any = await generatePhashFromFrames([
            sortedFilePaths[index],
          ]);
          const onlyRequiredPhash: string = generatedHashes[0];
          console.log(
            'Extracted Phash ' +
              onlyRequiredPhash +
              ' for frame: ' +
              sortedFilePaths[index],
          );
          currentSegmentInfo.verifyPhash = onlyRequiredPhash;
          currentSegmentInfo.timeStampseconds = timeStampseconds;
          videoSegmentInfoFromVerifyVideo.push(currentSegmentInfo);
          continue;
        } else if (currentSegmentInfo.no === qrcodeData.no) {
          continue;
        } else {
          console.log('QR code change found');
          currentSegmentInfo = qrcodeData;
          const generatedHashes: any = await generatePhashFromFrames([
            sortedFilePaths[index],
          ]);
          const onlyRequiredPhash: string = generatedHashes[0];
          console.log(
            'Extracted Phash ' +
              onlyRequiredPhash +
              ' for frame: ' +
              sortedFilePaths[index],
          );
          if (flag) {
            // First change from one hash to another hash found
            console.log(`timeStampseconds: ${timeStampseconds}`);
            flag = false;
          }
          currentSegmentInfo.verifyPhash = onlyRequiredPhash;
          currentSegmentInfo.timeStampseconds = timeStampseconds;
          videoSegmentInfoFromVerifyVideo.push(currentSegmentInfo);
        }
      } else {
        console.log('failed to detect QR code');
      }
    }

    setIsLoaderActive('Fetching matching records');

    console.log(`FINAL DB ARR ===> ${JSON.stringify(videoSegmentsInfoFromDB)}`);
    console.log(
      `FINAL Verify Vid ARR ===> ${JSON.stringify(
        videoSegmentInfoFromVerifyVideo,
      )}`,
    );

    const firstFound = videoSegmentsInfoFromDB.find(
      (i: any) => i.videoHash.length > 0,
    );
    let defaultPhash = firstFound.videoHash;
    console.log('defaultPhash: ' + defaultPhash);
    // Merge function
    const mergedFinalArray = videoSegmentsInfoFromDB.map((item1: any) => {
      const match = videoSegmentInfoFromVerifyVideo.find(
        item2 => item2.no === item1.no,
      );

      if (match) {
        return {...item1, verifyPhash: match.verifyPhash}; // Merge matching items
      } else {
        return {...item1, verifyPhash: defaultPhash}; // Add default phash if no match
      }
    });

    console.log('mergedFinalArray: ' + JSON.stringify(mergedFinalArray));

    const dbHashSegments = mergedFinalArray.map((item: any) => item.videoHash);
    const generatedHashes = mergedFinalArray.map(
      (item: any) => item.verifyPhash,
    );

    // const res = calculateSegmentOverlap(
    //   videoSegmentsInfoFromDB,
    //   videoSegmentInfoFromVerifyVideo,
    // );
    // console.log(JSON.stringify(res));
    if (dbHashSegments.length === generatedHashes.length) {
      console.log('videoInfoFromDB : ' + JSON.stringify(videoInfoFromDB));
      const averageDistance = percentageMatch(dbHashSegments, generatedHashes);
      setVideoRecordFoundInfo({...videoInfoFromDB, averageDistance});
      await saveVerifyLogs({
        verifierEmail: user.email,
        verifierName: user.name,
        message: 'Match found',
        uri: pickedUri,
        videoId: defaultPhash,
        verifyVideoHashes: generatedHashes,
        originalVideoHashes: dbHashSegments,
      });
      Toast.show({
        type: 'success',
        text1: averageDistance + ' % Match',
        text2: 'We found a matching record 👋',
        position: 'bottom',
      });
    } else {
      await saveVerifyLogs({
        verifierEmail: user.email,
        verifierName: user.name,
        message: 'Not found',
        uri: pickedUri,
        videoId: defaultPhash,
        verifyVideoHashes: generatedHashes,
        originalVideoHashes: dbHashSegments,
      });
      Toast.show({
        type: 'info',
        text1: 'Not found',
        text2: 'No matching records found👋',
        position: 'bottom',
      });
    }
    setIsLoaderActive(null);
  }

  return (
    <>
      <Header
        screenName="Upload & Score"
        onBackArrowPress={() => navigation.goBack()}
        onMenuPress={() => navigation.navigate(Paths.Goto)}
      />
      <View style={styles.container}>
        <Canvas style={styles.canvasContainer} ref={canvasRef} />

        {!isLoaderActive && (
          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={pickAndVerifyVideo}>
            <Text style={styles.btnTxt}>New Upload</Text>
          </TouchableOpacity>
        )}

        {uri ? (
          <>
            <View style={styles.imageContainer}>
              {isLoaderActive && <Loader loaderText="Uploading" />}
              {['.png', '.jpg', '.jpeg'].some(ext =>
                uri.toLowerCase().endsWith(ext),
              ) ? (
                <Image
                  source={{uri}}
                  style={styles.image}
                  resizeMode="contain"
                />
              ) : (
                <Video
                  source={{uri}}
                  style={styles.image}
                  resizeMode="contain"
                />
              )}
            </View>
            {!isLoaderActive && !videoRecordFoundInfo && (
              <Text style={styles.uploadTxt}>No records found </Text>
            )}
          </>
        ) : (
          <View>
            <Text style={styles.uploadTxt}>
              {' '}
              Upload a video or photo to receive a confidence score
            </Text>
          </View>
        )}

        {videoRecordFoundInfo && (
          <ScrollView>
            <Text style={styles.confidenceTitle}>
              Confidence Score:{' '}
              {Math.round(videoRecordFoundInfo?.averageDistance)}
            </Text>

            <View style={styles.container}>
              {/* Registered Information */}

              <View style={styles.row}>
                <Text style={styles.label}>Registered by:</Text>
                <Text style={styles.value}>
                  {videoRecordFoundInfo.user?.name}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Registered on:</Text>
                <Text style={styles.value}>
                  {new Date(videoRecordFoundInfo.createdAt).toDateString()}
                </Text>
              </View>

              {/* Expandable Sections */}
              <ExpandableSection title="Metadata" data={videoRecordFoundInfo} />
            </View>
          </ScrollView>
        )}
        <Toast />
      </View>
    </>
  );
};

const ExpandableSection = ({title, data}: any) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <View style={styles.sectionContainer}>
      {/* Header with chevron */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}>
        <Text style={styles.label}>{title}</Text>
        <Icon
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#000"
        />
      </TouchableOpacity>

      {/* Expandable Content */}
      {expanded && (
        <View style={styles.content}>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Id:</Text>
            <Text style={styles.tableValue}>{data._id}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Author Name:</Text>
            <Text style={styles.tableValue}>{data.user?.name}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Author Email:</Text>
            <Text style={styles.tableValue}>{data.user?.email}</Text>
          </View>
          {data?.duration && (
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Duration:</Text>
              <Text style={styles.tableValue}>{data.duration}</Text>
            </View>
          )}
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Latitude:</Text>
            <Text style={styles.tableValue}>{data.gps?.latitude}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Longitude:</Text>
            <Text style={styles.tableValue}>{data.gps?.longitude}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Altitude:</Text>
            <Text style={styles.tableValue}>{data.gps.altitude}</Text>
          </View>

          {Object.keys(data.device).map((key: any) => (
            <View key={key} style={styles.tableRow}>
              <Text style={styles.tableLabel}>{key}:</Text>
              <Text style={styles.tableValue}>
                {JSON.stringify(data.device[`${key}`])}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default VerifyScreen;
