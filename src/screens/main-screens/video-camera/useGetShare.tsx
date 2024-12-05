import ReceiveSharingIntent from 'react-native-receive-sharing-intent';
import {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ShareFile = {
  filePath?: string;
  text?: string;
  weblink?: string;
  mimeType?: string;
  contentUri?: string;
  fileName?: string;
  extension?: string;
};

export const useGetShare = () => {
  const [share, setShare] = useState<ShareFile[] | undefined>(undefined);

  useEffect(() => {
    const handleReceivedFiles = () => {
      ReceiveSharingIntent.getReceivedFiles(
        (files: ShareFile[]) => {
          if (files.length) {
            console.log('Received Files', files);
            setShare(files);
            AsyncStorage.setItem('intent', JSON.stringify(files))
              .then(() => console.log('Intent data saved successfully!'))
              .catch(err => console.error('Error saving intent data:', err));
          }
        },
        (error: any) => {
          console.error('Error receiving files:', error);
        },
        'com.RealityRegistry',
      );
    };

    handleReceivedFiles();
  }, []);

  return share;
};
