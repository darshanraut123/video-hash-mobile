import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Modal} from 'react-native';
import RNFS, {ReadDirItem} from 'react-native-fs';
import {NavigationProp} from '@react-navigation/native';
import BlankHeader from '../../components/BlankHeader';
import VideoList from './VideoList';
import Video from 'react-native-video';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface VideoLibraryProps {
  navigation: NavigationProp<any>;
}

export interface VideoInterface {
  path: string;
  status: string;
}

const VideoLibrary: React.FC<VideoLibraryProps> = ({navigation}) => {
  const [videos, setVideos] = useState<VideoInterface[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // useEffect(() => {
  //   const loadVideos = async () => {
  //     try {
  //       const files: ReadDirItem[] = await RNFS.readDir(RNFS.PicturesDirectoryPath);
  //       const videoFiles = files.filter(file => file.isFile() && (file.name.endsWith('.mov') || file.name.endsWith('.mp4')));
  //       const videoPaths = videoFiles.map(file => file.path);
  //       setVideos(videoPaths);
  //     } catch (error) {
  //       console.log('Error loading videos: ', error);
  //     }
  //   };

  //   loadVideos();
  // }, []);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const files: ReadDirItem[] = await RNFS.readDir(
          RNFS.PicturesDirectoryPath,
        );
        const tasks: any = await AsyncStorage.getItem('TASK_QUEUE');
        const parsedTasks: any = tasks ? JSON.parse(tasks) : [];
        const videoFiles = files.filter(
          file =>
            file.isFile() &&
            (file.name.endsWith('.mov') || file.name.endsWith('.mp4')),
        );
        const videoPaths: any = videoFiles.map((item: any) => {
          const match = parsedTasks.find(
            (obj: any) =>
              obj.path === item.path || obj.path === item.statusPath,
          );
          console.log({...item, status: match ? match.status : 'completed'});
          return {...item, status: match ? match.status : 'completed'};
        });
        console.log('videoPaths: ' + JSON.stringify(videoPaths));
        setVideos(videoPaths);
      } catch (error) {
        console.log('Error loading videos: ', error);
      }
    };
    loadVideos();
  }, []);

  return (
    <>
      <BlankHeader onClose={() => navigation.goBack()} title="Video Library" />
      <View style={styles.container}>
        <Text style={styles.title}>Your Videos</Text>
        <VideoList videos={videos} onSelectVideo={setSelectedVideo} />
        {selectedVideo && (
          <Modal visible={true} transparent={false}>
            <View style={styles.videoPlayerContainer}>
              <TouchableOpacity
                onPress={() => setSelectedVideo(null)}
                style={styles.closeButton}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
              <Video
                source={{uri: selectedVideo}}
                style={styles.fullScreenVideo}
                resizeMode="contain"
                controls={true}
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
    padding: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
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
    top: 40,
    right: 20,
    zIndex: 10,
  },
  closeText: {
    color: 'white',
    fontSize: 18,
  },
});
