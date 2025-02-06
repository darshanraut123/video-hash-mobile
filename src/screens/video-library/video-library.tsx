import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Modal} from 'react-native';
import {NavigationProp} from '@react-navigation/native';
import VideoList from './video-list';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Share from 'react-native-share';
import Icon from 'react-native-vector-icons/Ionicons'; // If you want to use vector icons
import {getMyPhotos, getMyVideos} from '../../service/hash-requests';
import Toast from 'react-native-toast-message';
import {Paths} from '../../navigation/path';
import Loader from '../../components/loader';
import CustomModal from '../../components/custom-modal';
import PhotoList from '../photo-library/photo-list';
import {Image} from 'react-native';
import VideoPlayer from 'react-native-video-controls';

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
  duration: number;
  createdAt: string;
}

const VideoLibrary: React.FC<VideoLibraryProps> = ({navigation}) => {
  const [videos, setVideos] = useState<VideoInterface[]>([]);
  const [photos, setPhotos] = useState<PhotoInterface[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [infoModalVisible, setInfoModalVisible] = useState<modalDataI | null>(
    null,
  );
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [photoTabActive, setPhotoTabActive] = useState<boolean>(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

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
      const selectedUri = selectedPhoto ? selectedPhoto : selectedVideo;
      const content = selectedPhoto ? 'image' : 'video';
      // Share options
      const options = {
        url: `file://${selectedUri}`, // Share video using its file URI
        type: content + '/*', // Specify the file type
      };

      await Share.open(options);
    } catch (error) {
      console.error('Error sharing video:', error);
    }
  };

  return (
    <>
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
        <View style={styles.header}>
          <Text style={styles.headerText}>REALITY REGISTRY</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => navigation.navigate(Paths.Goto)}>
              <Icon name="menu" size={24} color="#007BFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setPhotoTabActive(true)}
            style={{
              ...styles.tabs,
              backgroundColor: photoTabActive ? '#008ae6' : 'gainsboro',
            }}>
            <Text style={styles.tabsTxt}>Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setPhotoTabActive(false)}
            style={{
              ...styles.tabs,
              backgroundColor: !photoTabActive ? '#008ae6' : 'gainsboro',
            }}>
            <Text style={styles.tabsTxt}>Video</Text>
          </TouchableOpacity>
        </View>
        <View style={{width: '100%', marginTop: 10}}>
          {photoTabActive ? (
            <PhotoList
              showPhotoInfo={showVideoInfo}
              photos={photos}
              onSelectPhoto={setSelectedPhoto}
            />
          ) : (
            <VideoList
              showVideoInfo={showVideoInfo}
              videos={videos}
              onSelectVideo={setSelectedVideo}
            />
          )}
        </View>
        {selectedVideo && (
          <Modal visible={true} transparent={false}>
            <View style={styles.videoPlayerContainer}>
              <TouchableOpacity
                onPress={() => shareVideo()}
                style={[styles.closeButton, styles.shareBtn]}>
                <Icon name="share-outline" size={36} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelectedVideo(null)}
                style={styles.closeButton}>
                <Icon name="close" size={36} color="white" />
              </TouchableOpacity>

              <VideoPlayer
                source={{uri: selectedVideo}}
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
            </View>
          </Modal>
        )}

        {selectedPhoto && (
          <Modal visible={true} transparent={false}>
            <View style={styles.videoPlayerContainer}>
              <TouchableOpacity
                onPress={() => shareVideo()}
                style={[styles.closeButton, styles.shareBtn]}>
                <Icon name="share-outline" size={36} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelectedPhoto(null)}
                style={styles.closeButton}>
                <Icon name="close" size={36} color="white" />
              </TouchableOpacity>
              <Image
                source={{uri: 'file://' + selectedPhoto}}
                style={styles.fullScreenVideo}
                resizeMode="contain"
              />
            </View>
          </Modal>
        )}
      </View>
    </>
  );
};

export default VideoLibrary;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
  },
  tabContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tabs: {
    width: '48%',
    height: 50,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  tabsTxt: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 3,
  },
  videoPlayerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  fullScreenVideo: {
    width: '100%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 25,
    zIndex: 1,
  },
  shareBtn: {left: 25},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  icon: {
    width: 50,
    height: 50,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#36454F',
    borderRadius: 25,
  },

  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  tableValue: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    paddingLeft: 10,
  },
});
