import React from 'react';
import {FlatList, Dimensions} from 'react-native';
import MediaItem from './media-item';

const {width} = Dimensions.get('window');
const numColumns = 3;
const itemPadding = 10;
const extraRightMargin = 0;
const itemWidth =
  (width - itemPadding * (numColumns + 1) - extraRightMargin) / numColumns;

const MediaList: React.FC<any> = ({medias, onSelect, showVideoInfo}) => {
  const renderMediaItem = ({item, index}: {item: any; index: number}) => (
    <MediaItem
      uri={item.path}
      videoInfo={item}
      width={itemWidth}
      marginRight={(index + 1) % numColumns === 0 ? 0 : itemPadding}
      marginBottom={itemPadding}
      onSelect={onSelect}
      showVideoInfo={showVideoInfo}
      status={item.status}
    />
  );

  return (
    <FlatList
      data={medias}
      renderItem={renderMediaItem}
      keyExtractor={(_, index) => index.toString()}
      numColumns={numColumns}
    />
  );
};

export default MediaList;
