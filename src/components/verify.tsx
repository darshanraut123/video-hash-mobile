import {View, Text, Button, ScrollView, Alert} from 'react-native';
import React from 'react';
import {launchImageLibrary} from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import RNQRGenerator from 'rn-qr-generator';
import {findVideoInfo} from '../service/hashrequests';
import Loader from './loader';
import Canvas, {Image as CanvasImage} from 'react-native-canvas';
import pHash from '../util/phash';
import {
  extractEveryFrameWithTimestamp,
  extractFirstFrameAndGetVideoInfoFromDB,
  extractSegmentFramesForPHash,
  extractSegmentFramesForQrcode,
  getVideoDuration,
} from '../util/ffmpegUtil';
import {
  // calculateSegmentOverlap,
  percentageMatch,
} from '../util/common';

export default function Verify() {
  const [videoRecordFoundInfo, setVideoRecordFoundInfo] =
    React.useState<any>(null);
  const [isLoaderActive, setIsLoaderActive] = React.useState<any>(null);
  const canvasRef = React.useRef<any>();
  let currentSegmentInfo: any = null;

  async function verifyVideo() {
    try {
      setVideoRecordFoundInfo(null);
      const res: any = await launchImageLibrary({mediaType: 'video'});
      const uri: any = res.assets[0].uri;
      console.log(uri);

      let videoInfoFromDB = await extractFirstFrameAndGetVideoInfoFromDB(uri);
      if (!videoInfoFromDB) {
        Alert.alert('No Records found');
        return;
      }
      console.log(
        'videoInfoFromDB: ' + JSON.stringify(videoInfoFromDB.document),
      );
      const verifyVideoDuration = await getVideoDuration(uri);
      const dbVideoDuration = parseFloat(
        videoInfoFromDB.document.duration,
      ).toFixed(1);
      console.log(
        `verifyVideoDuration: ${verifyVideoDuration} | dbVideoDuration: ${dbVideoDuration}`,
      );
      if (verifyVideoDuration === dbVideoDuration) {
        await verifyNonTrimmedVideo(uri);
      } else {
        setIsLoaderActive('Starting verification process');
        await verifyTrimmedVideo({
          uri,
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

  async function verifyNonTrimmedVideo(uri: string) {
    setIsLoaderActive('Extracting frames for decoding qrcode');
    const frms = await extractSegmentFramesForPHash(uri);
    console.log('extractSegmentFramesForPHash ==> ' + JSON.stringify(frms));
    const generatedHashes: any = await generatePhashFromFrames(frms);
    const verifycroppedframePaths: any = await extractSegmentFramesForQrcode(
      uri,
    );
    console.log(
      'verifycroppedframePaths paths ==> ' +
        JSON.stringify(verifycroppedframePaths),
    );

    let videoId: string = '';
    setIsLoaderActive('Decoding qr codes');

    for (let index = 0; index < verifycroppedframePaths.length; index++) {
      const response = await RNQRGenerator.detect({
        uri: verifycroppedframePaths[index],
      });
      const {values} = response; // Array of detected QR code values. Empty if nothing found.
      console.log(values);
      if (values.length) {
        const decodedQrcode: any = JSON.parse(values[0]);
        videoId = decodedQrcode.videoId;
        break;
      }
    }
    setIsLoaderActive('Fetching records for matching videos');
    if (!videoId) {
      Alert.alert('No Records found');
      return;
    }
    const response = await findVideoInfo(videoId);
    if (response.document) {
      setVideoRecordFoundInfo(response.document);
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
        setVideoRecordFoundInfo(response.document);
        Alert.alert(averageDistance + ' % Match');
      } else {
        Alert.alert('No records found!');
      }
    } else {
      setVideoRecordFoundInfo(null);
      Alert.alert('No records found!');
    }
  }

  async function verifyTrimmedVideo({uri, videoInfoFromDB}: any) {
    console.log('duration not same ie video is trimmed ' + uri);
    const videoSegmentsInfoFromDB: any = videoInfoFromDB.segments;
    let videoSegmentInfoFromVerifyVideo: any[] = [];
    const sortedFilePaths: string[] = await extractEveryFrameWithTimestamp(uri);
    console.log('first ' + sortedFilePaths[0]);
    console.log(`last ${sortedFilePaths[sortedFilePaths.length - 1]}`);
    console.log('length ' + sortedFilePaths.length);
    let flag: boolean = true;
    setIsLoaderActive('Extracting QR codes');
    for (let index = 0; index < sortedFilePaths.length; index++) {
      const response = await RNQRGenerator.detect({
        uri: sortedFilePaths[index],
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
        } else if (currentSegmentInfo.segmentId === qrcodeData.segmentId) {
          // console.log('Same segment id found, waiting for QR code to change');
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
        item2 => item2.segmentNo === item1.segmentNo,
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
      const averageDistance = percentageMatch(dbHashSegments, generatedHashes);
      setVideoRecordFoundInfo(videoInfoFromDB);
      Alert.alert(averageDistance + ' % Match');
    } else {
      Alert.alert('No records found!');
    }
    setIsLoaderActive(null);
  }

  return (
    <>
      {isLoaderActive && <Loader loaderText={isLoaderActive} />}
      <View>
        <Button
          title="Please tap to select a video file from library"
          onPress={verifyVideo}
        />
        <ScrollView>
          <Canvas
            // eslint-disable-next-line react-native/no-inline-styles
            style={{backgroundColor: 'white', height: 32, width: 32}}
            ref={canvasRef}
          />
          {videoRecordFoundInfo &&
            Object.keys(videoRecordFoundInfo).map((k, i) => (
              <Text key={i}>{`${k} : ${JSON.stringify(
                Object.values(videoRecordFoundInfo)[i],
              )}`}</Text>
            ))}
        </ScrollView>
      </View>
    </>
  );
}
