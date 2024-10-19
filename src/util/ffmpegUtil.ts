import {FFmpegKit, FFprobeKit} from 'ffmpeg-kit-react-native';
import RNFS from 'react-native-fs';
import RNQRGenerator from 'rn-qr-generator';
import {findVideoHash} from '../api-requests/requests';

export async function getVideoDuration(uri: string) {
  try {
    const command = `-i ${uri} -show_entries format=duration -v quiet -of csv="p=0"`;
    const session = await FFprobeKit.execute(command);
    const output = await session.getOutput();
    const recorderVideoDuration: any = parseFloat(output).toFixed(1);
    // Successfully retrieved video duration (in seconds)
    console.log('Video duration in seconds: ', recorderVideoDuration);
    return recorderVideoDuration;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export const extractSegmentFramesForPHash = async (path: any) => {
  try {
    // path = '/storage/emulated/0/Pictures/video_1729373878136.mov';
    let files = await RNFS.readDir(RNFS.PicturesDirectoryPath); // Read the directory
    let frameFiles = files.filter(file => {
      return file.name.includes('frames') && file.isFile();
    });

    // Delete each file that starts with "frames"
    for (const file of frameFiles) {
      await RNFS.unlink(file.path);
    }

    const command = `-y -i ${path} -vf "select='not(mod(n\, 150))'" -vsync vfr ${
      RNFS.PicturesDirectoryPath
    }/${Date.now()}finalframes%d.png`;

    const session = await FFmpegKit.execute(command);
    console.log('session' + session);
    files = await RNFS.readDir(RNFS.PicturesDirectoryPath); // Read the directory
    frameFiles = files.filter(file => {
      return file.name.includes('finalframes') && file.isFile();
    });
    const unsorted = frameFiles.map(eachFile => eachFile.path);
    // Sort the file paths based on the numeric suffix before .jpg
    const sortedFilePaths = unsorted.sort((a: any, b: any) => {
      const numA = parseInt(a.match(/finalframes(\d+)\.png/)[1], 10);
      const numB = parseInt(b.match(/finalframes(\d+)\.png/)[1], 10);
      return numA - numB;
    });
    return sortedFilePaths;
  } catch (e: any) {
    console.log(e.message);
  }
};

export const extractSegmentFramesForQrcode = async (path: any) => {
  try {
    let files = await RNFS.readDir(RNFS.CachesDirectoryPath); // Read the directory
    let frameFiles = files.filter(file => {
      return file.name.includes('frames') && file.isFile();
    });

    // Delete each file that starts with "frames"
    for (const file of frameFiles) {
      await RNFS.unlink(file.path);
    }

    // const command = `-y -i ${path} -vf "fps=1/5, crop=iw/2:ih/2:iw/2:0" -vsync 0 ${
    //   RNFS.CachesDirectoryPath
    // }/${Date.now()}verifycroppedframes%d.png`;

    const command = `-y -i ${path} -vf "select='not(mod(n\, 150))'" -vsync vfr ${
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
    const sortedFilePaths = unsorted.sort((a: any, b: any) => {
      const numA = parseInt(a.match(/verifycroppedframes(\d+)\.png/)[1], 10);
      const numB = parseInt(b.match(/verifycroppedframes(\d+)\.png/)[1], 10);
      return numA - numB;
    });

    return sortedFilePaths;
  } catch (e: any) {
    console.log(e.message);
  }
};

export async function extractFirstFrameAndGetVideoInfoFromDB(uri: string) {
  const firstFramePath = `${RNFS.PicturesDirectoryPath}/first_frame.png`;
  const command = `-y -i ${uri} -vf "select=eq(n\\,0)" -q:v 2 -frames:v 1 ${firstFramePath}`;
  await FFmpegKit.execute(command);
  const response = await RNQRGenerator.detect({
    uri: firstFramePath,
  });
  let {values}: any = response;
  console.log('values ' + values);
  if (values) {
    values = JSON.parse(values);
    console.log('videoId ' + values.videoId);
    return await findVideoHash(values?.videoId);
  } else {
    return null;
  }
}

export async function extractEveryFrameWithTimestamp(uri: string) {
  let files = await RNFS.readDir(RNFS.PicturesDirectoryPath); // Read the directory
  let frameFiles = files.filter(file => {
    return file.name.includes('everyframe') && file.isFile();
  });

  // Delete each file that starts with "frames"
  for (const file of frameFiles) {
    await RNFS.unlink(file.path);
  }
  const output = `${RNFS.PicturesDirectoryPath}/everyframe_%0d.png`;
  // const metadataFilePath = `${RNFS.PicturesDirectoryPath}/frames_info.txt`;
  const command = `-y -i ${uri} -vsync 0 -frame_pts true ${output}`;
  await FFmpegKit.execute(command);
  // -skip_frame nokey

  files = await RNFS.readDir(RNFS.PicturesDirectoryPath); // Read the directory
  frameFiles = files.filter(file => {
    return file.name.includes('everyframe') && file.isFile();
  });

  const unsorted = frameFiles.map(eachFile => eachFile.path);
  // Sort the file paths based on the numeric suffix before .jpg
  const sortedFilePaths = unsorted.sort((a: any, b: any) => {
    const numA = parseInt(a.match(/everyframe_(\d+)\.png/)[1], 10);
    const numB = parseInt(b.match(/everyframe_(\d+)\.png/)[1], 10);
    return numA - numB;
  });

  return sortedFilePaths;
}
