import { fakeMobileLogin } from '../services/api';
import {
  signIn,
  signOut,
  brand,
  switchBrand,
} from '../services/user';
import { notification } from 'antd';
import Cookies from 'js-cookie';

export default {
  namespace: 'login',

  state: {
    status: undefined,
    signOutStatus: null,
    token: null,
    signIn: null,
    signMsg: null,
    brandList: [], // 品牌列表
    errorSwitchBrand: null, // 切换品牌的时候
  },

  effects: {
    // *accountSubmit({ payload }, { call, put }) {
    //   yield put({
    //     type: 'changeSubmitting',
    //     payload: true,
    //   });
    //   const response = yield call(fakeAccountLogin, payload);
    //   yield put({
    //     type: 'loginHandle',
    //     payload: response,
    //   });
    //   yield put({
    //     type: 'changeSubmitting',
    //     payload: false,
    //   });
    // },
    * accountSubmit({ payload, callback }, { call, put }) {
      const lang = Cookies.get('lang');
      yield put({
        type: 'changeSubmitting',
        payload: true,
      });
      const response = yield call(signIn, payload);
      if(response.status===200){
        yield put({
          type: 'global/setRolePower',
          payload: response.data.powerInfo,
        });
        if(!lang){
          if(response.data.powerInfo.role===1){
            yield put({
              type: 'global/setLanguage',
              payload: 'zh-cn',
            });
            Cookies.set('lang','zh-cn',{expires: 99999})
          }else {
            yield put({
              type: 'global/setLanguage',
              payload: 'en',
            });
            Cookies.set('lang','en',{expires: 99999})
          }
        }
      }
      if(callback){
        callback(response)
      }
      yield put({
        type: 'loginHandle',
        payload: {
          response,
          signIn: payload,
        },
      });
      yield put({
        type: 'changeSubmitting',
        payload: false,
      });
    },
    * mobileSubmit(_, { call, put }) {
      yield put({
        type: 'changeSubmitting',
        payload: true,
      });
      const response = yield call(fakeMobileLogin);
      yield put({
        type: 'loginHandle',
        payload: response,
      });
      yield put({
        type: 'changeSubmitting',
        payload: false,
      });
    },
    * logout({ payload, callback }, { call, put }) {
      const response = yield call(signOut, payload);

      if (response.status === 200) {
        // 退出登录的时候，删除商户列表，默认选择第一个。
        Cookies.remove('ELE_USERNAME_BRAND');
        Cookies.remove('ELE_JURISDICTION');
      }

      yield put({
        type: 'logoutHandle',
        payload: response,
      });
      if (callback) {
        callback();
      }
    },
    // 品牌列表-权限列表
    * brand({ payload, callback }, { call, put }) {
      const response = yield call(brand, payload);

      yield put({
        type: 'brandHandle',
        payload: response,
      });
      if (callback) {
        callback();
      }
    },
    // 切换品牌站-权限
    * switchBrand({ payload, callback }, { call, put }) {
      const response = yield call(switchBrand, payload);

      // if (response.status === 200) {
      //   notification.success({
      //     message: '温馨提示',
      //     description: '品牌切换成功',
      //   });
      //   window.location.reload();
      // }

      yield put({
        type: 'switchBrandHandle',
        payload: response,
      });
      if (callback) {
        callback(response);
      }
    },
  },

  reducers: {
    loginHandle(state, { payload }) {

      state.status = payload.response.status;
      state.type = payload.type;
      state.signMsg = payload.response.msg;
      if (payload.response.status === 200) {
        state.signIn = payload.signIn.account_no;
        state.token = payload.response.data.token;
      }
      return {
        ...state,
      };
    },
    // 品牌列表-权限列表
    brandHandle(state, { payload }) {
      if (!Cookies.get('ELE_USERNAME_BRAND')) {
        Cookies.set('ELE_USERNAME_BRAND', payload.data.sellerBrands[0].name, { expires: 30 });
      }
      if (!Cookies.get('ELE_JURISDICTION')) {
        Cookies.set('ELE_JURISDICTION', payload.data.sellerBrands[0], { expires: 30 });
      }

      return {
        ...state,
        brandList: payload.data.sellerBrands,
      };
    },
    // 切换品牌站-权限
    switchBrandHandle(state, { payload }) {
      return {
        ...state,
        errorSwitchBrand: payload.status,
      };
    },
    changeSubmitting(state, { payload }) {
      return {
        ...state,
        submitting: payload,
      };
    },
    logoutHandle(state, { payload }) {
      return {
        ...state,
        signOutStatus: payload.status,
      };
    },
    clear() {
      return {
        status: undefined,
        signOutStatus: null,
      };
    },
    clearSignMsg() {
      return {
        signMsg: null,
      };
    },
  },
};
