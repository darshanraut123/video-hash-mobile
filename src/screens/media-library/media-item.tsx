import React from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import Video from 'react-native-video';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Alert} from 'react-native';

import styles from './media-styles';

interface VideoItemProps {
  uri: string;
  videoInfo: any;
  width: number;
  marginRight: number;
  marginBottom: number;
  onSelect: (uri: string, mediaType: string) => void;
  status: string;
  showVideoInfo: (videoInfo: any) => {};
}

const MediaItem: React.FC<VideoItemProps> = ({
  uri,
  width,
  marginRight,
  marginBottom,
  onSelect,
  status,
  showVideoInfo,
  videoInfo,
}) => {
  const statusIcon =
    status === 'completed'
      ? 'check-circle'
      : status === 'pending'
      ? 'hourglass-empty'
      : 'hourglass-bottom';
  const iconColor =
    status === 'completed'
      ? '#4CAF50'
      : status === 'pending'
      ? '#880808'
      : '#FFA500';

  function handleShowVideoInfo() {
    videoInfo.payload
      ? Alert.alert('Please wait for processing to complete...')
      : showVideoInfo(videoInfo);
  }

  const formatDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(
      2,
      '0',
    )}`;
  };

  const duration = formatDuration(videoInfo?.duration);

  return (
    <TouchableOpacity
      style={[
        styles.videoContainer,
        {
          width,
          height: width,
          marginRight,
          marginBottom,
        },
      ]}
      onPress={() => onSelect(uri, videoInfo?.duration ? "video" : "image")}>
      <View style={styles.thumbnailContainer}>
        {videoInfo?.duration ? (
          <Video
            source={{
              uri,
              type: 'video/*',
            }}
            style={styles.thumbnail}
            resizeMode="cover"
            paused={true}
          />
        ) : (
          <Image
            source={{uri: 'file://' + uri}}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        )}
      </View>
      {videoInfo?.duration && (
        <View style={styles.videoOverlay}>
          <View style={styles.playBtnWrapper}>
            <MaterialIcons name="play-arrow" size={24} color="black" />
          </View>
        </View>
      )}
      {videoInfo?.duration && <Text style={styles.duration}>{duration}</Text>}
      {/* <TouchableOpacity onPress={handleShowVideoInfo} style={styles.infoIcon}>
        <MaterialIcons name={'info-outline'} size={20} color={'#FFFA'} />
      </TouchableOpacity> */}
      <View style={styles.statusIcon}>
        <MaterialIcons name={statusIcon} size={24} color={iconColor} />
      </View>
    </TouchableOpacity>
  );
};

export default MediaItem;
