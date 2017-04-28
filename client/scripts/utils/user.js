import queryString from 'query-string';
import JSB from 'scripts/adapters/jsbridge';

class UserUtil {
  isLogged () {
    let auth = this.fetchAuthorization();
    let isLogged = !!(auth.userId && auth.token);
    return isLogged;
  }

  async fetchAuthorizationFromNative () {
    const userIdPromise = new Promise((resolve, reject) => {
      JSB.callNative('AppConfig.get', {key: 'userId'}, (result) => {
        if (result.code === 0) {
          resolve(result.data);
        } else {
          resolve('');
        }
      });
    });

    const tokenPromise = new Promise((resolve, reject) => {
      JSB.callNative('AppConfig.get', {key: 'token'}, (result) => {
        if (result.code === 0) {
          resolve(result.data);
        } else {
          resolve('');
        }
      });
    });

    let authInfo = await Promise.all([userIdPromise, tokenPromise]);
    return {userId: authInfo[0], token: authInfo[1]};
  }

  fetchAuthorization () {
    const query = queryString.parse(location.search);

    if (query.userId && query.token) {
      return {userId: query.userId, token: query.token};
    } else if (localStorage.getItem('userId') && localStorage.getItem('token')) {
      return {
        userId: localStorage.getItem('userId'),
        token: localStorage.getItem('token'),
      };
    }

    return {userId: '', token: ''};
  }
}

const userUtil = new UserUtil;

export default userUtil;
