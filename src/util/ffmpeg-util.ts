import {FFmpegKit, FFprobeKit} from 'ffmpeg-kit-react-native';
import RNFS from 'react-native-fs';
// import RNQRGenerator from 'rn-qr-generator';
import {findPhotoInfo, findVideoInfo} from '../service/hash-requests';

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
    let files = await RNFS.readDir(RNFS.CachesDirectoryPath); // Read the directory
    let frameFiles = files.filter(file => {
      return file.name.includes('frames') && file.isFile();
    });

    // Delete each file that starts with "frames"
    for (const file of frameFiles) {
      await RNFS.unlink(file.path);
    }

    const command = `-y -i ${path} -vf "select='not(mod(n\, 150))'" -vsync vfr ${
      RNFS.CachesDirectoryPath
    }/${Date.now()}finalframes%d.png`;

    const session = await FFmpegKit.execute(command);
    console.log('session' + session);
    files = await RNFS.readDir(RNFS.CachesDirectoryPath); // Read the directory
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

export async function getPhotoInfoFromDb(uri: string) {
  const response = {values: ''};

  // await RNQRGenerator.detect({
  //   uri,
  // });
  let {values}: any = response;
  if (values.length) {
    values = JSON.parse(values);
    console.log('data ' + JSON.stringify(values));
    const photoInfo = await findPhotoInfo(values?.photoId);
    console.log('Returning info ' + photoInfo);
    return photoInfo;
  } else {
    console.log('Returning null');
    return null;
  }
}

export async function extractFirstFrameAndGetVideoInfoFromDB(uri: string) {
  const firstFramePath = `${RNFS.CachesDirectoryPath}/first_frame.png`;
  const command = `-y -i ${uri} -vf "select=eq(n\\,0)" -q:v 2 -frames:v 1 ${firstFramePath}`;
  await FFmpegKit.execute(command);
  const response = {values: ''};

  // const response = await RNQRGenerator.detect({
  //   uri: firstFramePath,
  // });
  let {values}: any = response;
  console.log('values ' + values);
  if (values.length) {
    values = JSON.parse(values);
    console.log('videoId ' + values.videoId);
    const videoInfo = await findVideoInfo(values?.videoId);
    console.log('Returning info ' + videoInfo);
    return videoInfo;
  } else {
    console.log('Returning null');
    return null;
  }
}

export async function extractEveryFrameWithTimestamp(uri: string) {
  let files = await RNFS.readDir(RNFS.CachesDirectoryPath); // Read the directory
  let frameFiles = files.filter(file => {
    return file.name.includes('everyframe') && file.isFile();
  });

  // Delete each file that starts with "frames"
  for (const file of frameFiles) {
    await RNFS.unlink(file.path);
  }
  const output = `${RNFS.CachesDirectoryPath}/everyframe_%0d.png`;
  // const metadataFilePath = `${RNFS.CachesDirectoryPath}/frames_info.txt`;
  const command = `-y -i ${uri} -vsync 0 -frame_pts true ${output}`;
  await FFmpegKit.execute(command);
  // -skip_frame nokey

  files = await RNFS.readDir(RNFS.CachesDirectoryPath); // Read the directory
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

export const embedQrCodesInVideo = async (
  inputPath: string,
  watermarkPaths: string[],
) => {
  try {
    const fileName: any = inputPath.split('/').pop();
    const outputPath = `${RNFS.CachesDirectoryPath}/$${
      fileName.split('.')[0]
    }_temp.mov`;

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
    // Delete the original file
    await RNFS.unlink(inputPath);
    // Rename the temporary file to replace the original file
    await RNFS.moveFile(outputPath, inputPath);
    console.log('File replaced successfully');
    return inputPath;
  } catch (error) {
    console.error('FFmpeg command failed', error);
  }
};

export const embedQrCodeInPhoto = async (
  photoPath: string,
  qrCodePath: string,
) => {
  const outputPath = `${RNFS.PicturesDirectoryPath}/photo_${Date.now()}.png`;
  const command = `-y -i ${photoPath} -i ${qrCodePath} -filter_complex "overlay=W-w-10:10" ${outputPath}`;
  const session = await FFmpegKit.execute(command);
  const sessionId = session.getSessionId();
  console.log(`sessionId===> ${sessionId}`);
  return outputPath;
};
