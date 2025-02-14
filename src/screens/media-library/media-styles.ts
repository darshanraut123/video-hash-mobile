import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  videoContainer: {
    backgroundColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    borderRadius: 5,
    overflow: 'hidden',
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
  },
  statusIcon: {
    position: 'absolute',
    bottom: 3,
    left: 2,
  },
  videoPlayText: {
    fontSize: 24,
    color: '#000',
  },
  infoIcon: {
    position: 'absolute',
    height: 30,
    width: 30,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    top: 5,
    right: 5,
    borderRadius: 15,
    padding: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  playBtnWrapper: {
    backgroundColor: '#F7921B',
    width: 26,
    height: 26,
    borderRadius: 2,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  duration: {
    position: 'absolute',
    backgroundColor: '#474747',
    bottom: 7,
    right: 3,
    borderRadius: 1,
    paddingHorizontal: 4,
    paddingVertical: 2,
    fontSize: 10,
    color: 'white',
    fontFamily: "Lato-Regular"
  },
});

export default styles;
