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

// 是否正在刷新的标记 -- 防止重复发出刷新token接口--节流阀
let isRefreshing = false
// 失效后同时发送请求的容器 -- 缓存接口
let subscribers = []
// 刷新 token 后, 将缓存的接口重新请求一次
function onAccessTokenFetched (newToken) {
  subscribers.forEach((callback) => {
    callback(newToken)
  })
  // 清空缓存接口
  subscribers = []
}
// 添加缓存接口
function addSubscriber (callback) {
  subscribers.push(callback)
}

const dataForm = { refresh_token: '', grant_type: 'refresh_token', scope: 'openid' }
/**
 * 响应拦截
 */
http.interceptors.response.use(response => {
  if (response.data.code === 450) {
    debugger
    if (!isRefreshing) {
      debugger
      isRefreshing = true
      const { refresh } = store.state;
      dataForm.refresh_token = refresh
      console.log("reflash"+refresh);
      http.post('/oauth/token', dataForm, {
          headers: {
            "content-type": "application/x-www-form-urlencoded",
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
            onAccessTokenFetched(access_token)
          }
        }).catch(() => {
          clearLoginInfo()
          router.replace({ name: 'login' })
          return Promise.reject(response.data.msg)
        }).finally(() => {
          isRefreshing = false
        })
    }
    // 将其他接口缓存起来 
    const retryRequest = new Promise((resolve) => {
      // 返回Promise并且让其状态一直为等待状态,
      // 只有当token刷新成功后, 就会调用通过addSubscriber函数添加的缓存接口,
      // 此时, Promise的状态就会变成resolve
      addSubscriber((newToken) => {
        // 表示用新的token去替换掉原来的token
        response.config.headers.Authorization = 'Bearer ' + newToken
        // 用重新封装的config去请求, 就会将重新请求后的返回
        resolve(http(response.config))
      })
    })
    return retryRequest;
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
