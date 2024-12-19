import React from 'react';
import {saveVideoHash} from './src/service/hash-requests';
import {fetchDeviceInfo} from './src/util/device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import eventEmitter from './src/util/event-emitter';
import RNFS from 'react-native-fs';
import Canvas, {Image as CanvasImage} from 'react-native-canvas';
import pHash from './src/util/phash';

import {removeCompletedTask, updateTaskStatus} from './src/util/queue';

export default function TaskRunner() {
  const canvasRef = React.useRef<any>();

  React.useEffect(() => {
    const handleCustomEvent = async ({
      segmentFramePaths,
      payload,
      videoOutputPath,
      latitude,
      longitude,
      altitude,
      nistBeaconUniqueId,
      taskId,
    }: any) => {
      try {
        let user: any = await AsyncStorage.getItem('user');
        console.log(`USER:  ${JSON.stringify(user)}`);
        if (!user) {
          await updateTaskStatus(taskId, 'pending');
          return;
        }
        user = JSON.parse(user);

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
                        const hex = `#${red
                          .toString(16)
                          .padStart(2, '0')}${green
                          .toString(16)
                          .padStart(2, '0')}${blue
                          .toString(16)
                          .padStart(2, '0')}`;
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

        const pHashes: any = await generatePhashFromFrames(segmentFramePaths);
        console.log('Extracted pHashes paths:', JSON.stringify(pHashes));
        const deviceInfo: any = await fetchDeviceInfo();
        const segments = payload.qrCodeData.map(
          (qrCodeDataItem: any, index: number) => {
            return {
              ...qrCodeDataItem,
              videoHash: pHashes[index],
            };
          },
        );
        const apiBody = {
          videoId: payload.videoId,
          fullVideoHash: pHashes.join(''),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          duration: payload.duration,
          user,
          publicData: {
            path: videoOutputPath,
            email: user.email,
            name: user.name,
            duration: payload.duration,
            createdAt: new Date().toISOString(),
          },
          device: deviceInfo,
          gps: {
            latitude: latitude || 0,
            longitude: longitude || 0,
            altitude: altitude || 0,
            timestamp: new Date().toISOString(),
          },
          nistRandom: {
            nistBeaconUniqueId,
          },
          segments,
        };
        console.log(JSON.stringify(apiBody));
        const res = await saveVideoHash(apiBody);
        console.log('API call done' + JSON.stringify(res));
        console.log('pHashes: ' + pHashes);
        console.log('videoOutputPath: ' + videoOutputPath);
        console.log('payload: ' + JSON.stringify(payload));
        await removeCompletedTask(taskId);
        await AsyncStorage.setItem('isProcessing', JSON.stringify(false));
      } catch (error) {
        console.error('Error processing task:', error);
        await updateTaskStatus(taskId, 'pending');
        await AsyncStorage.setItem('isProcessing', JSON.stringify(false));
      }
    };

    eventEmitter.on('extractFeamesAndSaveToAPI', handleCustomEvent);

    // Cleanup listener on unmount
    return () => {
      eventEmitter.off('extractFeamesAndSaveToAPI', handleCustomEvent);
    };
  }, []);

  return (
    <Canvas
      // eslint-disable-next-line react-native/no-inline-styles
      style={{
        backgroundColor: 'white',
        position: 'absolute',
        height: 32,
        width: 32,
      }}
      ref={canvasRef}
    />
  );
}
