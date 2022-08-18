import CryptoJS from 'crypto-js'
import { getUUID } from "@/utils";
/**
 * 邮箱
 * @param {*} s
 */
export function isEmail(s) {
  return /^([a-zA-Z0-9._-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/.test(s)
}

/**
 * 手机号码
 * @param {*} s
 */
export function isMobile(s) {
  return /^1[0-9]{10}$/.test(s)
}

/**
 * 电话号码
 * @param {*} s
 */
export function isPhone(s) {
  return /^([0-9]{3,4}-)?[0-9]{7,8}$/.test(s)
}

/**
 * URL地址
 * @param {*} s
 */
export function isURL(s) {
  return /^http[s]?:\/\/.*/.test(s)
}

export function getNowFormatDate() {
  var date = new Date();
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentDate = date.getFullYear() + "-" + month + "-" + strDate
    + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  return currentDate;
}

export function loadSignatureParams(config, data) {
  var timestamp = getNowFormatDate();
  var nonce = getUUID();
  var version = "1.0.0";
  var params;
  var signature;
  var signMethod = `${window.SITE_CONFIG['signMethod']}`;
  var secretKey = `${window.SITE_CONFIG['secretKey']}`;
  if (data) {
    for (var p in data) {
      if (data[p] && (typeof data[p]) != 'object') {//对象不参与
        if (!params) {
          params = p;
        } else {
          params = params + "," + p;
        }
        if (!signature) {
          signature = p + "=" + data[p];
        } else {
          signature = signature + "&" + p + "=" + data[p];
        }
      }
    }
    signature = signature + version + nonce + timestamp;
    if ("HmacMD5" === signMethod) {
      let str = CryptoJS.HmacMD5(signature, secretKey);
      signature = CryptoJS.enc.Hex.stringify(str);
    } else if ("HmacSHA1" === signMethod) {
      let str = CryptoJS.HmacSHA1(signature, secretKey);
      signature = CryptoJS.enc.Hex.stringify(str);
    } else if ("HmacSHA256" === signMethod) {
      let str = CryptoJS.HmacSHA256(signature, secretKey);
      signature = CryptoJS.enc.Hex.stringify(str);
    }
    config.headers['X-API-Signature-Params'] = params;
    config.headers['X-API-Signature'] = signature;//params + version + nonce + timestamp
  }
  config.headers['X-Message-Version'] = `${window.SITE_CONFIG['messageVersion']}`;
  config.headers['X-API-Version'] = version;
  config.headers['X-Client-Id'] = `${window.SITE_CONFIG['xClientId']}`;
  config.headers['X-API-Timestamp'] = timestamp;
  config.headers['X-API-Nonce'] = nonce;
  config.headers['X-API-Signature-Method'] = `${window.SITE_CONFIG['signMethod']}`
}