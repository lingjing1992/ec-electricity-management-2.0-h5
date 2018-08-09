import { queryNotices } from '../services/api';
import { getRolePower, getUpgradeStatus } from '../services/utils';
import language from '../language/language';

export default {
  namespace: 'global',

  state: {
    collapsed: false,
    notices: [],
    fetchingNotices: false,
    rolePower:{},
    language: 'zh-cn',//'zh':简体中文，'en':英文,
    languageDetails: language['zh-cn'],
    contentWidth: 947,
    systemUpdate: {
      isUpdate: false,
      pathname: '/',
    }
  },

  effects: {
    *fetchNotices(_, { call, put }) {
      yield put({
        type: 'changeNoticeLoading',
        payload: true,
      });
      const data = yield call(queryNotices);
      yield put({
        type: 'saveNotices',
        payload: data,
      });
    },
    *clearNotices({ payload }, { put, select }) {
      const count = yield select(state => state.global.notices.length);
      yield put({
        type: 'user/changeNotifyCount',
        payload: count,
      });

      yield put({
        type: 'saveClearedNotices',
        payload,
      });
    },
    *rolePower({ payload, callback }, { call, put }) {
      const response = yield call(getRolePower,payload);
      let powerInfo = {};
      if(response.status === 200){
        powerInfo = response.data.powerInfo;
        //本地存储权限
        window.localStorage.setItem('powerInfo', JSON.stringify(response.data.powerInfo));
      }else {
        //获取本地权限
        powerInfo = window.localStorage.getItem('powerInfo') ? JSON.parse(window.localStorage.getItem('powerInfo')) : {};
      }
      yield put({
        type:'setRolePower',
        payload: powerInfo,
      })
      if(callback){
        callback(powerInfo);
      }
    },
   *getUpgradeStatus({ payload, callback }, { call, put }) {
     const response = yield call(getUpgradeStatus,payload);
     if(callback){
       callback(response);
     }
   }
  },

  reducers: {
    changeLayoutCollapsed(state, { payload }) {
      return {
        ...state,
        collapsed: payload,
      };
    },
    saveNotices(state, { payload }) {
      return {
        ...state,
        notices: payload,
        fetchingNotices: false,
      };
    },
    saveClearedNotices(state, { payload }) {
      return {
        ...state,
        notices: state.notices.filter(item => item.type !== payload),
      };
    },
    changeNoticeLoading(state, { payload }) {
      return {
        ...state,
        fetchingNotices: payload,
      };
    },
    setRolePower(state, { payload }) {
      return {
        ...state,
        rolePower: payload,
      };
    },
    setLanguage(state, { payload }){
      return {
        ...state,
        language: payload,
        languageDetails: language[payload],
      }
    },
    setContentWidth(state,{payload}){
      return {
        ...state,
        contentWidth: payload
      }
    },
    setSystemUpdate(state,{payload}){
      return {
        ...state,
        systemUpdate: Object.assign(state.systemUpdate,payload)
      }
    }
  },
};
