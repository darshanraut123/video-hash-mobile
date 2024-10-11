import {View, Text, Button, ScrollView, Alert} from 'react-native';
import React from 'react';
import {launchImageLibrary} from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import {FFmpegKit} from 'ffmpeg-kit-react-native';
import RNQRGenerator from 'rn-qr-generator';
import {findVideoHash} from '../api-requests/requests';
import Loader from './loader';
import Canvas, {Image as CanvasImage} from 'react-native-canvas';
import pHash from '../util/phash';

export default function Verify() {
  const [videoFound, setVideoFound] = React.useState<any>(null);
  const [isLoaderActive, setIsLoaderActive] = React.useState<any>(null);
  const canvasRef = React.useRef<any>();

  async function verifyVideo() {
    try {
      setVideoFound(null);
      const res: any = await launchImageLibrary({mediaType: 'video'});
      const uri: any = res.assets[0].uri;
      console.log(uri);
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
          // base64: verifycroppedframePaths[index], // If uri is passed this option will be skipped.
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

      const response = await findVideoHash(videoId);
      if (response.document) {
        setVideoFound(response.document);
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
          setVideoFound(response.document);
          Alert.alert(averageDistance + ' % Match');
        } else {
          Alert.alert('No records found!');
        }
      } else {
        setVideoFound(null);
        Alert.alert('No records found!');
      }
    } catch (error) {
      console.log('Error picking video: ', error);
      setVideoFound(null);
    } finally {
      setIsLoaderActive(null);
    }
  }

  function hammingDistance(str1: string, str2: string) {
    let distance = 0;

    // Calculate the Hamming distance
    for (let i = 0; i < str1.length; i++) {
      if (str1[i] !== str2[i]) {
        distance++;
      }
    }

    return distance;
  }

  function percentageMatch(arr1: any[], arr2: any[]) {
    let totalDistance = 0;
    let totalBits = arr1[0].length; // Assume all hashes have the same length
    // Calculate Hamming distances for each pair
    for (let i = 0; i < arr1.length; i++) {
      totalDistance += hammingDistance(arr1[i], arr2[i]);
    }
    const avgHammingDistance = totalDistance / arr1.length;

    // Calculate and return the average Hamming
    const percentageHammingDistance = (avgHammingDistance / totalBits) * 100;
    return 100 - percentageHammingDistance;
  }

  const extractSegmentFramesForPHash = async (path: any) => {
    try {
      let files = await RNFS.readDir(RNFS.CachesDirectoryPath); // Read the directory
      let frameFiles = files.filter(file => {
        return file.name.includes('frames') && file.isFile();
      });

      // Delete each file that starts with "frames"
      for (const file of frameFiles) {
        await RNFS.unlink(file.path);
      }

      const command = `-i ${path} -vf "fps=1/5" -vsync 0 ${
        RNFS.CachesDirectoryPath
      }/${Date.now()}finalframes%d.png`;

      const session = await FFmpegKit.execute(command);
      console.log('session' + session);
      files = await RNFS.readDir(RNFS.CachesDirectoryPath); // Read the directory
      frameFiles = files.filter(file => {
        return file.name.includes('finalframes') && file.isFile();
      });
      // Sort the file paths
      const unsorted = frameFiles.map(eachFile => eachFile.path);
      // Sort the file paths based on the numeric suffix before .jpg
      const sortedFilePaths = unsorted.sort((a, b) => {
        const numA = parseInt(a.match(/finalframes(\d+)\.png/)[1]);
        const numB = parseInt(b.match(/finalframes(\d+)\.png/)[1]);
        return numA - numB;
      });

      return sortedFilePaths;
    } catch (e: any) {
      console.log(e.message);
    }
  };

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

  const extractSegmentFramesForQrcode = async (path: any) => {
    try {
      let files = await RNFS.readDir(RNFS.CachesDirectoryPath); // Read the directory
      let frameFiles = files.filter(file => {
        return file.name.includes('frames') && file.isFile();
      });

      // Delete each file that starts with "frames"
      for (const file of frameFiles) {
        await RNFS.unlink(file.path);
      }

      let command = `-y -i ${path} -vf "fps=1/5, crop=iw/2:ih/2:iw/2:0" -vsync 0 ${
        RNFS.CachesDirectoryPath
      }/${Date.now()}verifycroppedframes%d.png`;

      let session = await FFmpegKit.execute(command);
      console.log('session' + session);

      files = await RNFS.readDir(RNFS.CachesDirectoryPath); // Read the directory
      frameFiles = files.filter(file => {
        return file.name.includes('verifycroppedframes') && file.isFile();
      });

      const unsorted = frameFiles.map(eachFile => eachFile.path);
      // Sort the file paths based on the numeric suffix before .jpg
      const sortedFilePaths = unsorted.sort((a, b) => {
        const numA = parseInt(a.match(/verifycroppedframes(\d+)\.png/)[1]);
        const numB = parseInt(b.match(/verifycroppedframes(\d+)\.png/)[1]);
        return numA - numB;
      });

      return sortedFilePaths;
    } catch (e: any) {
      console.log(e.message);
    }
  };

  async function convert() {
    const res: any = await launchImageLibrary({mediaType: 'video'});
    const uri: any = res.assets[0].uri;
    console.log(uri);
    let command = `-y -i ${uri} -vf "hue=h=60:s=1" -c:a copy ${
      RNFS.PicturesDirectoryPath
    }/${Date.now()}tinted.mp4`;
    await FFmpegKit.execute(command);
  }

  return (
    <>
      {isLoaderActive && <Loader loaderText={isLoaderActive} />}
      <View>
        <Button
          title="Please tap to select a video file from library"
          onPress={verifyVideo}
        />
        <Button title="convert variant" onPress={convert} />
        <ScrollView>
          <Canvas
            style={{backgroundColor: 'white', height: 32, width: 32}}
            ref={canvasRef}
          />
          {videoFound &&
            Object.keys(videoFound).map((k, i) => (
              <Text key={i}>{`${k} : ${JSON.stringify(
                Object.values(videoFound)[i],
              )}`}</Text>
            ))}
        </ScrollView>
      </View>
    </>
  );
}
