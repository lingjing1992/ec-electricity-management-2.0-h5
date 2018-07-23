import { routerRedux } from 'dva/router';
import { notification } from 'antd';
import moment from 'moment';

import {
  bySpu,
} from '../services/data';

export default {
  namespace: 'dataGoodsSales',

  state: {
    data: {},
    pushData: {
      filter: 1,
      keyword: '',
      startDate: '',
      endDate: '',
      pageNum: 1,
      pageSize: 20,
    },
    // 缓存每一条的数据
    // couponItem: {},
    loading: true,
  },

  effects: {
    // 列表
    * dataGoodsSalesGetDataGoodsSales({ payload, callback }, { call, put }) {
      console.log('payload', payload);
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(bySpu, payload);
      // if (response.status === 10002) {
      //   yield put(routerRedux.push('/user/login'));
      // }
      console.log('response', response);
      yield put({
        type: 'getDataGoodsSales',
        payload: response,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
      if (callback) {
        callback();
      }
    },
    // 时间
    * dataGoodsSalesPushDealTime({ payload, callback }, { put }) {
      yield put({
        type: 'PushDealTime',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 关键字
    * dataGoodsSalesPushKeyword({ payload, callback }, { put }) {
      yield put({
        type: 'pushKeyword',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 过滤条件
    * dataGoodsSalesPushFilter({ payload, callback }, { put }) {
      yield put({
        type: 'pushFilter',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 每条页数
    * dataGoodsSalesPushShowSize({ payload, callback }, { put }) {
      yield put({
        type: 'pushShowSize',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 当前页码
    * dataGoodsSalesPushShowNum({ payload, callback }, { put }) {
      yield put({
        type: 'pushShowNum',
        payload,
      });
      if (callback) {
        callback();
      }
    },
  },
  reducers: {
    getDataGoodsSales(state, action) {
      // console.log('state=>---3333', state);
      return {
        ...state,
        data: action.payload.data,
      };
    },
    // 时间
    PushDealTime(state, action) {
      state.pushData.startDate = action.payload.startTime;
      state.pushData.endDate = action.payload.endTime;
      return {
        ...state,
      };
    },
    // 过滤条件
    pushFilter(state, action) {
      state.pushData.filter = parseInt(action.payload, 10);
      // console.log('2222');
      return {
        ...state,
      };
    },
    pushShowSize(state, action) {
      state.pushData.pageNum = action.payload.pageNum;
      state.pushData.pageSize = action.payload.pageSize;
      return {
        ...state,
      };
    },
    pushShowNum(state, action) {
      state.pushData.pageNum = action.payload.pageNum;
      return {
        ...state,
      };
    },
    pushKeyword(state, action) {
      console.log('pushKeyword', action);
      state.pushData.keyword = action.payload;
      return {
        ...state,
      };
    },
    getCouponItem(state, action) {
      console.log('couponItem', state, action);
      return {
        ...state,
        couponItem: action.payload,
      };
    },
    changeLoading(state, action) {
      return {
        ...state,
        loading: action.payload,
      };
    },
    clear() {
      return {
        data: {},
        pushData: {
          filter: 1,
          keyword: '',
          startDate: '',
          endDate: '',
          pageNum: 1,
          pageSize: 20,
        },
        // 缓存每一条的数据
        // couponItem: {},
        loading: true,
      };
    },
  },
};
