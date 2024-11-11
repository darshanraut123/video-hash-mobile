import React from 'react';
import { FlatList, StyleSheet, Dimensions } from 'react-native';
import VideoItem from './VideoItem';
import { VideoInterface } from './VideoLibrary';

const { width } = Dimensions.get('window');
const numColumns = 3;
const itemPadding = 6;
const extraRightMargin = 10;
const itemWidth = (width - itemPadding * (numColumns + 1) - extraRightMargin) / numColumns;

interface VideoListProps {
  videos: VideoInterface[];
  onSelectVideo: (uri: string) => void;
}

const VideoList: React.FC<VideoListProps> = ({ videos, onSelectVideo }) => {
  const renderVideoItem = ({ item, index }: { item: VideoInterface; index: number }) => (
    <VideoItem
      uri={item.path}
      width={itemWidth}
      marginRight={(index + 1) % numColumns === 0 ? 0 : itemPadding}
      marginBottom={itemPadding}
      onSelect={onSelectVideo}
      status={item.status}
    />
  );

  return (
    <FlatList
      data={videos}
      renderItem={renderVideoItem}
      keyExtractor={(item, index) => index.toString()}
      numColumns={numColumns}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: itemPadding,
    paddingRight: extraRightMargin,
  },
});

export default VideoList;
