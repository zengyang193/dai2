import server from 'scripts/config/server';
import request from 'scripts/utils/request';
import geolocation from 'scripts/adapter/geolocation';

class ChannelLog {
  _sendLogRequest (params) {
    return request.post(
      `${server.gateway}/channel/specailProvince/point`,
      params,
      {showLoading: false, showError: false}
    );
  }

  logWithStep (step) {
    if (['_gfd'].indexOf(__CHANNEL__) === -1) {
      return;
    }

    let promise = new Promise((resolve, reject) => {
      geolocation.getCurrentPosition()
        .then((loc) => {
          let params = {
            stepId: step,
            platform: __OS_FAMILY__,
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
          };
          this._sendLogRequest(params)
            .then((result) => resolve())
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
    return promise;
  }
}

let chlog = new ChannelLog();

export default chlog;
