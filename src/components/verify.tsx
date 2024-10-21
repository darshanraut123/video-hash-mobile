import {View, Text, Button, ScrollView, Alert} from 'react-native';
import React from 'react';
import {launchImageLibrary} from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import RNQRGenerator from 'rn-qr-generator';
import {findVideoHash} from '../api-requests/requests';
import Loader from './loader';
import Canvas, {Image as CanvasImage} from 'react-native-canvas';
import pHash from '../util/phash';
import {Paths} from '../navigation/path';
import {
  extractEveryFrameWithTimestamp,
  extractFirstFrameAndGetVideoInfoFromDB,
  extractSegmentFramesForPHash,
  extractSegmentFramesForQrcode,
  getVideoDuration,
} from '../util/ffmpegUtil';
import {hammingDistance, percentageMatch} from '../util/common';

export default function Verify({navigation}: any) {
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
      videoInfoFromDB = videoInfoFromDB.document;
      console.log('videoInfoFromDB ' + JSON.stringify(videoInfoFromDB));

      if (!videoInfoFromDB) {
        Alert.alert('No Records found');
        return;
      }
      const verifyVideoDuration = await getVideoDuration(uri);
      const dbVideoDuration = parseFloat(videoInfoFromDB.duration).toFixed(1);
      console.log(
        `verifyVideoDuration: ${verifyVideoDuration} | dbVideoDuration: ${dbVideoDuration}`,
      );
      if (verifyVideoDuration === dbVideoDuration) {
        await verifyNonTrimmedVideo(uri);
      } else {
        await verifyTrimmedVideo({uri, videoInfoFromDB});
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
    const response = await findVideoHash(videoId);
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
    // const verifyVideoSegmentHashes: any[] = [];
    let videoSegmentsInfoFromDB: any = videoInfoFromDB.segments;
    const videoSegmentHashesFromDB: string[] = videoSegmentsInfoFromDB.map(
      (eachFromdb: any) => eachFromdb.videoHash,
    );
    console.log(
      'DB segment video hashes ' + JSON.stringify(videoSegmentHashesFromDB),
    );

    const sortedFilePaths: string[] = await extractEveryFrameWithTimestamp(uri);
    console.log('first ' + sortedFilePaths[0]);
    console.log(`last ${sortedFilePaths[sortedFilePaths.length - 1]}`);
    console.log('length ' + sortedFilePaths.length);
    let flag: boolean = true;
    const percentage4Average: number[] = [];
    for (let index = 0; index < sortedFilePaths.length; index++) {
      const response = await RNQRGenerator.detect({
        uri: sortedFilePaths[index],
      });
      const {values}: any = response; // Array of detected QR code values. Empty if nothing found.

      if (values.length) {
        const qrcodeData: any = JSON.parse(values[0]);
        if (!currentSegmentInfo) {
          console.log('Found first segment ID of trimmed part');
          currentSegmentInfo = qrcodeData;
          let timestampOfChange: string = sortedFilePaths[index]
            .split('_')[1]
            .split('.')[0];
          console.log(+timestampOfChange / 30 + ' seconds');
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
          continue;
        } else if (currentSegmentInfo.segmentId === qrcodeData.segmentId) {
          // console.log('Same segment id found, waiting for QR code to change');
          continue;
        } else {
          console.log('QR code change found');
          currentSegmentInfo = qrcodeData;
          let timestampOfChange: string = sortedFilePaths[index]
            .split('_')[1]
            .split('.')[0];
          const timeStampseconds: number = +timestampOfChange / 30;
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
            console.log(`timeStampseconds: ${timeStampseconds}`);
            console.log(`Trimmed video duration : ${5 - timeStampseconds}`);
            percentage4Average.push(timeStampseconds * 20);
            flag = false;
            continue;
          }
          percentage4Average.push(
            hammingDistance(videoSegmentHashesFromDB[index], onlyRequiredPhash),
          );
        }
      } else {
        console.log('failed to detect QR code');
      }
    }
    console.log(`FINAL ARR ===> ${JSON.stringify(percentage4Average)}`);
  }

  return (
    <>
      {isLoaderActive && <Loader loaderText={isLoaderActive} />}
      <View>
        <Button
          title="Please tap to select a video file from library"
          onPress={verifyVideo}
        />
        <Button
          title="convert variant"
          onPress={extractSegmentFramesForPHash}
        />
        <Button
          title="Sign In Page"
          onPress={() =>
            navigation.navigate(Paths.Auth, {screen: Paths.SignIn})
          }
        />
        <Button
          title="Sign Up Page"
          onPress={() =>
            navigation.navigate(Paths.Auth, {screen: Paths.SignUp})
          }
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
