import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
} from 'react-native';
import {NavigationProp} from '@react-navigation/native';
import PhotoList from './photo-list';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Share from 'react-native-share';
import Icon from 'react-native-vector-icons/Ionicons'; // If you want to use vector icons
import {getMyPhotos} from '../../service/hash-requests';
import Toast from 'react-native-toast-message';
import {Paths} from '../../navigation/path';
import Loader from '../../components/loader';
import CustomModal from '../../components/custom-modal';

interface PhotoLibraryProps {
  navigation: NavigationProp<any>;
}

export interface PhotoInterface {
  path: string;
}

export interface modalDataI {
  path: string;
  email: string;
  name: string;
  createdAt: string;
}

const PhotoLibrary: React.FC<PhotoLibraryProps> = ({navigation}) => {
  const [photos, setPhotos] = useState<PhotoInterface[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [infoModalVisible, setInfoModalVisible] = useState<modalDataI | null>(
    null,
  );
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
      } finally {
        setIsLoading(false);
      }
    };
    loadPhotos();
  }, []);

  const showPhotoInfo = (ModalInfo: modalDataI) => {
    console.log('showPhotoInfo');
    setInfoModalVisible(ModalInfo);
  };

  const shareVideo = async () => {
    try {
      // Share options
      const options = {
        url: `file://${selectedPhoto}`, // Share video using its file URI
        type: 'video/*', // Specify the file type
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
              <Text style={styles.tableLabel}>Created:</Text>
              <Text style={styles.tableValue}>
                {infoModalVisible?.createdAt}
              </Text>
            </View>
          </>
        </CustomModal>

        {isLoading && <Loader loaderText="Loading your photos" />}
        <View style={styles.header}>
          <Text style={styles.headerText}>REALITY REGISTRY</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.icon}
              onPress={() => navigation.navigate(Paths.VideoCamera)}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.title}>Your Photos</Text>
        <View style={{width: '100%'}}>
          <PhotoList
            showPhotoInfo={showPhotoInfo}
            photos={photos}
            onSelectPhoto={setSelectedPhoto}
          />
        </View>
        {selectedPhoto && (
          <Modal visible={true} transparent={false}>
            <View style={styles.photoContainer}>
              <TouchableOpacity
                onPress={() => shareVideo()}
                style={[styles.closeButton, styles.shareBtn]}>
                <Icon name="share-outline" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelectedPhoto(null)}
                style={styles.closeButton}>
                <Icon name="close" size={24} color="white" />
              </TouchableOpacity>
              <Image
                source={{uri: 'file://' + selectedPhoto}}
                style={styles.fullScreenPhoto}
                resizeMode="contain"
              />
            </View>
          </Modal>
        )}
      </View>
    </>
  );
};

export default PhotoLibrary;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  photoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  fullScreenPhoto: {
    width: '100%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  shareBtn: {left: 20},
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
