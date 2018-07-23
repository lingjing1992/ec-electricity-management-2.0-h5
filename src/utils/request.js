// import fetch from 'dva/fetch';
// import { notification } from 'antd';
// import { routerRedux } from 'dva/router';
// import store from '../index';
//
// const codeMessage = {
//   200: '服务器成功返回请求的数据。',
//   201: '新建或修改数据成功。',
//   202: '一个请求已经进入后台排队（异步任务）。',
//   204: '删除数据成功。',
//   400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
//   401: '用户没有权限（令牌、用户名、密码错误）。',
//   403: '用户得到授权，但是访问是被禁止的。',
//   404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
//   406: '请求的格式不可得。',
//   410: '请求的资源被永久删除，且不会再得到的。',
//   422: '当创建一个对象时，发生一个验证错误。',
//   500: '服务器发生错误，请检查服务器。',
//   502: '网关错误。',
//   503: '服务不可用，服务器暂时过载或维护。',
//   504: '网关超时。',
// };
// function checkStatus(response) {
//   if (response.status >= 200 && response.status < 300) {
//     return response;
//   }
//   const errortext = codeMessage[response.status] || response.statusText;
//   notification.error({
//     message: `请求错误 ${response.status}: ${response.url}`,
//     description: errortext,
//   });
//   const error = new Error(errortext);
//   error.name = response.status;
//   error.response = response;
//   throw error;
// }
//
// /**
//  * Requests a URL, returning a promise.
//  *
//  * @param  {string} url       The URL we want to request
//  * @param  {object} [options] The options we want to pass to "fetch"
//  * @return {object}           An object containing either "data" or "err"
//  */
// export default function request(url, options) {
//   const defaultOptions = {
//     credentials: 'include',
//   };
//   const newOptions = { ...defaultOptions, ...options };
//   if (
//     newOptions.method === 'POST' ||
//     newOptions.method === 'PUT' ||
//     newOptions.method === 'DELETE'
//   ) {
//     if (!(newOptions.body instanceof FormData)) {
//       newOptions.headers = {
//         Accept: 'application/json',
//         'Content-Type': 'application/json; charset=utf-8',
//         ...newOptions.headers,
//       };
//       newOptions.body = JSON.stringify(newOptions.body);
//     } else {
//       // newOptions.body is FormData
//       newOptions.headers = {
//         Accept: 'application/json',
//         ...newOptions.headers,
//       };
//     }
//   }
//
//   return fetch(url, newOptions)
//     .then(checkStatus)
//     .then(response => {
//       if (newOptions.method === 'DELETE' || response.status === 204) {
//         return response.text();
//       }
//       return response.json();
//     })
//     .catch(e => {
//       const { dispatch } = store;
//       const status = e.name;
//       if (status === 401) {
//         dispatch({
//           type: 'login/logout',
//         });
//         return;
//       }
//       if (status === 403) {
//         dispatch(routerRedux.push('/exception/403'));
//         return;
//       }
//       if (status <= 504 && status >= 500) {
//         dispatch(routerRedux.push('/exception/500'));
//         return;
//       }
//       if (status >= 404 && status < 422) {
//         dispatch(routerRedux.push('/exception/404'));
//       }
//     });
// }
import fetch from 'dva/fetch';
import { notification } from 'antd';
import { setApiHost, getQueryString } from './utils';
import Cookies from 'js-cookie';

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

const language = (window.navigator.browserLanguage || window.navigator.language).toLowerCase() === 'zh-cn' ? 'zh-cn' : 'en'
const lang = Cookies.get('lang') || language;
const errorTip = {
  'zh-cn' : {
    RequestError: '请求错误',
    ErrorCode: '错误代码'
  },
  'en' : {
    RequestError: 'Request Error',
    ErrorCode: 'Error Code'
  }
}
/**
 * 设置API接口
 * 说明：
 *  线上环境：
 *    域名：merchant.pearlgo.com
 *    API：i-merchant.pearlgo.com
 *    是有API[i-]开头，作为加速需求。
 *  测试环境
 *    域名：test.ecmc.batmobi.net
 *    API：test.ecmc.batmobi.net
 *  本地环境
 *    直接走代理。
 * @returns {*}
 */
// function setApiHost() {
//   const locationProtocol = '//';
//   const locationHost = window.location.host;
//   let apiHost = '';
//   switch (locationHost) {
//     case 'test.ecmc.batmobi.net':
//       apiHost = 'test.ecmc.batmobi.net';
//       break;
//     // case 'pro.ecmc.batmobi.net':
//     //   apiHost = 'testapi.ecmc.batmobi.net';
//     //   break;
//     case 'merchant.pearlgo.com':
//       apiHost = 'i-merchant.pearlgo.com';
//       break;
//     default:
//       return '';
//   }
//   return locationProtocol + apiHost;
// }
/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options) {
  const defaultOptions = {
    credentials: 'include',
  };
  const newOptions = { ...defaultOptions, ...options };
  if (newOptions.method === 'POST' || newOptions.method === 'PUT') {
    newOptions.headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      ...newOptions.headers,
    };
    newOptions.body = JSON.stringify(newOptions.body);
  }
  return fetch(setApiHost() + url, newOptions)
  // return fetch(url, newOptions)
    .then(checkStatus)
    // .then(response => response.json())
    .then((response) => {
      const json = response.json();
      json.then((data) => {
        if (data.status === 10001) {
          window.location.href = `//${window.location.host}/user/login`;
        }
        // console.log('location',window.location)
        // 登录页面也不出全局提示
        if (data.status !== 200 && location.pathname !== '/user/login') {
          notification.error({
            message: `${errorTip[lang].RequestError},${errorTip[lang].ErrorCode}${data.status}`,
            description: data.msg,
          });
        }
      });
      return json;
    })
    .catch((error) => {
      if (error.code) {
        notification.error({
          message: error.name,
          description: error.message,
        });
      }
      if ('stack' in error && 'message' in error) {
        notification.error({
          message: `${errorTip[lang].RequestError}: ${url}`,
          description: error.message,
        });
      }
      return error;
    });
}

