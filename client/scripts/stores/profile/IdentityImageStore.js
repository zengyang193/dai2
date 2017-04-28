import {observable, action} from 'mobx';
import queryString from 'query-string';

import server from 'scripts/config/server';
import request from 'scripts/utils/request';

class IdentityImageStore {
  _defaultImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  @observable images = {
    front: this._defaultImage,
    back: this._defaultImage,
  }

  // 添加额外参数，重新拍摄照片后强制图片刷新
  _handleImageThumbURL (url) {
    let segs = url.split('?');
    let query = {};
    if (segs.length > 1) {
      query = queryString.parse(segs[1]);
    }
    query.kxd_timestamp = Date.now();

    return segs[0] + '?' + queryString.stringify(query);
  }

  @action fetchIdentityImageThumb = async (type, path) => {
    let imageSrc = await request.post(`${server.gateway}/idcard/photo`, {path});
    switch (type) {
    case 0:
      this.images.front = this._handleImageThumbURL(imageSrc);
      break;
    case 1:
      this.images.back = this._handleImageThumbURL(imageSrc);
      break;
    }
  }

  @action submitIdentityInfo = async (params) => {
    let result = await request.post(`${server.gateway}/idcard/add`, {...params});
    return result;
  }

  async recognizeIdentityImages (timestamp) {
    let result = await request.post(`${server.gateway}/idcard/photo/recognize`, {timestamp});
    return result;
  }

  @action resetIdenityImages () {
    this.images.front = this._defaultImage;
    this.images.back = this._defaultImage;
  }
}

export default IdentityImageStore;
