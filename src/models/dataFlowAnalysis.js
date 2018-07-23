import { routerRedux } from 'dva/router';
import { notification } from 'antd';
import moment from 'moment';
import {
  byUtmParams,
  getUtmSource,
} from '../services/data';

export default {
  namespace: 'dataFlowAnalysis',


  state: {
    data: {},
    pushData: {
      filter: 1,
      keyword: '',
      startDate: moment().subtract(6, 'days').format('YYYY-MM-DD'),
      endDate: moment().format('YYYY-MM-DD'),
      pageNum: 1,
      pageSize: 20,
      demension: 1, // 这个相当于Tabs类型
      utmSourceId: 0,
      orderBy: 0,
      sort: 0,
    },
    // 缓存每一条的数据
    // couponItem: {},
    loading: true,
    // 查询广告来源接口
    utmSources: [],
    // 筛选信息
    sortedInfo: null,
  },

  effects: {
    // 列表
    * dataFlowAnalysisGetDataFlowAnalysis({ payload, callback }, { call, put }) {
      console.log('payload', payload);
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(byUtmParams, payload);
      // if (response.status === 10002) {
      //   yield put(routerRedux.push('/user/login'));
      // }
      console.log('response', response);
      yield put({
        type: 'getDataFlowAnalysis',
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

    // 查询广告来源接口- 因为是数组
    * dataFlowAnalysisGetUtmSource({ payload, callback }, { call, put }) {
      console.log('payload', payload);
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(getUtmSource, payload);
      // if (response.status === 10002) {
      //   yield put(routerRedux.push('/user/login'));
      // }
      console.log('response', response);
      yield put({
        type: 'getUtmSource',
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
    * dataFlowAnalysisPushDealTime({ payload, callback }, { put }) {
      yield put({
        type: 'PushDealTime',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 来源
    * dataFlowAnalysisPushUtmSource({ payload, callback }, { put }) {
      yield put({
        type: 'pushUtmSource',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 关键字
    * dataFlowAnalysisPushKeyword({ payload, callback }, { put }) {
      yield put({
        type: 'pushKeyword',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 过滤条件
    * dataFlowAnalysisPushFilter({ payload, callback }, { put }) {
      yield put({
        type: 'pushFilter',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 每条页数
    * dataFlowAnalysisPushShowSize({ payload, callback }, { put }) {
      yield put({
        type: 'pushShowSize',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 当前页码
    * dataFlowAnalysisPushShowNum({ payload, callback }, { put }) {
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
    getDataFlowAnalysis(state, action) {
      // console.log('state=>---3333', state);
      return {
        ...state,
        data: action.payload.data,
      };
    },
    getUtmSource(state, action) {
      // console.log('state=>---3333', state);
      return {
        ...state,
        utmSources: action.payload.data.utmSources,
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
    // 来源
    pushUtmSource(state, action) {
      console.log('来源',action)
      state.pushData.utmSourceId = action.payload;
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
    changeSortOrder(state, action) {
      return {
        ...state,
        sortedInfo: action.payload.sortedInfo,
      };
    },
    clear() {
      return {
        data: {},
        pushData: {
          filter: 1,
          keyword: '',
          startDate: moment().subtract(6, 'days').format('YYYY-MM-DD'),
          endDate: moment().format('YYYY-MM-DD'),
          pageNum: 1,
          pageSize: 20,
          demension: 1,
          utmSourceId: 0,
          orderBy: 0,
          sort: 0,
        },
        // 缓存每一条的数据
        // couponItem: {},
        loading: true,
        // 查询广告来源接口
        utmSources: [],
        // 筛选信息
        sortedInfo: null,
      };
    },
  },
};
