
import fetch from 'dva/fetch';
import { notification } from 'antd';
import { setApiHost, getQueryString } from './utils';
import { routerRedux, } from 'dva/router';
import store from '../index';
import Cookies from 'js-cookie';
import { setAuthority } from '../utils/authority';
import { reloadAuthorized } from '../utils/Authorized';

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

function toUpdate() {
  const { dispatch, getState } = store;
  const isUpdate = getState().global.systemUpdate.isUpdate;
  if(!isUpdate){
    dispatch({
      type:'global/setSystemUpdate',
      payload: {
        isUpdate: true,
        pathname: `${window.location.pathname}${window.location.search}`
      }
    })
    dispatch(routerRedux.push('/update'));
  }
  console.log(store)
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
export default function request(url, options) {
  //如果正在升级则取消其他请求
  const { getState, dispatch } = store;
  const isUpdate = getState().global.systemUpdate.isUpdate;
  if(isUpdate){
    dispatch(routerRedux.replace('/update'))
    return;
  }
  //请求处理
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
      // const { dispatch } = store;
      const json = response.json();
      // console.log(window.location.pathname)

      json.then((data) => {
        if (data.status === 10001) {
          window.location.href = `//${window.location.host}/user/login`;
        }
        // console.log('location',window.location)
        // 登录页面也不出全局提示
        if (data.status !== 200) {
          notification.error({
            message: `${errorTip[lang].RequestError},${errorTip[lang].ErrorCode}${data.status}`,
            description: data.msg,
          });
          if(location.pathname !== '/user/login' && data.status === 502){
            toUpdate();
          }
        }
      });
      return json;
    })
    .catch((error) => {
      const { dispatch } = store;
      const status = error.name;
      // if (error.code) {
      //   notification.error({
      //     message: error.name,
      //     description: error.message,
      //   });
      // }
      // if ('stack' in error && 'message' in error) {
      //   notification.error({
      //     message: `${errorTip[lang].RequestError}: ${url}`,
      //     description: error.message,
      //   });
      // }
      if(status === 404){
        toUpdate();
      }
      return error;
    });
}

