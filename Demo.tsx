import React, {useRef} from 'react';
import {View, Button} from 'react-native';
import Canvas, {Image as CanvasImage} from 'react-native-canvas';
import ImageCropPicker from 'react-native-image-crop-picker';
import pHash from './src/util/phash';

const App = () => {
  const canvasRef = useRef(null);

  const pickImage = async () => {
    try {
      const image = await ImageCropPicker.openPicker({
        width: 32, // Desired width
        height: 32, // Desired height
        cropping: true, // Enable cropping
        compressImageMaxWidth: 32, // Maximum width for compression
        compressImageMaxHeight: 32, // Maximum height for compression
        compressImageQuality: 0.8, // Quality of the compressed image
        includeBase64: true,
      });
      console.log(image);
      return image;
    } catch (error) {
      console.error('Error picking image: ', error);
    }
  };

  const drawImageOnCanvas = async () => {
    let image: any = await pickImage();
    // const imagePath = image.assets[0].uri.replace('file://', '');
    // const base64 = image.assets[0].base64;

    const imagePath = image.path.replace('file://', '');
    const base64 = image.data;

    if (!canvasRef.current || !imagePath) {
      console.log('In if condition');
      return;
    }

    const canvas: any = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 32;
    canvas.height = 32;
    const img = new CanvasImage(canvas, 32, 32);
    img.src = 'data:image/png;base64,' + base64;

    img.addEventListener('load', async () => {
      console.log('AddEventListener Load triggered');

      console.log(canvas.height);
      console.log(canvas.width);
      ctx.drawImage(img, 0, 0, img.width, img.height);
      try {
        const imageData = await ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        );
        console.log('Imagedata extracted');
        const pixels = imageData.data;
        const width = imageData.width; // Assuming you have width and height of the canvas
        const height = imageData.height;
        console.log(height, width);
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
            const colorName = getColorNameFromRGB(red, green, blue); // Optional: You can skip this if not needed

            // Append formatted pixel data to the string
            formattedData += `${x},${y}: (${red},${green},${blue})  ${hex}  ${colorName}\n`;
          }
        }

        console.log('formattedData===> ' + formattedData);
        // Convert the string to a Buffer
        // const encoder = new TextEncoder(); // Using polyfill for React Native
        // const buffer = encoder.encode(formattedData);
        // console.log('buffer===> ' + buffer);
        pHash.hash(formattedData);
      } catch (e: any) {
        console.error('Error with fetching image data:', e);
      }
    });
  };

  const getColorNameFromRGB = (r: any, g: any, b: any) => {
    if (r === 0 && g === 0 && b === 0) return 'black';
    if (r === 255 && g === 255 && b === 255) return 'white';
    if (r === 255 && g === 0 && b === 0) return 'red';
    if (r === 0 && g === 255 && b === 0) return 'lime';
    if (r === 0 && g === 0 && b === 255) return 'blue';
    if (r === 255 && g === 255 && b === 0) return 'yellow';
    if (r === 0 && g === 255 && b === 255) return 'cyan';
    if (r === 255 && g === 0 && b === 255) return 'magenta';
    if (r === 128 && g === 128 && b === 128) return 'grey';
    if (r === 128 && g === 0 && b === 0) return 'maroon';
    if (r === 128 && g === 128 && b === 0) return 'olive';
    if (r === 0 && g === 128 && b === 0) return 'green';
    if (r === 128 && g === 0 && b === 128) return 'purple';
    if (r === 0 && g === 128 && b === 128) return 'teal';
    if (r === 0 && g === 0 && b === 128) return 'navy';

    // For colors not in this list, return the RGB triplet as a fallback
    return `rgb(${r},${g},${b})`;
  };

  return (
    <View>
      <Button title="Pick Image and Draw" onPress={drawImageOnCanvas} />
      <Canvas ref={canvasRef} />
    </View>
  );
};

export default App;
