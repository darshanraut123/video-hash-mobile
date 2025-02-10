import ReceiveSharingIntent from 'react-native-receive-sharing-intent';
import {useEffect, useState} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppState} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Paths} from '../../../navigation/path';

export type ShareFile = {
  filePath?: string;
  text?: string;
  weblink?: string;
  mimeType?: string;
  contentUri?: string;
  fileName?: string;
  extension?: string;
};

type RootStackParamList = {
  [Paths.Verify]: {isPhoto: boolean; path: string};
};

export const useGetShare = () => {
  const navigation =
    useNavigation<
      StackNavigationProp<RootStackParamList, any>
    >();
  const [share, setShare] = useState<ShareFile[] | undefined>(undefined);

  useEffect(() => {
    const handleReceivedFiles = () => {
      ReceiveSharingIntent.getReceivedFiles(
        (files: ShareFile[]) => {
          if (files.length) {
            console.log('Received Files ✅', files);
            setShare(files);
            if (files) {
              const file: any = files[0];
              console.log(JSON.stringify(file));
              if (file?.mimeType && file?.filePath) {
                navigation.navigate(Paths.Verify, {
                  isPhoto: file.mimeType.includes('image'),
                  path: file.filePath,
                });
              }
            }
          }
        },
        (error: any) => {
          console.error('Error receiving files:', error);
        },
        'org.reactjs.native.example.RealityRegistry',
      );
    };

    handleReceivedFiles();

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        handleReceivedFiles();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return share;
};
