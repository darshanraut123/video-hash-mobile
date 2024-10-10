import axios from 'axios';
const LOCAL_BEACON_URL = 'https://rrdemo.buzzybrains.net/api/beacon';
const SAVE_FIND_HASH_URL = 'https://rrdemo.buzzybrains.net/api/saveHash';
const NIST_BEACON_URL = 'https://beacon.nist.gov/beacon/2.0/pulse/time';

export const getLocalBeaconAPI = async () => {
  try {
    let response = await axios.get(LOCAL_BEACON_URL);
    // console.log('LocalBeaconResponse==> ' + JSON.stringify(response.data));
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
    // console.log('NistBeaconResponse==> ' + JSON.stringify(response.data));
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

export const findVideoHash = async (videoId: string) => {
  try {
    let response = await axios.get(SAVE_FIND_HASH_URL + '?videoId=' + videoId);
    return response.data;
  } catch (error) {
    console.warn('Error saving:', error);
  }
};
