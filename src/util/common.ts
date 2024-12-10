import {CameraRoll} from '@react-native-camera-roll/camera-roll';

export function calculateHammingDistance(str1: string, str2: string) {
  let distance = 0;

  // Calculate the Hamming distance
  for (let i = 0; i < str1.length; i++) {
    if (str1[i] !== str2[i]) {
      distance++;
    }
  }

  return distance;
}

export function percentageMatch(arr1: any[], arr2: any[]) {
  let totalDistance = 0;
  let totalBits = arr1[0].length; // Assume all hashes have the same length
  // Calculate Hamming distances for each pair
  for (let i = 0; i < arr1.length; i++) {
    totalDistance += calculateHammingDistance(arr1[i], arr2[i]);
  }
  const avgHammingDistance = totalDistance / arr1.length;

  // Calculate and return the average Hamming
  const percentageHammingDistance = (avgHammingDistance / totalBits) * 100;
  return 100 - percentageHammingDistance;
}

export function calculateSegmentOverlap(
  originalSegments: any,
  trimmedSegments: any,
) {
  const segmentDuration = 5;
  return trimmedSegments.map((trimmedSegment: any) => {
    const originalSegment = originalSegments.find(
      (seg: any) => seg.no === trimmedSegment.no,
    );

    if (!originalSegment) {
      return {...trimmedSegment, presentSeconds: 0};
    }

    const segmentStart = (trimmedSegment.no - 1) * segmentDuration;
    const trimmedStart = trimmedSegment.timeStampseconds || segmentStart;
    const overlapStart = Math.max(segmentStart, trimmedStart);
    const overlapEnd = Math.min(
      segmentStart + segmentDuration,
      trimmedStart + segmentDuration,
    );

    const presentSeconds = Math.max(0, overlapEnd - overlapStart);
    console.log(
      `Segment no: ${trimmedSegment.no}, Present Seconds: ${presentSeconds}`,
    );

    return {
      ...trimmedSegment,
      presentSeconds,
    };
  });
}

export function getUniqueId() {
  return Date.now() + Math.random().toFixed(0);
}

export const saveToCameraRoll = async (
  filePath: string,
  mediaType = 'video',
) => {
  try {
    // Save to camera roll
    const savedUri = await CameraRoll.save(filePath, {type: mediaType});
    console.log('Success', `File saved to camera roll at: ${savedUri}`);
    return savedUri;
  } catch (error: any) {
    console.error('Error saving to camera roll:', error.message);
  }
};
