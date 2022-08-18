import axios from 'axios'
import Cookies from 'js-cookie'
import router from '@/router'
import store from '@/store';
import qs from 'qs'
import { Base64 } from 'js-base64'
import { clearLoginInfo } from '@/utils'
import isPlainObject from 'lodash/isPlainObject'
import { loadSignatureParams } from '@/utils/validate'

const http = axios.create({
  baseURL: window.SITE_CONFIG['apiURL'],
  timeout: 1000 * 180,
  withCredentials: true
})

/**
 * 请求拦截
 */
http.interceptors.request.use(config => {
  config.headers['Accept-Language'] = Cookies.get('language') || 'zh-CN'
  const { token } = store.state;
  if (!config.headers['Authorization']) {
    debugger
    if (token && token !== "undefined") {//token 过期 需要用到Basic，返回之后需要用到新的token
      config.headers['Authorization'] = 'Bearer ' + token;
    } else {
      config.headers['Authorization'] = 'Basic ' + Base64.encode(`${window.SITE_CONFIG['clientId']}:${window.SITE_CONFIG['clientSecret']}`)
    }
  } else {
    console.log("已经设置:" + config.headers['Authorization'])
  }
debugger
  // 默认参数
  var defaults = {}
  // 防止缓存，GET请求默认带_t参数
  if (config.method === 'get') {
    config.params = {
      ...config.params,
      ...{ '_t': new Date().getTime() }
    }
  }
  if (isPlainObject(config.params)) {
    config.params = {
      ...defaults,
      ...config.params
    }
    loadSignatureParams(config, config.params);
  }
  if (isPlainObject(config.data)) {
    config.data = {
      ...defaults,
      ...config.data
    }
    loadSignatureParams(config, config.data);
    if (/^application\/x-www-form-urlencoded/.test(config.headers['content-type'])) {
      config.data = qs.stringify(config.data)
    }
  } else if (!config.headers['X-API-Nonce']) {
    loadSignatureParams(config, null);
  }
  return config
}, error => {
  return Promise.reject(error)
})

// 是否正在刷新的标记
let isRefreshing = false
//重试队列
let requests = []
const dataForm = { refresh_token: '', grant_type: 'refresh_token', scope: 'openid' }
/**
 * 响应拦截
 */
http.interceptors.response.use(response => {
  //debugger
  if (response.data.code === 450) {
    if (!isRefreshing) {
      isRefreshing = true
      const { refresh } = store.state;
      dataForm.refresh_token = refresh
      return http
        .post('/oauth/token', dataForm, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": 'Basic ' + Base64.encode(`${window.SITE_CONFIG['clientId']}:${window.SITE_CONFIG['clientSecret']}`)
          }
        }).then(({ data: res }) => {
          debugger
          if (res.code !== 0) {
            clearLoginInfo()
            router.replace({ name: 'login' })
            return Promise.reject(response.data.msg)
          } else {
            const { access_token } = res.data;
            store.commit("UPDATE_TOKEN", access_token);
            // response.headers.Authorization = 'Bearer ' + `${access_token}`
            // access_token 刷新后将数组的方法重新执行
            requests.forEach((cb) => cb(access_token))
            requests = [] // 重新请求完清空
            return http(response.config)
          }
        }).catch(() => {
          clearLoginInfo()
          router.replace({ name: 'login' })
          return Promise.reject(response.data.msg)
        }).finally(() => {
          isRefreshing = false
        })
    } else {
      return new Promise(resolve => {
        // 用函数形式将 resolve 存入，等待刷新后再执行
        requests.push(token => {
          response.headers.Authorization = 'Bearer ' + `${token}`
          resolve(http(response.config))
        })
      })
    }
  } else if (response.data.code === 401) {
    clearLoginInfo()
    router.replace({ name: 'login' })
    return Promise.reject(response.data.msg)
  }
  return response
}, error => {
  console.error(error)
  return Promise.reject(error)
})

export default http
