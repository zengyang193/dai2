// Number格式工具
export function str2Number (text, precision, showPercent) {
  text = (text + '').replace(/,/g, '');
  let prec = precision != 2 ? precision : 2;
  let rawNumber = showPercent
    ? (Number(text || 0) * 100).toFixed(prec)
    : Number(text || 0).toFixed(prec);
  x = rawNumber.split('.');
  x1 = x[0];
  x2 = x.length > 1 ? '.' + x[1] : '';
  let rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }
  return showPercent?(x1 + x2+'%'):(x1+x2);
}

// 数字转大写金额
export function num2Cny (num) {
  let capUnit = ['万', '亿', '万', '圆', ''];
  let capDigit = {2: ['角', '分', ''], 4: ['仟', '佰', '拾', '']};
  let capNum=['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  if (((num.toString()).indexOf('.') > 16)||(isNaN(num)))
    return '';
  num = (Math.round(num * 100) / 100).toFixed(2).toString();
  num =((Math.pow(10, 19 - num.length)).toString()).substring(1) + num;
  let i, ret, j, nodeNum, k, subret, len, subChr, CurChr = [];
  for (i = 0, j = 0, ret = ''; i < 5; i++, j = i * 4 + Math.floor(i / 4)) {
    nodeNum = num.substring(j, j + 4);
    for (
      k = 0, subret = '', len = nodeNum.length;
      ((k < len) && (parseInt(nodeNum.substring(k)) != 0));
      k++
    ) {
      CurChr[k % 2] = capNum[nodeNum.charAt(k)] + ((nodeNum.charAt(k) == 0)
        ? ''
        : capDigit[len][k]);
      if (!((CurChr[0] == CurChr[1]) && (CurChr[0] == capNum[0]))) {
        if(!((CurChr[k % 2] == capNum[0]) && (subret=='') && (ret==''))) {
          subret += CurChr[k % 2];
        }
      }
    }
    subChr = subret + ((subret == '') ? '' : capUnit[i]);
    if(!((subChr == capNum[0]) && (ret == '')))
      ret += subChr;
  }
  ret = (ret == '') ? capNum[0] + capUnit[3] : ret;
  return ret;
}

// 日期格式
// 将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// formatDate("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// formatDate("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
export function formatDate (timestamp, fmt) {
  let date = new Date(timestamp);
  let o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    'S': date.getMilliseconds(), // 毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length)
    );
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1)
        ? (o[k])
        : (('00' + o[k]).substr(('' + o[k]).length)));
    }
  }
  return fmt;
}

// 根据时间戳计算年龄 str:"1980-03-22"
export function ages (str) {
  let r = str.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);
  if (r == null) {
    return false;
  }

  let d = new Date(r[1], r[3]-1, r[4]);
  if (
    d.getFullYear() == r[1] &&
    (d.getMonth() + 1) == r[3] &&
    d.getDate() == r[4]
  ) {
    let Y = new Date().getFullYear();
    return Y - r[1];
  }
  return '';
}

// 姓名加码
export function maskName (str) {
  return str.substr(0, 1) + '*' + str.substr(str.length-1, 1);
}
