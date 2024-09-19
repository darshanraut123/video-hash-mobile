const supportedTypes = ['image/jpeg', 'image/png', 'image/tiff', 'image/bmp'];

class Hash {
  constructor(bits) {
    this.value = bits.join('');
  }

  toBinary() {
    return this.value;
  }

  toHex() {
    return this.toInt().toString(16);
  }

  toInt() {
    return parseInt(this.value, 2);
  }
}

const pHash = {
  async hash(input) {
    console.log('Inside hash utility');
    const data = this._convertToObject(input);
    // console.log('_convertToObject==> ' + JSON.stringify(data));
    const hashOp = this._calculateHash(data);
    console.log('Hash obtained inside utility ==> ' + hashOp.toBinary());
    return hashOp.toBinary();
  },

  _readFileAsArrayBuffer(input) {
    if (input.constructor !== File) {
      throw new Error('Input must be type of File');
    }
    if (!supportedTypes.includes(input.type)) {
      throw new Error(
        `Input file must be of one of the supported types: ${supportedTypes.join(
          ', ',
        )}`,
      );
    }

    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result);
        }
      };
      reader.readAsArrayBuffer(input);
    });
  },

  _convertToObject(string) {
    const lines = string.split('\n');

    lines.shift();
    // lines.forEach(element => {
    //   console.log(element);
    // });
    const data = {};
    for (const line of lines) {
      const parts = line.split(' ').filter(v => v);
      if (parts[0] && parts[2]) {
        const key = parts[0].replace(':', '');
        const value = this._convertToRGB(parts[2]);
        data[key] = value;
      }
    }

    return data;
  },

  _generateMagickString({height, width, pixels}) {
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
        return formattedData;
      }
    }
  },

  _getColorNameFromRGB(r, g, b) {
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
  },

  _calculateHash(data) {
    if (typeof data !== 'object') {
      throw new Error('Data must be type of object');
    }

    const matrix = [];
    const row = [];
    const rows = [];
    const col = [];

    const size = 32;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const color = data[`${x},${y}`];
        if (!color) {
          throw new Error(`There is no data for a pixel at [${x}, ${y}]`);
        }

        row[x] = parseInt(
          Math.floor(color.r * 0.299 + color.g * 0.587 + color.b * 0.114),
          10,
        );
      }
      rows[y] = this._calculateDCT(row);
    }

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        col[y] = rows[y][x];
      }
      matrix[x] = this._calculateDCT(col);
    }

    // Extract the top 8x8 pixels.
    const pixels = [];
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        pixels.push(matrix[y][x]);
      }
    }

    // Calculate hash.
    const bits = [];
    const compare = this._average(pixels);
    for (const pixel of pixels) {
      bits.push(pixel > compare ? 1 : 0);
    }

    return new Hash(bits);
  },

  async compare(file1, file2) {
    const hash1 = await this.hash(file1);
    const hash2 = await this.hash(file2);

    return this.distance(hash1, hash2);
  },

  distance(hash1, hash2) {
    let bits1 = hash1.value;
    let bits2 = hash2.value;
    const length = Math.max(bits1.length, bits2.length);

    // Add leading zeros so the bit strings are the same length.
    bits1 = bits1.padStart(length, '0');
    bits2 = bits2.padStart(length, '0');

    return Object.keys(this._arrayDiffAssoc(bits1.split(''), bits2.split('')))
      .length;
  },

  _arrayDiffAssoc(arr1) {
    const retArr = {};
    const argl = arguments.length;
    let k1 = '';
    let i = 1;
    let k = '';
    let arr = {};
    for (k1 in arr1) {
      for (i = 1; i < argl; i++) {
        arr = arguments[i];
        for (k in arr) {
          if (arr[k] === arr1[k1] && k === k1) {
            continue;
          }
        }
        retArr[k1] = arr1[k1];
      }
    }
    return retArr;
  },

  /**
   * Perform a 1 dimension Discrete Cosine Transformation.
   */
  _calculateDCT(matrix) {
    const transformed = [];
    const size = matrix.length;

    for (let i = 0; i < size; i++) {
      let sum = 0;
      for (let j = 0; j < size; j++) {
        sum += matrix[j] * Math.cos((i * Math.PI * (j + 0.5)) / size);
      }
      sum *= Math.sqrt(2 / size);
      if (i === 0) {
        sum *= 1 / Math.sqrt(2);
      }
      transformed[i] = sum;
    }

    return transformed;
  },

  /**
   * Get the average of the pixel values.
   */
  _average(pixels) {
    // Calculate the average value from top 8x8 pixels, except for the first one.
    const n = pixels.length - 1;

    return pixels.slice(1, n).reduce((a, b) => a + b, 0) / n;
  },

  _convertToRGB(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  },
};

export default pHash;
