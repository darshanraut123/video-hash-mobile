import {NativeModules} from 'react-native';
import varint from 'varint';

import {DecodeLSB, EncodeLSB} from './LSB';

type AlgorithmNames = 'LSBv1';

export type Actions =
  | 'starting'
  | 'getting_message_length'
  | 'getting_image_data'
  | 'encoding'
  | 'decoding'
  | 'setting_image_data'
  | 'done';

interface MetaData {
  algorithm: AlgorithmNames;
}

export default class Steganography {
  private readonly imageURI: string;

  private readonly algorithmNames = {
    LSBv1: 0,
  };

  private readonly algorithmNums: {[name: number]: AlgorithmNames} = {
    0: 'LSBv1',
  };

  private progress: {
    increment: number;
    value: number;
  };

  private currentAction: Actions;

  constructor(imageURI: string) {
    this.imageURI = imageURI;
    this.progress = {
      increment: 0,
      value: 0,
    };
    this.currentAction = 'starting';
  }

  public async encode(message: string, metadata: MetaData) {
    const compressedMessage = this.stringToUint8ArrayManual(message);
    console.log('Uint8 compressed==> ' + compressedMessage);
    const compressedBinaryMessage =
      this.convertMessageToBits(compressedMessage);
    console.log('compressedBinaryMessage==> ' + compressedBinaryMessage);
    const binaryMetadata = this.convertMetadataToBits(metadata);
    console.log('binaryMetadata==> ' + binaryMetadata);
    const binaryMessage = binaryMetadata + compressedBinaryMessage;
    console.log('binaryMessage==> ' + binaryMessage);

    const end = Math.ceil(binaryMessage.length / 3);
    console.log('end===> ' + end);
    this.currentAction = 'getting_image_data';
    const imageData = await this.getImageData(this.imageURI, 0, end);
    this.currentAction = 'encoding';
    const newImageData = this.encodeData(
      imageData,
      binaryMessage,
      metadata.algorithm,
    );
    this.currentAction = 'setting_image_data';
    console.log('before getEncodedImageURI');
    const uri = await this.getEncodedImageURI(newImageData);
    this.currentAction = 'done';
    return uri;
  }

  public async decode() {
    const decodeLSB = new DecodeLSB();
    const metadata = await this.decodeMetadata(decodeLSB);
    this.currentAction = 'getting_image_data';
    const messageLength = await this.decodeMessageLength(decodeLSB);
    this.currentAction = 'decoding';
    const decodedDecimalData = await this.decodeData(
      decodeLSB,
      messageLength,
      metadata,
    );
    console.log('Uint8 decoded==> ' + decodedDecimalData);

    const message = this.uint8ArrayToStringManual(decodedDecimalData);
    this.currentAction = 'done';
    return message;
  }

  public updateProgress() {
    if (this.progress.value >= 100) {
      this.progress.value = 100;
    } else {
      this.progress.value += this.progress.increment;
    }
  }

  public getProgress() {
    return this.progress.value;
  }

  public updateProgressTo(increment: number) {
    if (this.progress.value + increment >= 100) {
      this.progress.value = 100;
    } else {
      this.progress.value += increment;
    }
  }

  public getCurrentAction() {
    return this.currentAction;
  }

  private convertMetadataToBits(metadata: MetaData) {
    const dataToEncode: number[] = [];

    for (const key in metadata) {
      if (key === 'algorithm') {
        const algorithm = metadata.algorithm;
        dataToEncode.push(this.algorithmNames[algorithm]);
      }
    }

    let binaryMessage = '';
    for (const element of dataToEncode) {
      binaryMessage += this.convertDecimalToBytes(element);
    }

    return binaryMessage;
  }

  private stringToUint8ArrayManual(str: string): Uint8Array {
    const array = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      array[i] = str.charCodeAt(i);
    }
    return array;
  }

  private uint8ArrayToStringManual(uint8Array: Uint8Array): string {
    let decodedString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      decodedString += String.fromCharCode(uint8Array[i]);
    }
    return decodedString;
  }

  private convertMessageToBits(message: Uint8Array) {
    const messageLength = varint.encode(message.length);
    const arrayToEncode = [...messageLength, ...message];

    let bitsToEncode = '';
    for (const element of arrayToEncode) {
      bitsToEncode += this.convertDecimalToBytes(element);
    }

    return bitsToEncode;
  }

  private async getImageData(imageURI: string, start: number, end: number) {
    console.log('imageURI start end==> ' + imageURI, start, end);

    const pixels = await NativeModules.Bitmap.getPixels(imageURI, start, end);
    console.log('pixels==> ' + pixels);

    return pixels;
  }

  private encodeData(
    imageData: number[],
    data: string,
    algorithm: AlgorithmNames,
  ) {
    console.log('in encodeData');
    this.progress.increment = Math.ceil(100 / data.length);
    let encodedData;
    switch (algorithm) {
      default: {
        encodedData = new EncodeLSB(this.updateProgress.bind(this)).encode(
          imageData,
          data,
        );
      }
    }
    console.log('Encoded data==> ' + encodedData);
    return encodedData;
  }

  private async getEncodedImageURI(data: number[]) {
    const uri = await NativeModules.Bitmap.setPixels(this.imageURI, data);
    return uri;
  }

  private async decodeMetadata(decodeLSB: DecodeLSB) {
    const imageData = await this.getImageData(this.imageURI, 0, 3);
    const algorithmBinary = decodeLSB.decodeNextByte(imageData);
    const algorithmDecimal = this.convertBytesToDecimal(algorithmBinary);
    const algorithm = this.algorithmNums[algorithmDecimal];

    const metadata: MetaData = {algorithm};
    return metadata;
  }

  private async decodeMessageLength(decodeLSB: DecodeLSB) {
    let end = 8;
    let imageData = await this.getImageData(this.imageURI, 0, end);
    let messageLength = 0;

    while (messageLength === 0) {
      try {
        messageLength = this.decodeVarint(imageData, decodeLSB);
      } catch (error) {
        if (error instanceof RangeError) {
          end += 8;
          imageData = await this.getImageData(this.imageURI, 0, end);
        } else {
          throw error;
        }
      }
    }
    return messageLength;
  }

  private decodeVarint(imageData: number[], decodeLSB: DecodeLSB) {
    let completed = false;
    const messageVarint: number[] = [];

    while (!completed) {
      const byte = decodeLSB.decodeNextByte(imageData);
      const num = parseInt(byte, 2);

      messageVarint.push(num);
      if (messageVarint.slice(-1)[0] < 128) {
        completed = true;
      }
    }
    return varint.decode(messageVarint);
  }

  private async decodeData(
    decodeLSB: DecodeLSB,
    messageLength: number,
    metadata: MetaData,
  ) {
    const start = Math.floor(decodeLSB.getCurrentIndex() / 3);
    const startDecodingAt = decodeLSB.getCurrentIndex() % 3;
    const end = start + Math.ceil((messageLength * 8) / 3) + 1;
    const imageData = await this.getImageData(this.imageURI, start, end);
    this.progress.increment = Math.ceil(100 / messageLength);

    let decodedMessage;
    switch (metadata.algorithm) {
      default: {
        decodedMessage = new DecodeLSB(this.updateProgress.bind(this)).decode(
          imageData,
          startDecodingAt,
          messageLength,
        );
      }
    }

    const decodedDecimal: number[] = [];
    for (const byte of decodedMessage) {
      const decimal = this.convertBytesToDecimal(byte);
      decodedDecimal.push(decimal);
    }

    return new Uint8Array(decodedDecimal);
  }

  private convertDecimalToBytes(data: number) {
    const binaryString = data.toString(2);
    const nearestByte = Math.ceil(binaryString.length / 8) * 8;
    const byte = binaryString.padStart(nearestByte, '0');
    return byte;
  }

  private convertBytesToDecimal(bytes: string) {
    const decimal = parseInt(bytes, 2);
    return decimal;
  }
}
