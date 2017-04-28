import fs from 'fs';
import path from 'path';

const walkSync = (dir, filelist) => {
  let files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach((file) => {
    let absFile = path.join(dir, file);
    if (fs.statSync(absFile).isDirectory()) {
      filelist = walkSync(absFile, filelist);
    } else {
      filelist.push(absFile);
    }
  });
  return filelist;
};

export default function (entryRoot, targetDir = '') {
  let entries = walkSync(entryRoot);
  entries = entries.reduce((entries, dir) => {
    let regex = new RegExp(`^${entryRoot}/(.*)\.jsx?$`, 'g');
    entries[dir.replace(regex, (match, p1) => (targetDir + p1))] = dir;
    return entries;
  }, {});

  return entries;
};
