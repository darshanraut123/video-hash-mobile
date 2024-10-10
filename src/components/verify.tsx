import {View, Text, Button, ScrollView} from 'react-native';
import React from 'react';
import {launchImageLibrary} from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import {FFmpegKit} from 'ffmpeg-kit-react-native';
import RNQRGenerator from 'rn-qr-generator';
import {findVideoHash} from '../api-requests/requests';
import Loader from './loader';

export default function Verify() {
  const [videoFound, setVideoFound] = React.useState<any>(null);
  const [isLoaderActive, setIsLoaderActive] = React.useState<any>(null);

  async function verifyVideo() {
    try {
      const res: any = await launchImageLibrary({mediaType: 'video'});
      const uri: any = res.assets[0].uri;
      console.log(uri);
      setIsLoaderActive('Extracting frames for decoding qrcode');
      const allFramesPaths: any = await extractSegmentFramesForQrcode(uri);
      console.log('Frames paths ==> ' + JSON.stringify(allFramesPaths));
      let videoId: string = '';
      setIsLoaderActive('Decoding qr codes');

      for (let index = 0; index < allFramesPaths.length; index++) {
        const response = await RNQRGenerator.detect({
          // uri: allFramesPaths[index],
          base64: allFramesPaths[index], // If uri is passed this option will be skipped.
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
      console.log(response);
      if (response.document) {
        setVideoFound(response.document);
      } else {
        setVideoFound(null);
      }
    } catch (error) {
      console.log('Error picking video: ', error);
      setVideoFound(null);
    } finally {
      setIsLoaderActive(null);
    }
  }

  const extractSegmentFramesForQrcode = async (path: any) => {
    try {
      let files = await RNFS.readDir(RNFS.PicturesDirectoryPath); // Read the directory
      let frameFiles = files.filter(file => {
        return file.name.includes('frames') && file.isFile();
      });

      // Delete each file that starts with "frames"
      for (const file of frameFiles) {
        await RNFS.unlink(file.path);
      }

      const command = `-y -i ${path} -vf "fps=1/5, crop=iw/2:ih/2:iw/2:0" -vsync 0 ${
        RNFS.PicturesDirectoryPath
      }/${Date.now()}veryfyframes%d.png`;

      const session = await FFmpegKit.execute(command);
      console.log('session' + session);
      files = await RNFS.readDir(RNFS.PicturesDirectoryPath); // Read the directory
      frameFiles = files.filter(file => {
        return file.name.includes('veryfyframes') && file.isFile();
      });
      // Use Promise.all to convert all frame files to Base64 concurrently
      const framePaths = await Promise.all(
        frameFiles.map(async eachFile => {
          return await RNFS.readFile(eachFile.path, 'base64');
        }),
      );

      return framePaths; // Returns an array of Base64 strings
    } catch (e: any) {
      console.log(e.message);
    }
  };

  return (
    <>
      {isLoaderActive && <Loader loaderText={isLoaderActive} />}
      <View>
        <Button
          title="Please tap to select a video file from library"
          onPress={verifyVideo}
        />
        <ScrollView>
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
