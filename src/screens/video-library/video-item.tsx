import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Video from 'react-native-video';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Alert} from 'react-native';

interface VideoItemProps {
  uri: string;
  videoInfo: any;
  width: number;
  marginRight: number;
  marginBottom: number;
  onSelect: (uri: string) => void;
  status: string;
  showVideoInfo: (videoInfo: any) => {};
}

const VideoItem: React.FC<VideoItemProps> = ({
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
      onPress={() => onSelect(uri)}>
      <View style={styles.thumbnailContainer}>
        <Video
          source={{uri}}
          style={styles.thumbnail}
          resizeMode="cover"
          paused={true} // Pause for thumbnail display only
        />
      </View>
      <View style={styles.videoOverlay}>
        <Text style={styles.videoPlayText}>▶️</Text>
      </View>
      <TouchableOpacity onPress={handleShowVideoInfo} style={styles.infoIcon}>
        <MaterialIcons name={'info-outline'} size={20} color={'#FFFA'} />
      </TouchableOpacity>
      <View style={styles.statusIcon}>
        <MaterialIcons name={statusIcon} size={20} color={iconColor} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    backgroundColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    borderRadius: 5,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 5,
  },
  videoPlayText: {
    fontSize: 24,
    color: 'white',
  },
  statusIcon: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    borderRadius: 12, // Circular background for the icon
    padding: 4, // Padding for a larger clickable area and better visibility
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  infoIcon: {
    position: 'absolute',
    height: 30,
    width: 30,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    top: 5,
    right: 5,
    borderRadius: 15, // Circular background for the icon
    padding: 4, // Padding for a larger clickable area and better visibility
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
});

export default VideoItem;
