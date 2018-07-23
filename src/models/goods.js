// export default {
//   namespace: 'goods',
//   state: {},
//   reducers: {},
//   effects: {},
//   subscriptions: {},
// };

import { notification } from 'antd';
// import { routerRedux } from 'dva/router';
import {
  list,
  Auditing,
  skuProperty,
  updateSpuStatus,
  downloadSpuInfo,
  getSpusSuppliers
} from '../services/goods';


export default {
  namespace: 'goods',

  state: {
    loading: false,
    data: {},
    operationItem: {
      skus: [],
    },
    pushData: {
      filter: 1,
      page_num: 1,
      page_size: 20,
      tab_id: 4,
      supplierId: 0,
    },
    // 属性值
    skuPropertyList: [],
  },

  effects: {
    // 列表
    * goodsGetList({ payload, callback }, { call, put }) {
      console.log('payload', payload);
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(list, payload);
      // if (response.status === 10002) {
      //   yield put(routerRedux.push('/user/login'));
      // }
      console.log('response', response);
      yield put({
        type: 'goodsList',
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
    // tabsId
    * goodsPushTabId({ payload, callback }, { put }) {
      yield put({
        type: 'pushTabId',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 过滤条件
    * goodsPushFilter({ payload, callback }, { put }) {
      yield put({
        type: 'pushFilter',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 关键字
    * goodsPushKeyword({ payload, callback }, { put }) {
      yield put({
        type: 'pushKeyword',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 每条页数
    * goodsPushShowSize({ payload, callback }, { put }) {
      yield put({
        type: 'pushShowSize',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 当前页码
    * goodsPushShowNum({ payload, callback }, { put }) {
      yield put({
        type: 'pushShowNum',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 列表item属性
    * goodsOperationItem({ payload, callback }, { put }) {
      console.log('goodsOperationItem', payload);
      yield put({
        type: 'operationItem',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 审核
    * goodsPushAuditing({ payload, callback }, { call, put }) {
      const response = yield call(Auditing, payload);
      yield put({
        type: 'pushAuditing',
        payload: response,
      });
      if (callback) {
        callback();
      }
    },
    // sku 属性值
    * goodsPushSkuProperty({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      })
      const response = yield call(skuProperty, payload);
      yield put({
        type: 'skuProperty',
        payload: response,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      })
      if (callback) {
        callback();
      }
    },
    // 上架下架
    * goodsPushUpdateSpuStatus({ payload, callback }, { call, put }) {
      const response = yield call(updateSpuStatus, payload);
      console.log('response', payload);
      yield put({
        type: 'updateSpuStatus',
        payload: response,
      });
      if (callback) {
        callback();
      }
    },
    // 导出商品
    * downloadSpuInfo({ payload, callback }, { call }){
      const response = yield call(downloadSpuInfo, payload);
      callback(response);
    },
    // 供应商列表接口
    * getSpusSuppliers({ payload, callback }, { call }) {
      const response = yield call(getSpusSuppliers, payload);
      if (callback) {
        callback(response);
      }
    },
  },

  reducers: {
    goodsList(state, action) {
      // console.log('state=>---3333', state);
      return {
        ...state,
        data: action.payload.data,
      };
    },
    pushAuditing(state) {
      return {
        ...state,
      };
    },
    updateSpuStatus(state, action) {
      console.log('上架下架', action);
      return {
        ...state,
      };
    },
    skuProperty(state, action) {
      console.log('a', action);
      return {
        ...state,
        skuPropertyList: action.payload.data.properties,
      };
    },
    pushTabId(state, action) {
      state.pushData.tab_id = parseInt(action.payload, 10);
      state.pushData.page_num = 1;
      state.pushData.page_size = 20;
      // console.log('2222');
      return {
        ...state,
      };
    },
    pushFilter(state, action) {
      state.pushData.filter = parseInt(action.payload, 10);
      // console.log('2222');
      return {
        ...state,
      };
    },
    pushSupplierId(state, action) {
      state.pushData.supplierId = parseInt(action.payload, 10);
      // console.log('2222');
      return {
        ...state,
      };
    },
    pushKeyword(state, action) {
      state.pushData.keyword = action.payload;
      return {
        ...state,
      };
    },
    pushShowSize(state, action) {
      state.pushData.page_num = action.payload.page_num;
      state.pushData.page_size = action.payload.page_size;
      return {
        ...state,
      };
    },
    pushShowNum(state, action) {
      state.pushData.page_num = action.payload.page_num;
      return {
        ...state,
      };
    },
    operationItem(state, action) {
      console.log('operationItem-redux', action);
      return {
        ...state,
        operationItem: action.payload,
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
        loading: true,
        data: {},
        operationItem: {
          skus: [],
        },
        pushData: {
          filter: 1,
          page_num: 1,
          page_size: 20,
          tab_id: 4,
          supplierId: 0,
        },
        // 属性值
        skuPropertyList: [],
      };
    },
  },
};
