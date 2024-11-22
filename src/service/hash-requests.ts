import axios from 'axios';
const LOCAL_BEACON_URL = 'https://rrdemo.buzzybrains.net/api/beacon';
const SAVE_FIND_HASH_URL = 'https://rrdemo.buzzybrains.net/api/saveHash';
const NIST_BEACON_URL = 'https://beacon.nist.gov/beacon/2.0/pulse/time';
const GET_MY_VIDEOS_URL = 'https://rrdemo.buzzybrains.net/api/myvideos';

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
    let response = await axios.post(SAVE_FIND_HASH_URL, body);
    return response.data;
  } catch (error) {
    console.warn('Error saving:', error);
  }
};

export const findVideoInfo = async (videoId: string) => {
  try {
    console.log(SAVE_FIND_HASH_URL + '?videoId=' + videoId);
    let response = await axios.get(SAVE_FIND_HASH_URL + '?videoId=' + videoId);
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