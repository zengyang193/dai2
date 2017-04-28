import fs from 'fs';

export default function (jsonPath) {
  return function (req, res, next) {
    if (__DEV__) {
      res.locals.__assets = JSON.parse(fs.readFileSync(jsonPath));
    } else {
      if (!res.locals.__assets) {
        res.locals.__assets = JSON.parse(fs.readFileSync(jsonPath));
      }
    }
    next();
  };
}

