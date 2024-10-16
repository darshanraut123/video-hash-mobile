// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   Modal,
// } from 'react-native';
// import Video from 'react-native-video';
// import RNFS, { ReadDirItem } from 'react-native-fs';
// import BlankHeader from '../../components/BlankHeader';
// import { NavigationProp } from '@react-navigation/native';

// const { width } = Dimensions.get('window');
// const numColumns = 3; // Number of videos per row

// // Update the type to match what RNFS returns
// interface VideoItem extends ReadDirItem {
//   isFile: boolean; // We'll explicitly extract this value
// }

// interface SignInScreenProps {
//   navigation: NavigationProp<any>;
// }

// const VideoLibrary = ({ navigation }: SignInScreenProps) => {
//   const [videos, setVideos] = useState<string[]>([]); // Store video paths
//   const [selectedVideo, setSelectedVideo] = useState<string | null>(null); // For the modal video player

//   useEffect(() => {
//     // Load saved videos from file system
//     const loadVideos = async () => {
//       try {
//         const files: ReadDirItem[] = await RNFS.readDir(RNFS.PicturesDirectoryPath); // Adjust path if needed

//         // Filter out only video files and ensure that it is a file (not a directory)
//         const videoFiles = files.filter(file => (file.isFile() && (file.name.endsWith('.mov') || file.name.endsWith('.mp4'))));
        
//         // Map file paths
//         const videoPaths = videoFiles.map(file => file.path);
//         setVideos(videoPaths);
//       } catch (error) {
//         console.log('Error loading videos: ', error);
//       }
//     };

//     loadVideos();
//   }, []);

//   // TypeScript expects FlatList's renderItem function to have proper typings
//   const renderVideoItem = ({ item }: { item: string }) => (
//     <TouchableOpacity
//       style={styles.videoContainer}
//       onPress={() => setSelectedVideo(item)}
//     >
//       <Video
//         source={{ uri: item }}
//         style={styles.thumbnail}
//         resizeMode="cover"
//         paused={true} // Pause the video as we only need the thumbnail
//       />
//       {/* Overlay to indicate video */}
//       <View style={styles.videoOverlay}>
//         <Text style={styles.videoPlayText}>▶️</Text>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <>
//     <BlankHeader onClose={() => navigation.goBack()} title="Library" />
//     <View style={styles.container}>
//       <Text style={styles.title}>Your Uploads</Text>
//       <FlatList
//         data={videos}
//         renderItem={renderVideoItem}
//         keyExtractor={(item, index) => index.toString()} // Use index as key if no unique ID is available
//         numColumns={numColumns}
//       />

//       {/* Modal for playing selected video */}
//       {selectedVideo && (
//         <Modal visible={true} transparent={false}>
//           <View style={styles.videoPlayerContainer}>
//             <TouchableOpacity onPress={() => setSelectedVideo(null)} style={styles.closeButton}>
//               <Text style={styles.closeText}>Close</Text>
//             </TouchableOpacity>
//             <Video
//               source={{ uri: selectedVideo }}
//               style={styles.fullScreenVideo}
//               resizeMode="contain"
//               controls={true} // Shows native play controls
//             />
//           </View>
//         </Modal>
//       )}
//     </View>
//     </>
//   );
// };

// export default VideoLibrary;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 10,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   videoContainer: {
//     flex: 1,
//     margin: 5,
//     backgroundColor: '#ccc',
//     aspectRatio: 1, // Makes each video container square
//   },
//   thumbnail: {
//     width: '100%',
//     height: '100%',
//   },
//   videoOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.3)',
//   },
//   videoPlayText: {
//     fontSize: 24,
//     color: 'white',
//   },
//   videoPlayerContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'black',
//   },
//   fullScreenVideo: {
//     width: '100%',
//     height: '80%',
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 40,
//     right: 20,
//     zIndex: 10,
//   },
//   closeText: {
//     color: 'white',
//     fontSize: 18,
//   },
// });


// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   Modal,
// } from 'react-native';
// import Video from 'react-native-video';
// import RNFS, { ReadDirItem } from 'react-native-fs';

// const { width } = Dimensions.get('window'); // Get screen width
// const numColumns = 3; // Number of videos per row
// const itemPadding = 5; // Space between items

// // Update the type to match what RNFS returns
// interface VideoItem extends ReadDirItem {
//   isFile: boolean; // We'll explicitly extract this value
// }

// export default function VideoLibrary(): JSX.Element {
//   const [videos, setVideos] = useState<string[]>([]); // Store video paths
//   const [selectedVideo, setSelectedVideo] = useState<string | null>(null); // For the modal video player

//   useEffect(() => {
//     // Load saved videos from file system
//     const loadVideos = async () => {
//       try {
//         const files: ReadDirItem[] = await RNFS.readDir(RNFS.PicturesDirectoryPath); // Adjust path if needed

//         // Filter out only video files and ensure that it is a file (not a directory)
//         const videoFiles = files.filter(file => file.isFile() && (file.name.endsWith('.mov') || file.name.endsWith('.mp4')));
        
//         // Map file paths
//         const videoPaths = videoFiles.map(file => file.path);
//         setVideos(videoPaths);
//       } catch (error) {
//         console.log('Error loading videos: ', error);
//       }
//     };

//     loadVideos();
//   }, []);

//   // Calculate the width of each video container based on the number of columns, accounting for padding
//   const itemWidth = (width - itemPadding * 2 * numColumns) / numColumns; // Adjust width of each item

//   const renderVideoItem = ({ item, index }: { item: string, index: number }) => (
//     <TouchableOpacity
//       style={[
//         styles.videoContainer, 
//         { 
//           width: itemWidth, 
//           height: itemWidth, // Keep height same as width to make it square
//           marginRight: (index + 1) % numColumns === 0 ? 0 : itemPadding, // Remove right padding for last item in the row
//           marginBottom: itemPadding, // Bottom padding for spacing between rows
//         }
//       ]} 
//       onPress={() => setSelectedVideo(item)}
//     >
//       <Video
//         source={{ uri: item }}
//         style={styles.thumbnail}
//         resizeMode="cover"
//         paused={true} // Pause the video as we only need the thumbnail
//       />
//       {/* Overlay to indicate video */}
//       <View style={styles.videoOverlay}>
//         <Text style={styles.videoPlayText}>▶️</Text>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Your Uploads</Text>
//       <FlatList
//         data={videos}
//         renderItem={renderVideoItem}
//         keyExtractor={(item, index) => index.toString()} // Use index as key if no unique ID is available
//         numColumns={numColumns} // Set the number of columns for the grid
//         contentContainerStyle={styles.listContent}
//       />

//       {/* Modal for playing selected video */}
//       {selectedVideo && (
//         <Modal visible={true} transparent={false}>
//           <View style={styles.videoPlayerContainer}>
//             <TouchableOpacity onPress={() => setSelectedVideo(null)} style={styles.closeButton}>
//               <Text style={styles.closeText}>Close</Text>
//             </TouchableOpacity>
//             <Video
//               source={{ uri: selectedVideo }}
//               style={styles.fullScreenVideo}
//               resizeMode="contain"
//               controls={true} // Shows native play controls
//             />
//           </View>
//         </Modal>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 10,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   listContent: {
//     paddingHorizontal: itemPadding, // Add some padding to the sides of the list
//   },
//   videoContainer: {
//     backgroundColor: '#ccc',
//   },
//   thumbnail: {
//     width: '100%',
//     height: '100%',
//   },
//   videoOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.3)',
//   },
//   videoPlayText: {
//     fontSize: 24,
//     color: 'white',
//   },
//   videoPlayerContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'black',
//   },
//   fullScreenVideo: {
//     width: '100%',
//     height: '80%',
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 40,
//     right: 20,
//     zIndex: 10,
//   },
//   closeText: {
//     color: 'white',
//     fontSize: 18,
//   },
// });




import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import Video from 'react-native-video';
import RNFS, { ReadDirItem } from 'react-native-fs';
import { NavigationProp } from '@react-navigation/native';
import BlankHeader from '../../components/BlankHeader';

const { width } = Dimensions.get('window'); // Get screen width
const numColumns = 3; // Number of videos per row
const itemPadding = 6; // Space between items
const extraRightMargin = 10; // Add extra margin on the right
const itemWidth = (width - itemPadding * (numColumns + 1) - extraRightMargin) / numColumns; // Adjusted width of each item

// Update the type to match what RNFS returns
interface VideoItem extends ReadDirItem {
  isFile: boolean; // We'll explicitly extract this value
}

interface VideoLibraryProps {
  navigation: NavigationProp<any>;
}

const VideoLibrary = ({navigation}: VideoLibraryProps) => {
  const [videos, setVideos] = useState<string[]>([]); // Store video paths
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null); // For the modal video player

  useEffect(() => {
    // Load saved videos from file system
    const loadVideos = async () => {
      try {
        const files: ReadDirItem[] = await RNFS.readDir(RNFS.PicturesDirectoryPath); // Adjust path if needed

        // Filter out only video files and ensure that it is a file (not a directory)
        const videoFiles = files.filter(file => file.isFile() && (file.name.endsWith('.mov') || file.name.endsWith('.mp4')));
        
        // Map file paths
        const videoPaths = videoFiles.map(file => file.path);
        setVideos(videoPaths);
      } catch (error) {
        console.log('Error loading videos: ', error);
      }
    };

    loadVideos();
  }, []);

  const renderVideoItem = ({ item, index }: { item: string, index: number }) => (
    <TouchableOpacity
      style={[
        styles.videoContainer, 
        { 
          width: itemWidth, 
          height: itemWidth, // Keep height same as width to make it square
          marginRight: (index + 1) % numColumns === 0 ? 0 : itemPadding, // Remove right padding for last item in the row
          marginBottom: itemPadding, // Bottom padding for spacing between rows
        }
      ]} 
      onPress={() => setSelectedVideo(item)}
    >
      <View style={styles.thumbnailContainer}>
        <Video
          source={{ uri: item }}
          style={styles.thumbnail}
          resizeMode="cover"
          paused={true} // Pause the video as we only need the thumbnail
        />
      </View>
      {/* Overlay to indicate video */}
      <View style={styles.videoOverlay}>
        <Text style={styles.videoPlayText}>▶️</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
    <BlankHeader onClose={() => navigation.goBack()} title="Video Library" />
    <View style={styles.container}>
      <Text style={styles.title}>Your Uploads</Text>
      <FlatList
        data={videos}
        renderItem={renderVideoItem}
        keyExtractor={(item, index) => index.toString()} // Use index as key if no unique ID is available
        numColumns={numColumns} // Set the number of columns for the grid
        contentContainerStyle={styles.listContent}
      />

      {/* Modal for playing selected video */}
      {selectedVideo && (
        <Modal visible={true} transparent={false}>
          <View style={styles.videoPlayerContainer}>
            <TouchableOpacity onPress={() => setSelectedVideo(null)} style={styles.closeButton}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
            <Video
              source={{ uri: selectedVideo }}
              style={styles.fullScreenVideo}
              resizeMode="contain"
              controls={true} // Shows native play controls
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
    padding: itemPadding, // Add padding to the container
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  listContent: {
    paddingHorizontal: itemPadding, // Padding on the sides of the grid
    paddingRight: extraRightMargin, // Add extra margin to the right side
  },
  videoContainer: {
    backgroundColor: '#ccc',
    borderRadius: 5, // Rounded corners for the videos
    overflow: 'hidden', // Ensure video respects the border radius
  },
  thumbnailContainer: {
    borderRadius: 5, // Same border radius for the thumbnail
    overflow: 'hidden', // Ensure the thumbnail respects the rounded border
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 5, // Apply border radius to overlay as well
  },
  videoPlayText: {
    fontSize: 24,
    color: 'white',
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

