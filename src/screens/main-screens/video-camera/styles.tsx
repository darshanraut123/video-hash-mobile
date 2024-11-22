import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 50,
  },
  start_recording_button: {
    padding: 15,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#77c78d',
  },
  stop_recording_button: {
    padding: 15,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#CC0033',
  },
  camera_button: {
    padding: 15,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'gray',
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
  qrcodeContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  absQrcodeContainer: {
    position: 'absolute',
    zIndex: -1,
  },
  library_button_left: {
    position: 'absolute', // Position it absolutely
    left: 50, // Align it to the left
    bottom: 10, // Align it to the bottom
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0', // Customize button background color
    justifyContent: 'center',
    alignItems: 'center',
  },
  subButtonsContainer: {
    bottom: 40,
    width: 40,
  },
  subButtonLeft: {
    width: 40,
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 25,
    position: 'absolute',
    top: -50,
    left: -30,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subButtonRight: {
    width: 40,
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 25,
    position: 'absolute',
    top: -50,
    left: 30,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  library_button_right: {
    position: 'absolute', // Position it absolutely
    right: 50, // Align it to the left
    bottom: 10, // Align it to the bottom
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0', // Customize button background color
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopwatchContainer: {
    position: 'absolute',
    bottom: 180,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    color: '#FFF',
    marginBottom: 10,
  },
  flashLightContainer: {
    position: 'absolute',
    width: 40,
    height: 40,
    top: 30,
    left: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraSwicthContainer: {
    position: 'absolute',
    width: 40,
    height: 40,
    top: 80,
    left: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 150,
    width: '100%',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  zoomIcon: {
    display: 'flex',
    alignItems: 'center',
    height: 50,
    width: 50,
  },
  canvasStyle: {
    backgroundColor: 'white',
    height: 32,
    width: 32,
  },
  toggleContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 140,
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  toggleButton: {
    width: 70,
    height: 40,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#333',
    alignItems: 'center',
    opacity: 0.2,
  },
  activeButton: {
    backgroundColor: 'blue',
    opacity: 0.5,
  },
  toggleText: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeText: {
    color: '#fff',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export const options = {
  container: {
    backgroundColor: '#000',
    padding: 5,
    borderRadius: 5,
    width: 100,
  },
  text: {
    fontSize: 20,
    color: '#FFF',
    marginLeft: 7,
  },
};
