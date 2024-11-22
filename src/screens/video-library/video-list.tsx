import React from 'react';
import {FlatList, StyleSheet, Dimensions} from 'react-native';
import VideoItem from './video-item';

const {width} = Dimensions.get('window');
const numColumns = 3;
const itemPadding = 6;
const extraRightMargin = 10;
const itemWidth =
  (width - itemPadding * (numColumns + 1) - extraRightMargin) / numColumns;

const VideoList: React.FC<any> = ({videos, onSelectVideo, showVideoInfo}) => {
  const renderVideoItem = ({item, index}: {item: any; index: number}) => (
    <VideoItem
      uri={item.path}
      videoInfo={item}
      width={itemWidth}
      marginRight={(index + 1) % numColumns === 0 ? 0 : itemPadding}
      marginBottom={itemPadding}
      onSelect={onSelectVideo}
      showVideoInfo={showVideoInfo}
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
