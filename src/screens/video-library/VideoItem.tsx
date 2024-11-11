import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Video from 'react-native-video';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface VideoItemProps {
  uri: string;
  width: number;
  marginRight: number;
  marginBottom: number;
  onSelect: (uri: string) => void;
  status: string;
}

const VideoItem: React.FC<VideoItemProps> = ({ uri, width, marginRight, marginBottom, onSelect, status }) =>{

     const statusIcon = status === 'inProcess' ? 'hourglass-empty' : 'check-circle';
     const iconColor = status === 'inProcess' ? '#FFA500' : '#4CAF50';

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
    onPress={() => onSelect(uri)}
  >
    <View style={styles.thumbnailContainer}>
      <Video
        source={{ uri }}
        style={styles.thumbnail}
        resizeMode="cover"
        paused={true} // Pause for thumbnail display only
      />
    </View>
    <View style={styles.videoOverlay}>
      <Text style={styles.videoPlayText}>▶️</Text>
    </View>
      <View style={[styles.statusIcon, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]}>
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
    right: 5,
    borderRadius: 12, // Circular background for the icon
    padding: 4, // Padding for a larger clickable area and better visibility
  },
});

export default VideoItem;
