import axios from 'axios';
// const SIGNUPURL = 'https://rrdemo.buzzybrains.net/api/register';
// const LOGINAUTHURL = 'https://rrdemo.buzzybrains.net/api/login';
const SIGNUPURL =
  'https://video-hash-272192025748.us-central1.run.app/api/register';
const LOGINAUTHURL =
  'https://video-hash-272192025748.us-central1.run.app/api/login';

export const authCheckAPI = async (token?: string, googleToken?: string) => {
  try {
    let response = await axios.get(LOGINAUTHURL, {
      headers: {Authorization: 'Bearer ' + token, googleToken},
    });
    return response;
  } catch (error) {
    console.warn('Error in authCheckAPI: ', error);
    return null;
  }
};

export const signUpAPI = async (body: any) => {
  try {
    console.log('Body req==> ' + JSON.stringify(body));
    let response = await axios.post(SIGNUPURL, body);
    console.log('Response==> ' + JSON.stringify(response));
    return response;
  } catch (error) {
    console.warn('Error in signUpAPI: ', error);
    return null;
  }
};

export const loginAPI = async (body: any) => {
  try {
    let response = await axios.post(LOGINAUTHURL, body);
    return response;
  } catch (error) {
    console.warn('Error in loginAPI: ', error);
    return null;
  }
};
