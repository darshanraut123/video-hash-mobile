import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  buttonContainer: {
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 50,
  },
  start_recording_button: {
    padding: 15,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00796B',
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

  canvasStyle: {
    backgroundColor: 'white',
    height: 32,
    position: 'absolute',
    width: 32,
    bottom: -100,
  },

  settingContainer: {
    position: 'absolute',
    top: 50,
    left: 25,
    height: 50,
    width: 50,
    borderRadius: 25,
  },

  toggleContainer: {
    position: 'absolute',
    bottom: 145,
    flexDirection: 'row',
    borderRadius: 30,
    width: '50%',
    height: 30,
    backgroundColor: '#B0BEC5',
    alignSelf: 'center',
  },
  saveDiscardContainer: {
    width: '80%',
    backgroundColor: 'transparent',
    bottom: 80,
  },
  toggleButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
  active: {
    backgroundColor: '#00ACC1',
    borderWidth: 2,
    borderColor: '#37474F',
  },
  toggleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  activeText: {
    color: '#37474F',
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
  title: {
    fontSize: 28,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#FF6347',
    textShadowColor: '#FF4500',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 10,
  },
  button: {
    backgroundColor: '#00ACC1',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FFD700',
    elevation: 10,
  },

  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    width: 250,
  },
  modalHeading: {
    fontSize: 24,
    marginBottom: 22,
    fontWeight: 'bold',
    color: '#37474F',
    textTransform: 'capitalize',
  },
  modalToggleContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  toggleLabel: {
    fontSize: 18,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8E24AA',
    backgroundColor: '#fff',
  },
  radioButtonActive: {
    backgroundColor: '#8E24AA',
  },
  closeButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: 'gainsboro',
    marginTop: 10,
    marginBottom: 20,
  },
});

export const options = {
  container: {
    borderRadius: 5,
  },
  text: {
    fontSize: 16,
    color: '#B0BEC5',
  },
};
