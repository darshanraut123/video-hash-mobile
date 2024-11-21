import { StyleSheet } from 'react-native';

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
});
