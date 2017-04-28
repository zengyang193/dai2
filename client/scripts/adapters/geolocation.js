import {
    CHANNEL_KA_NIU,
    CHANNEL_WE_CHAT,
} from 'scripts/constants/channelCodes';

class CordovaGeolocation {
  constructor () {
    this.location = null; // 缓存地理位置信息
  }

  getCurrentPosition () {
    let getCurrentPositionFunc = __PLATFORM__ === 'ios'
      ? navigator.geolocation.getCurrentPosition
      : DS.geolocation.getCurrentPosition;
    let promise = new Promise((resolve, reject) => {
      if (this.location) {
        resolve(this.location);
      } else {
        getCurrentPositionFunc((location) => {
          this.location = location;
          resolve(location);
        }, () => {
          reject();
        }, {timeout: 10000});
      }
    });

    return promise;
  }
}

class KaniuGeolocation {
  getCurrentPosition () {
    let promise = new Promise((resolve, reject) => {
      try {
        let logData = JSON.parse(localStorage.getItem('logData'));
        let positionData = logData['positiondata'].split(',');
        if (positionData[0] && positionData[1]) {
          let location = {
            coords: {
              latitude: positionData[0],
              longitude: positionData[1],
            },
          };
          resolve(location);
        } else {
          reject();
        }
      } catch (e) {
        reject();
      }
    });
    return promise;
  }
}

let geolocation = new CordovaGeolocation();

switch (__CHANNEL__) {
case CHANNEL_KA_NIU:
case CHANNEL_WE_CHAT:
  geolocation = new KaniuGeolocation();
  break;
}

export default geolocation;

