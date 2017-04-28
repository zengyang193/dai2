import server from 'scripts/config/server';
import request from 'scripts/utils/request';
import {showPreloader, hidePreloader} from 'scripts/utils/modal';
import {CHANNEL_KA_NIU} from 'scripts/constants/channelCodes';

const channel = window.__CHANNEL__;

class CordovaCamera {
  open (timestamp, type, path) {
    let promise = new Promise((resolve, reject) => {
      if (DS && DS.identityCamera) {
        DS.identityCamera.open({
          timestamp: timestamp,
          type: type,
        }, () => {
          resolve();
        }, () => {
          reject();
        });
      } else {
        reject();
      }
    });
    return promise;
  }
}

class KaniuCamera {
  open (timestamp, type, path) {
    let api = 'cardniu://api/openCameraWithoutEncoding?callbackData=jsonStr&quality=50';

    let promise = new Promise((resolve, reject) => {
      window.onReceivePhoto = function (imageString, jsonStr) {
        let base64Image = imageString;

        showPreloader('图片上传中');
        request.post(`${server.gateway}/oss/putBase64Img`, {
          key: path,
          img: base64Image,
        }, {
          showLoading: false,
          showError: false,
        }).then((result) => {
          hidePreloader();
          $.toast('图片上传成功');
          resolve();
        }).catch((err) => {
          hidePreloader();
          $.toast('图片上传失败');
          reject(err);
        });
      };
      window.open(api, '_blank');
    });
    return promise;
  }
}

let camera = new CordovaCamera();

switch (channel) {
case CHANNEL_KA_NIU:
  camera = new KaniuCamera();
  break;
}

export default camera;
