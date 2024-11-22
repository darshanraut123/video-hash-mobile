import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import Video from 'react-native-video';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Alert} from 'react-native';

interface VideoItemProps {
  uri: string;
  photoInfo: any;
  width: number;
  marginRight: number;
  marginBottom: number;
  onSelect: (uri: string) => void;
  showPhotoInfo: (photoInfo: any) => {};
}

const PhotoItem: React.FC<VideoItemProps> = ({
  uri,
  width,
  marginRight,
  marginBottom,
  onSelect,
  showPhotoInfo,
  photoInfo,
}) => {
  function handleShowPhotoInfo() {
    photoInfo.payload
      ? Alert.alert('Please wait for processing to complete...')
      : showPhotoInfo(photoInfo);
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
        <Image
          source={{uri: 'file://' + uri}}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      </View>
      <TouchableOpacity onPress={handleShowPhotoInfo} style={styles.infoIcon}>
        <MaterialIcons name={'info-outline'} size={20} color={'#FFFA'} />
      </TouchableOpacity>
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

export default PhotoItem;
