import { getSummaryInfo, getNoticeQuery, noticeUpdate } from '../services/notice';
import {message} from 'antd';
export default {
  namespace: 'notice',

  state: {
    loading: false,
    noticeResoureData: {
      normalNotice:[],
      orderNotice: [],
    },
    noticeTargetData: [],
    type:2,//1:公告 2订单
    isUpdate: false,
  },

  effects: {
    // 获取通知中心数据
    * getNoticeQuery({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(getNoticeQuery, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    // 更新通知中心数据
    * noticeUpdate({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(noticeUpdate, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    // 导航栏概要通知接口
    * getSummaryInfo({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(getSummaryInfo, payload);
      let summaryInfo = {};
      if(response && response.status === 200){
        summaryInfo = response.data;
        //本地存储
        window.localStorage.setItem('summaryInfo', JSON.stringify(summaryInfo));
      }else {
        //获取本地数据
        summaryInfo = window.localStorage.getItem('summaryInfo') ? JSON.parse(window.localStorage.getItem('summaryInfo')) : {};
      }
      yield put({
        type: 'noticeDataSolve',
        payload: summaryInfo,
      });
      if (callback) {
        callback(summaryInfo);
      }
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    // 清空通知栏
    * noticeClear({ payload, callback }, { call, put }) {
//      yield put({
//        type: 'setNoticeResoureData',
//        payload: payload,
//      });
//      yield put({
//        type: 'noticeDataSolve',
//        payload: null,
//      });
//      yield put({
//        type: 'setIsUpdate',
//        payload: true,
//      });
//      message.success(`清空了${payload.tabTitle}`);
//      return;
      const response = yield call(noticeUpdate, {
        ids: payload.ids,
      });
      if(response && response.status===200){
        yield put({
          type: 'setNoticeResoureData',
          payload: payload,
        });
        yield put({
          type: 'noticeDataSolve',
          payload: null,
        });
        yield put({
          type: 'setIsUpdate',
          payload: true,
        });

        if(callback){
          callback(payload);
        }
      }
    }
  },

  reducers: {
    changeLoading(state, action) {
      return {
        ...state,
        loading: action.payload,
      };
    },
    noticeDataSolve(state, action) {
      const noticeResoureData = action.payload || state.noticeResoureData;
      let noticeTargetData = Object.keys(noticeResoureData).reduce((key1,key2)=> {
        return noticeResoureData[key1].concat(noticeResoureData[key2]);
      }).map((item)=>{
        item.datetime = item.dateTime;
        return item;
      })
      return {
        ...state,
        noticeResoureData: noticeResoureData,
        noticeTargetData: noticeTargetData
      };
    },
    setNoticeResoureData(state,action) {
      state.noticeResoureData[action.payload.key] = [];
      return {
        ...state,
        noticeResoureData: state.noticeResoureData,
      };
    },
    setType(state,action) {
      return {
        ...state,
        type: parseInt(action.payload)
      }
    },
    setIsUpdate(state,action) {
      return {
        ...state,
        isUpdate: action.payload
      }
    }
  },
};
