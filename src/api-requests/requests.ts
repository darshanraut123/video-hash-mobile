import axios from 'axios';
const LOCAL_BEACON_URL = 'https://rrdemo.buzzybrains.net/api/beacon';
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
