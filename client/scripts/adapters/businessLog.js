import server from 'scripts/config/server';
import request from 'scripts/utils/request';
import {BUSINESS_LOG_DATA} from 'scripts/constants/localStorageKeys';

const initialLogData = `{
    "stepid": "",
    "userid": "",
    "channelsource": "",
    "positiondata": "",
    "platformid": "",
    "appversion": "",
    "phonebrand": "",
    "phonemodel": "",
    "operatorname": "",
    "phoneversion": "",
    "netmodel": "",
    "ipaddress": "",
    "idfa": "",
    "openudid": "",
    "imei": "",
    "macaddress": "",
    "bsdevicekey": "",
    "operatorcode": "",
    "comment": "",
    "cpuabi": "",
    "isemulator": "",
    "isjailbreak": "",
    "imsi": ""
}`;

class BusinessLog {
  logWithStep (step) {
    let promise = new Promise((resolve, reject) => {
      function _logWithStep () {
        JSBridge.callNative('BusinessLog.logWithStep', {step}, function (result) {
          if (result.code === 0) {
            resolve();
          } else {
            reject();
          }
        });
      }
      if (window.JSBridge) {
        _logWithStep();
      } else {
        document.addEventListener('JSBridgeReady', function () {
          _logWithStep();
        });
      }
    });
    return promise;
  }
}

class H5BusinessLog {
  logWithStep (step) {
    let logData = JSON.parse(localStorage.getItem(BUSINESS_LOG_DATA) || initialLogData);
    logData.stepid = step;
    logData.platform = ['android', 'ios'].indexOf(__OS_FAMILY__);

    let promise = new Promise((resolve, reject) => {
      request.post(`${server.gateway}/channel/addPoint`, {
        stepId: step,
        jsonStr: `[${JSON.stringify(logData)}]`,
        positionData: logData['positiondata'],
      }, {
        showLoading: false,
        showError: false,
      });
    });
    return promise;
  }
}

let bizLog = new H5BusinessLog();
if (__IS_APP__) {
  bizLog = new BusinessLog();
}

export default bizLog;

