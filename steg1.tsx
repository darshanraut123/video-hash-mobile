import React, {useRef} from 'react';
import {View, Button, Text} from 'react-native';
import Canvas, {Image as CanvasImage, ImageData} from 'react-native-canvas';
import RNFS from 'react-native-fs';

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
          //   const filePath = `${RNFS.CachesDirectoryPath}/encoded_image2.png`;
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
      {/* <Button
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
      <Button title="Extract invisible text" onPress={decodeText} /> */}

      <Canvas style={{backgroundColor: 'white'}} ref={canvasRef} />

      {/* <Text>Encoded Text : {obj.encodedText}</Text>
      <Text>Encoded Binary : {obj.encodedBinary}</Text>
      <Text>Decocded Text : {obj.decodedText}</Text> */}
    </View>
  );
};

export default App;
