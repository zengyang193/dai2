const OSS_REGION = 'oss-cn-hangzhou';
const OSS_BUCKET = 'gfd-test';

function dataURI2Blob (dataURI, filename) {
  let byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0) {
    byteString = atob(dataURI.split(',')[1]);
  } else {
    byteString = unescape(dataURI.split(',')[1]);
  }

  let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  let ia = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  let blob = new Blob([ia], {type: mimeString});
  return new File([blob], filename);
}

function createClient (creds) {
  let client = new OSS.Wrapper({
    region: OSS_REGION,
    accessKeyId: creds.accessKeyId,
    accessKeySecret: creds.accessKeySecret,
    stsToken: creds.securityToken,
    bucket: OSS_BUCKET,
  });
  return client;
}

export function uploadBase64ImageFile (base64Image, key, creds) {
  let file = dataURI2Blob(base64Image, 'tmp');
  let client = createClient(creds);

  let progress = function (p) {
    return function (done) {
      done();
    };
  };

  let promise = new Promise((resolve, reject) => {
    client.multipartUpload(key, file, {progress: progress})
      .then((result) => {
        console.log('图片上传成功：', result);
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });

  return promise;
}
