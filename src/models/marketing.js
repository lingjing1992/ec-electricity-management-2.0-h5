import {
  getMarketings,
  update,
  getDiscountBriefSpuList
} from '../services/market';

export default {
  namespace: 'marketing',

  state: {
    loading: true,
    data: {},
    pushData: {
      filter: 1,
      keyword: '',
      page_num: 1,
      page_size: 20,
      startTime: '',
      endTime: '',
      order_by: 0, // 0默认排序,1 佣金比例 2 库存,3 页面访问量,4成交数,5成交金额,6佣金成本
      sort: 0, // 0降序 1升序
    },
    operationItem: {},
  },

  effects: {
    //SPU搜索插件查询接口
    * getDiscountBriefSpuList({payload, callback}, {call, put}) {
      const response = yield call(getDiscountBriefSpuList, payload);
      if (callback) {
        callback(response);
      }
    },
    * marketingGetMarketings({ payload }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(getMarketings, payload);
      console.log('response', response);
      yield put({
        type: 'getMarketings',
        payload: {
          response,
          resquest: payload,
        },
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    // 过滤条件
    * marketingPushFilter({ payload, callback }, { put }) {
      yield put({
        type: 'pushFilter',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 关键字
    * marketingPushKeyword({ payload, callback }, { put }) {
      yield put({
        type: 'pushKeyword',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 成交时间
    * marketingPushDealTime({ payload, callback }, { put }) {
      yield put({
        type: 'PushDealTime',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 每条页数
    * marketingPushShowSize({ payload, callback }, { put }) {
      yield put({
        type: 'pushShowSize',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 当前页码
    * marketingPushShowNum({ payload, callback }, { put }) {
      yield put({
        type: 'pushShowNum',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 新建营销任务
    * marketingPushUpdate({ payload, callback }, { call, put }) {
      const response = yield call(update, payload);
      yield put({
        type: 'pushUpdate',
        payload: {
          response,
        },
      });
      if (callback) {
        callback();
      }
    },
    // 列表item属性
    * marketingOperationItem({ payload, callback }, { put }) {
      console.log('marketingOperationItem', payload);
      yield put({
        type: 'operationItem',
        payload,
      });
      if (callback) {
        callback();
      }
    },
  },
  reducers: {
    getMarketings(state, action) {
      console.log('getMarketings', action);
      console.log('state', state);
      state.pushData.order_by = action.payload.resquest.order_by;
      state.pushData.sort = action.payload.resquest.sort;
      return {
        ...state,
        data: action.payload.response.data,
      };
    },
    pushFilter(state, action) {
      state.pushData.filter = parseInt(action.payload, 10);
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
    PushDealTime(state, action) {
      state.pushData.startTime = action.payload.startTime;
      state.pushData.endTime = action.payload.endTime;
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
    pushUpdate(state) {
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
        pushData: {
          filter: 1,
          keyword: '',
          page_num: 1,
          page_size: 20,
          startTime: '',
          endTime: '',
        },
        operationItem: {},
      };
    },
  },
};
