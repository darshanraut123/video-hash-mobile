import axios from 'axios';
// const LOCAL_BEACON_URL = 'https://rrdemo.buzzybrains.net/api/beacon';
// const SAVE_FIND_VIDEO_HASH_URL = 'https://rrdemo.buzzybrains.net/api/saveHash';
// const SAVE_FIND_PHOTO_HASH_URL =
//   'https://rrdemo.buzzybrains.net/api/savePhotoHash';
// const NIST_BEACON_URL = 'https://beacon.nist.gov/beacon/2.0/pulse/time';
// const GET_MY_VIDEOS_URL = 'https://rrdemo.buzzybrains.net/api/myvideos';
// const GET_MY_PHOTOS_URL = 'https://rrdemo.buzzybrains.net/api/myphotos';

const LOCAL_BEACON_URL =
  'https://video-hash-272192025748.us-central1.run.app/api/beacon';
const SAVE_FIND_VIDEO_HASH_URL =
  'https://video-hash-272192025748.us-central1.run.app/api/saveHash';
const SAVE_FIND_PHOTO_HASH_URL =
  'https://video-hash-272192025748.us-central1.run.app/api/savePhotoHash';
const NIST_BEACON_URL = 'https://beacon.nist.gov/beacon/2.0/pulse/time';
const GET_MY_VIDEOS_URL =
  'https://video-hash-272192025748.us-central1.run.app/api/myvideos';
const GET_MY_PHOTOS_URL =
  'https://video-hash-272192025748.us-central1.run.app/api/myphotos';
const LOGS_URL =
  'https://video-hash-272192025748.us-central1.run.app/api/verifylogs';
const FEEDBACK_URL =
  'https://video-hash-272192025748.us-central1.run.app/api/feedback';

export const getLocalBeaconAPI = async () => {
  try {
    let response = await axios.get(LOCAL_BEACON_URL);
    return response.data;
  } catch (error) {
    console.warn('Error fetching data from NIST Beacon:', error);
  }
};

export const getNistBeaconAPI = async () => {
  try {
    let response = await axios.get(
      NIST_BEACON_URL + '/' + Math.floor(Date.now() / 1000),
    );
    return response.data;
  } catch (error) {
    console.warn('Error fetching data from NIST Beacon:', error);
  }
};

export const saveVideoHash = async (body: any) => {
  try {
    let response = await axios.post(SAVE_FIND_VIDEO_HASH_URL, body);
    return response.data;
  } catch (error) {
    console.warn('Error saving:', error);
  }
};

export const savePhotoHash = async (body: any) => {
  try {
    let response = await axios.post(SAVE_FIND_PHOTO_HASH_URL, body);
    return response.data;
  } catch (error) {
    console.warn('Error saving:', error);
  }
};

export const findVideoInfo = async (videoId: string) => {
  try {
    console.log(SAVE_FIND_VIDEO_HASH_URL + '?videoId=' + videoId);
    let response = await axios.get(
      SAVE_FIND_VIDEO_HASH_URL + '?videoId=' + videoId,
    );
    return response.data;
  } catch (error) {
    console.warn('Error saving:', error);
  }
};

export const findPhotoInfo = async (photoId: string) => {
  try {
    console.log(SAVE_FIND_PHOTO_HASH_URL + '?photoId=' + photoId);
    let response = await axios.get(
      SAVE_FIND_PHOTO_HASH_URL + '?photoId=' + photoId,
    );
    return response.data;
  } catch (error) {
    console.warn('Error saving:', error);
  }
};

export const getMyVideos = async (email: string) => {
  try {
    console.log(GET_MY_VIDEOS_URL + '?email=' + email);
    let response = await axios.get(GET_MY_VIDEOS_URL + '?email=' + email);
    return response.data;
  } catch (error) {
    console.warn('Error saving:', error);
  }
};

export const getMyPhotos = async (email: string) => {
  try {
    console.log(GET_MY_VIDEOS_URL + '?email=' + email);
    let response = await axios.get(GET_MY_PHOTOS_URL + '?email=' + email);
    return response.data;
  } catch (error) {
    console.warn('Error saving:', error);
  }
};

export const saveVerifyLogs = async (body: any) => {
  try {
    let response = await axios.post(LOGS_URL, body);
    return response.data;
  } catch (error) {
    console.warn('Error saving:', error);
  }
};

export const saveFeedback = async (body: any) => {
  try {
    await axios.post(FEEDBACK_URL, body);
  } catch (error) {
    console.warn('Error saving:', error);
  }
};
