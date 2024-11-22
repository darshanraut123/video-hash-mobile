import React from 'react';
import {FlatList, StyleSheet, Dimensions} from 'react-native';
import PhotoItem from './photo-item';

const {width} = Dimensions.get('window');
const numColumns = 3;
const itemPadding = 10;
const extraRightMargin = 30;
const itemWidth =
  (width - itemPadding * (numColumns + 1) - extraRightMargin) / numColumns;

const PhotoList: React.FC<any> = ({photos, onSelectPhoto, showPhotoInfo}) => {
  const renderPhotoItem = ({item, index}: {item: any; index: number}) => (
    <PhotoItem
      uri={item.path}
      photoInfo={item}
      width={itemWidth}
      marginRight={(index + 1) % numColumns === 0 ? 0 : itemPadding}
      marginBottom={itemPadding}
      onSelect={onSelectPhoto}
      showPhotoInfo={showPhotoInfo}
    />
  );

  return (
    <FlatList
      data={photos}
      renderItem={renderPhotoItem}
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

export default PhotoList;
