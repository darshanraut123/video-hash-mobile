import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
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

  stopwatchContainer: {
    position: 'absolute',
    bottom: 120,
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

  toggleContainer: {
    flexDirection: 'row',
    width: '50%',
    height: 30,
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
  },
  active: {
    borderColor: '#37474F',
  },
  toggleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  activeText: {
    color: 'yellow',
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  bottomBar: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 20,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  bottomBtnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  captureButton: {
    width: 70,
    height: 70,
    backgroundColor: 'red',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCaptureButton: {
    width: 50,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 50,
  },
  recordButton: {
    width: 70,
    height: 70,
    backgroundColor: 'white',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerRecordButton: {
    width: 50,
    height: 50,
    backgroundColor: 'red',
    borderRadius: 50,
  },
  stopButton: {
    width: 70,
    height: 70,
    backgroundColor: 'red',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButtonInner: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 8,
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
