// 简化query string，删除removeKeys数据组中的key
export function simplifyQueryString (queryStr = '', removeKeys = []) {
  let queries = queryStr.split('&');
  for (let j = 0; j < queries.length; j++) {
    let q = queries[j];
    for (let i = 0; i < removeKeys.length; i++) {
      let key = removeKeys[i];
      if (key === q.split('=')[0]) {
        queries.splice(j, 1);
        j--; // 移除元素后，游标后移
        removeKeys.splice(i, 1);
        break;
      }
    }
  }

  return queries.join('&');
};

// 简化query string，只保留reserveKeys数组中的key
export function compactQueryString (queryStr = '', reserveKeys = []) {
  let queries = queryStr.split('&');
  let newQueries = [];
  for (let j = 0; j < queries.length; j++) {
    let q = queries[j];
    for (let i = 0; i < reserveKeys.length; i++) {
      let key = reserveKeys[i];
      if (key === q.split('=')[0]) {
        newQueries.push(q);
        break;
      }
    }
  }

  return newQueries.join('&');
}

export function appendQueryString (url, key, value) {
  if (typeof value === 'undefined') {
    return url;
  }

  let components = url.split('?');
  let queryStr = components[1];
  let queries = queryStr ? queryStr.split('&') : [];
  let keyExist = false;
  let keyQuery = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;

  for (let i = 0; i < queries.length; i++) {
    let q = queries[i];
    let regex = new RegExp(`^${key}=`, 'g');
    if (regex.test(q)) {
      queries[i] = keyQuery;
      keyExist = true;
      break;
    }
  }
  if (!keyExist) {
    queries.push(keyQuery);
  }

  return `${components[0]}?${queries.join('&')}`;
};

export function appendParamsToQueryString (url, params) {
  Object.keys(params).forEach((key) => {
    url = appendQueryString(url, key, params[key]);
  });
  return url;
};
