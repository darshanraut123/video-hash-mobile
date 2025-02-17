import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Modal} from 'react-native';
import {NavigationProp} from '@react-navigation/native';
import MediaList from './media-list';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Share from 'react-native-share';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import {Image} from 'react-native';
import VideoPlayer from 'react-native-video-controls';

import Header from '../../components/Header';
import {getMyPhotos, getMyVideos} from '../../service/hash-requests';
import {Paths} from '../../navigation/path';
import Loader from '../../components/loader';
import CustomModal from '../../components/custom-modal';
import styles from './library-styles';

interface VideoLibraryProps {
  navigation: NavigationProp<any>;
}

export interface VideoInterface {
  path: string;
  status: string;
}

export interface PhotoInterface {
  path: string;
}

export interface modalDataI {
  path: string;
  email: string;
  name: string;
  duration?: number;
  createdAt: string;
}

const VideoLibrary: React.FC<VideoLibraryProps> = ({navigation}) => {
  const [videos, setVideos] = useState<modalDataI[]>([]);
  const [photos, setPhotos] = useState<modalDataI[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [infoModalVisible, setInfoModalVisible] = useState<modalDataI | null>(
    null,
  );
  const [selectedMedia, setSelectedMedia] = useState<{
    type: string;
    uri: string;
  }>({type: '', uri: ''});

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        setIsLoading(true);
        let user: any = await AsyncStorage.getItem('user');
        console.log('User: ' + user);
        if (user) {
          user = JSON.parse(user);
          const responseData = await getMyPhotos(user.email);
          if (!responseData) {
            throw new Error('No data present');
          }
          console.log('responseData: ' + JSON.stringify(responseData));
          const tasks: any = await AsyncStorage.getItem('TASK_QUEUE');
          let parsedAsycStorageTasks: any = tasks ? JSON.parse(tasks) : [];
          console.log(JSON.stringify(parsedAsycStorageTasks));

          // Sorting function with type safety
          parsedAsycStorageTasks = parsedAsycStorageTasks.sort(
            (a: any, b: any): number => {
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            },
          );

          console.log(parsedAsycStorageTasks);

          const photoData: any = responseData.publicDataList.map(
            (item: any) => {
              return {...item, status: 'completed'};
            },
          );
          console.log('photoData: ' + JSON.stringify(photoData));
          setPhotos([...parsedAsycStorageTasks, ...photoData]);
        } else {
          Toast.show({
            type: 'info',
            text1: 'No photos found',
            text2: 'Please click some photos 👋',
            position: 'bottom',
          });
          setPhotos([]);
        }
      } catch (error) {
        console.log('Error loading photos: ', error);
        Toast.show({
          type: 'info',
          text1: 'No photos found',
          text2: 'Please click some photos 👋',
          position: 'bottom',
        });
      } finally {
        setIsLoading(false);
      }
    };

    const loadVideos = async (showLoader = true) => {
      try {
        showLoader && setIsLoading(true);
        let user: any = await AsyncStorage.getItem('user');
        // console.log('User: ' + user);
        if (user) {
          user = JSON.parse(user);
          const responseData = await getMyVideos(user.email);
          // console.log('responseData: ' + JSON.stringify(responseData));
          const tasks: any = await AsyncStorage.getItem('TASK_QUEUE');
          let parsedAsycStorageTasks: any = tasks ? JSON.parse(tasks) : [];
          // console.log(JSON.stringify(parsedAsycStorageTasks));

          // Sorting function with type safety
          parsedAsycStorageTasks = parsedAsycStorageTasks.sort(
            (a: any, b: any): number => {
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            },
          );

          // console.log(parsedAsycStorageTasks);

          const videoData: any = responseData.publicDataList.map(
            (item: any) => {
              return {...item, status: 'completed'};
            },
          );
          // console.log('videoData: ' + JSON.stringify(videoData));
          setVideos([...parsedAsycStorageTasks, ...videoData]);
        } else {
          Toast.show({
            type: 'info',
            text1: 'No videos found',
            text2: 'Please record some videos 👋',
            position: 'bottom',
          });
          setVideos([]);
        }
      } catch (error) {
        console.log('Error loading videos: ', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPhotos();
    loadVideos(true);

    const loadVideosTimer = setInterval(() => {
      loadVideos(false);
    }, 6000);

    return () => clearInterval(loadVideosTimer);
  }, []);

  const showVideoInfo = (ModalInfo: modalDataI) => {
    console.log('showVideoInfo');
    setInfoModalVisible(ModalInfo);
  };

  const shareVideo = async () => {
    try {
      const selectedUri = selectedMedia.uri;
      const content = selectedMedia.type;
      const options = {
        url: `file://${selectedUri}`,
        type: content + '/*',
      };

      await Share.open(options);
    } catch (error) {
      console.error('Error sharing video:', error);
    }
  };

  const mediaSelectHandler = (uri: string, type: string) => {
    setSelectedMedia({
      uri,
      type,
    });
  };

  const medias: modalDataI[] = [...videos, ...photos];

  const sortedMedias = medias.sort((a, b) => {
    const dateA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  console.log("LOG medias ✅", sortedMedias)

  return (
    <>
      <Header
        screenName="Library"
        onBackArrowPress={() => navigation.navigate(Paths.VideoCamera)}
      />
      <View style={styles.container}>
        <Toast />
        <CustomModal
          setInfoModalVisible={setInfoModalVisible}
          infoModalVisible={infoModalVisible}>
          <>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Path:</Text>
              <Text style={styles.tableValue}>{infoModalVisible?.path}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Author:</Text>
              <Text style={styles.tableValue}>{infoModalVisible?.name}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Email:</Text>
              <Text style={styles.tableValue}>{infoModalVisible?.email}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Duration:</Text>
              <Text style={styles.tableValue}>
                {infoModalVisible?.duration}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Created:</Text>
              <Text style={styles.tableValue}>
                {infoModalVisible?.createdAt}
              </Text>
            </View>
          </>
        </CustomModal>
        {isLoading && <Loader loaderText="Loading please wait..." />}
        <Text style={styles.subheading}>Your uploads</Text>
        <MediaList
          showVideoInfo={showVideoInfo}
          medias={sortedMedias}
          onSelect={mediaSelectHandler}
        />
        {selectedMedia.uri && (
          <Modal visible={true} transparent={false}>
            <View style={styles.videoPlayerContainer}>
              <TouchableOpacity
                onPress={() => shareVideo()}
                style={[styles.closeButton, styles.shareBtn]}>
                <Icon name="share-outline" size={36} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelectedMedia({type: '', uri: ''})}
                style={styles.closeButton}>
                <Icon name="close" size={36} color="white" />
              </TouchableOpacity>
              {selectedMedia.type === 'image' ? (
                <Image
                  source={{uri: selectedMedia.uri}}
                  style={styles.fullScreenVideo}
                  resizeMode="contain"
                />
              ) : (
                <VideoPlayer
                  source={{uri: selectedMedia.uri}}
                  style={styles.fullScreenVideo}
                  disableFullscreen
                  disableVolume
                  disableBack
                  onPlay={() => console.log('Video started')}
                  onPause={() => console.log('Video paused')}
                  onEnd={() => console.log('Video ended')}
                  onShowControls={() => console.log('onShowControls ended')}
                  onHideControls={() => console.log('onHideControls ended')}
                />
              )}
            </View>
          </Modal>
        )}
      </View>
    </>
  );
};

export default VideoLibrary;
