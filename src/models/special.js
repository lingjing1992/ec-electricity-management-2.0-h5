/**
 * Created by dell on 2018/2/7.
 */
import {
  getViewStyle,
  createUpdateTopicView,
  getSpuView,
  updateViewStatus,
  delSpuView,
  getTopicViewDetail
} from '../services/special';

import {
  getDiscountBriefSpuList
} from '../services/utils';

export default {
  namespace: 'special',
  
  state: {
    loading: false,
    spuLlists: {},
    spuLoading: false,
  },
  
  effects: {
    // 获取专题样式
    * getViewStyle({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(getViewStyle, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    // 创建更新专题
    * createUpdateTopicView({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(createUpdateTopicView, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    // 获取spu列表
    * getSpuView({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(getSpuView, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    // 更新页面状态
    * updateViewStatus({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(updateViewStatus, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    // 删除页面
    * delSpuView({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(delSpuView, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    // 获取专题详情
    * getTopicViewDetail({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(getTopicViewDetail, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    * getDiscountBriefSpuList({ payload, callback }, { call, put }){
      yield put({
        type: 'spuLoading',
        payload: true,
      });
      const response = yield call(getDiscountBriefSpuList, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type: 'spuLoading',
        payload: false,
      });
    },
    * getAllSpuList({ payload, callback }, { call, put }){
      yield put({
        type: 'spuLoading',
        payload: true,
      });
      const response = yield call(getDiscountBriefSpuList, payload);
      if(response.status === 200){
        yield put({
          type: 'setSpuLlists',
          payload: response.data,
        });
      }
      if (callback) {
        callback(response);
      }
      yield put({
        type: 'spuLoading',
        payload: false,
      });
    }
  },
  
  reducers: {
    setSpuLlists(state, action) {
      return {
        ...state,
        spuLlists: action.payload,
      }
    },
    changeLoading(state, action) {
      return {
        ...state,
        loading: action.payload,
      };
    },
    spuLoading(state, action) {
      return {
        ...state,
        spuLoading: action.payload,
      };
    },
  }
}