import React, {useRef} from 'react';
import {View, Button, Text} from 'react-native';
import Canvas, {Image as CanvasImage, ImageData} from 'react-native-canvas';
import RNFS from 'react-native-fs';

const base64Image: string =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlgAAAMgCAIAAABwAouTAAAAAXNSR0IArs4c6QAAAANzQklUCAgI2+FP4AAAIABJREFUeJzt3c+PXOt54PfneauavLKvJc1YntjxSLbHM8BgEiDwKvAi6+yyGCBI/qfM/5HAQQAvsshqICAYJAiyCJIYBoxY0tiSfe1rWxr5hy7JPu+TxalqVpNsiuwudlX18/lYbtbTbFYfFqvqW+c9p/rmD7787wMAuhqn3gAAOCUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEEoDUhBKA1IQSgNSEE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';

const message = 'darshan';
// '{"beaconVersion": "Version 2.0", "hash": "1001101111011011111001000000010010000000011110011000011010100100", "id": 3, "localBeaconTimestamp": 1727102814, "localBeaconUniqueId": "79ebb076-f8b3-4141-a61e-df9e2f1fc3c6", "nistBeaconTimeStamp": "2018-07-23T19:26:00.000Z", "nistBeaconUniqueId": "7665F054F21B50DF62CD3E50AF8EB783E30D271B091DE051212D301E0E3D17FFCF0367DB41CFFD3C51E88BDE0B0621F49EB03435BC373D5D49480941A8B3547E", "timeStamp": 2024-09-23T14:46:57.245Z, "uniqueSegmentId": "ee170393-8827-4b78-907f-5c996344352e", "unixTimestamp": 1727102817}';
const App = () => {
  const canvasRef = useRef<any>(null);
  const [obj, setObj] = React.useState({
    encodedText: 'NA',
    decodedText: 'NA',
    encodedBinary: 'NA',
  });

  const encodeMessageInImage = async () => {
    const canvas: any = canvasRef.current;
    const ctx = await canvas.getContext('2d');
    const img = new CanvasImage(canvas);
    canvas.width = 100;
    canvas.height = 100;
    const base64complete: string = base64Image;
    img.src = base64complete;
    img.addEventListener('load', onLoadImage);
    async function onLoadImage() {
      try {
        ctx.drawImage(img, 0, 0, 100, 100);

        ctx.getImageData(0, 0, 100, 100).then((imageData: any) => {
          const binaryData =
            '01100100011000010111001001110011011010000110000101101110';
          //textToBinary(message);
          setObj(prev => {
            return {...prev, encodedText: 'darshan', encodedBinary: binaryData};
          });
          // Encode the binary text into the image
          const flatImageData = encodeMessageInImage2(
            imageData.data,
            binaryData,
            100,
            100,
          );
          const newImgData = convertFlatArrayToObjectFormat(flatImageData);
          console.log('newImgData==> ' + JSON.stringify(newImgData));
          console.log('After newImgData');
          const newData: any = Object.values(newImgData);
          const length = Object.keys(newImgData).length;
          for (let i = 0; i < length; i += 4) {
            newData[i] = 0;
            newData[i + 1] = 0;
            newData[i + 2] = 0;
            newData[i + 1] =
              newData[i + 2] =
              newData[i + 3] =
                imageData.data[i / 4];
          }
          console.log('After for');

          const imgData = new ImageData(canvas, newData, 100, 100);
          console.log('After new ImageData');

          ctx.putImageData(imgData, 0, 0);

          const txt = decodeMessageFromImage3(flatImageData);
          // const txt = decodeMessageFromImage2(flatImageData);
          console.log('bin==> ' + txt);

          const text = binaryToText(txt);
          setObj(prev => {
            return {...prev, decodedText: text};
          });

          // canvas.toDataURL().then((newBase64Image: any) => {
          //   const filePath = `${RNFS.PicturesDirectoryPath}/encoded_image2.png`;
          //   RNFS.exists(filePath).then(ifTrue => {
          //     ifTrue && RNFS.unlink(filePath);
          //   });
          //   RNFS.writeFile(filePath, newBase64Image.split(',')[1], 'base64');
          //   console.log(`Image saved with hidden message at: ${filePath}`);
          // }); // Encoded image in base64
        });
      } catch (e: any) {
        console.error('Error with fetching image data:', e);
      }
    }
  };

  function encodeMessageInImage2(
    imageData: any,
    binaryMessage: string,
    width: number,
    height: number,
  ): Uint8ClampedArray {
    let messageIndex = 0;

    // Convert the object-like imageData into a flat Uint8ClampedArray
    const flatImageData = new Uint8ClampedArray(width * height * 4);

    // Fill the flat array with the original image data values
    for (let i = 0; i < flatImageData.length; i++) {
      flatImageData[i] = imageData[i] || 0; // Ensure it's clamped between 0 and 255
    }

    // Embed the binary message into the image's pixel data
    for (
      let i = 0;
      i < flatImageData.length && messageIndex < binaryMessage.length;
      i += 4
    ) {
      const blueValue = flatImageData[i + 2]; // Blue channel
      const newBlueValue =
        (blueValue & ~1) | parseInt(binaryMessage[messageIndex], 2); // Modify LSB
      flatImageData[i + 2] = newBlueValue; // Set new blue channel value
      messageIndex++;
    }

    return flatImageData;
  }

  function decodeMessageFromImage(imageData: any): string {
    let binaryMessage = '';

    // Iterate over the pixel data and extract the LSB of the blue channel
    for (let i = 0; i < Object.keys(imageData).length; i += 4) {
      const blueValue = imageData[i + 2]; // Get the blue channel value
      binaryMessage += (blueValue & 1).toString(); // Get the LSB of the blue channel
    }

    return binaryMessage; // Convert the binary string to text
  }

  function decodeMessageFromImage2(imageData: any[]): string {
    let binaryMessage = '';

    // Iterate over the pixel data and extract the LSB of the blue channel
    for (let i = 0; i < imageData.length; i += 4) {
      const blueValue = imageData[i + 2]; // Get the blue channel value
      binaryMessage += (blueValue & 1).toString(); // Get the LSB of the blue channel
    }

    // Convert binary string to text if needed
    return binaryMessage; // Return the binary string
  }

  function decodeMessageFromImage3(imageData: any): string {
    let binaryMessage = '';

    // Iterate over the pixel data and extract the LSB of the blue channel
    for (let i = 0; i < imageData.length; i += 4) {
      if (i + 2 < imageData.length) {
        // Check to ensure we have a valid blue channel
        const blueValue = imageData[i + 2]; // Get the blue channel value
        binaryMessage += (blueValue & 1).toString(); // Get the LSB of the blue channel
      }
    }

    // Convert binary string to characters
    // let message = '';
    // for (let i = 0; i < binaryMessage.length; i += 8) {
    //   const byte = binaryMessage.slice(i, i + 8); // Take 8 bits (1 byte)
    //   if (byte.length < 8) break; // If it's less than 8 bits, break out of the loop
    //   const charCode = parseInt(byte, 2); // Convert binary string to integer
    //   message += String.fromCharCode(charCode); // Convert integer to character
    // }

    return binaryMessage; // Return the decoded message
  }

  function convertFlatArrayToObjectFormat(arr: any): any {
    const obj: any = {};
    arr.forEach((a: any, i: number) => {
      obj[i] = a; // Assign array values to object with index as key
    });
    return obj;
  }

  const textToBinary: any = (text: string) => {
    const binaryData = text
      .split('')
      .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join('');
    console.log(binaryData, typeof binaryData);
    setObj(prev => {
      return {...prev, encodedBinary: binaryData};
    });
    return binaryData;
  };

  const binaryToText: any = (binary: string) => {
    let text: any = binary.match(/.{8}/g);
    text = text
      .map((byte: any) => String.fromCharCode(parseInt(byte, 2)))
      .join('');
    console.log(text, typeof text);
    return text;
  };

  const decodeText = () => {
    const text = '';
    setObj(prev => {
      return {...prev, decodedText: text};
    });
  };

  return (
    <View>
      <Button
        title="Convert to Binary"
        onPress={() => textToBinary('darshan')}
      />
      <Button
        title="Convert to Text"
        onPress={() =>
          binaryToText(
            '01100100011000010111001001110011011010000110000101101110',
          )
        }
      />
      <Button title="Encode invisible text" onPress={encodeMessageInImage} />
      <Button title="Extract invisible text" onPress={decodeText} />

      <Canvas style={{backgroundColor: 'white'}} ref={canvasRef} />

      <Text>Encoded Text : {obj.encodedText}</Text>
      <Text>Encoded Binary : {obj.encodedBinary}</Text>
      <Text>Decocded Text : {obj.decodedText}</Text>
    </View>
  );
};

export default App;
