export function hammingDistance(str1: string, str2: string) {
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
    totalDistance += hammingDistance(arr1[i], arr2[i]);
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
      (seg: any) => seg.segmentId === trimmedSegment.segmentId,
    );

    if (!originalSegment) {
      return {...trimmedSegment, presentSeconds: 0};
    }

    const segmentStart = (trimmedSegment.segmentNo - 1) * segmentDuration;
    const trimmedStart = trimmedSegment.timeStampseconds || segmentStart;
    const overlapStart = Math.max(segmentStart, trimmedStart);
    const overlapEnd = Math.min(
      segmentStart + segmentDuration,
      trimmedStart + segmentDuration,
    );

    const presentSeconds = Math.max(0, overlapEnd - overlapStart);
    console.log(
      `Segment ID: ${trimmedSegment.segmentId}, Present Seconds: ${presentSeconds}`,
    );

    return {
      ...trimmedSegment,
      presentSeconds,
    };
  });
}
