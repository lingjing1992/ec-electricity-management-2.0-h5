import {
  getMarketingSpus,
  create,
  spuDiscount,
} from '../services/market';

export default {
  namespace: 'marketCreate',

  state: {
    data: {},
    pushData: {
      filter: 1,
      keyword: '',
      page_num: 1,
      page_size: 20,
    },
    pushCreate: {},
    operationItem: {},
    // 优惠码
    spuDiscount: [],
  },

  effects: {
    * marketCreateGetMarketings({ payload }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(getMarketingSpus, payload);
      console.log('response', response);
      yield put({
        type: 'getMarketings',
        payload: {
          response,
        },
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    * marketCreateSpuDiscount({ payload }, { call, put }) {
      // yield put({
      //   type: 'changeLoading',
      //   payload: true,
      // });
      const response = yield call(spuDiscount, payload);
      console.log('response', response);
      yield put({
        type: 'spuDiscount',
        payload: {
          response,
        },
      });
      // yield put({
      //   type: 'changeLoading',
      //   payload: false,
      // });
    },
    // 过滤条件
    * marketCreatePushFilter({ payload, callback }, { put }) {
      yield put({
        type: 'pushFilter',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 关键字
    * marketCreatePushKeyword({ payload, callback }, { put }) {
      yield put({
        type: 'pushKeyword',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 每条页数
    * marketCreatePushShowSize({ payload, callback }, { put }) {
      yield put({
        type: 'pushShowSize',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 当前页码
    * marketCreatePushShowNum({ payload, callback }, { put }) {
      yield put({
        type: 'pushShowNum',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 新建营销任务
    * marketCreatePushCreate({ payload, callback }, { call, put }) {
      const response = yield call(create, payload);
      yield put({
        type: 'pushCreate',
        payload: {
          response,
        },
      });
      if (callback) {
        callback();
      }
    },
    // 列表item属性
    * marketCreateOperationItem({ payload, callback }, { put }) {
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
      console.log('action', action);
      return {
        ...state,
        data: action.payload.response.data,
      };
    },
    spuDiscount(state, action) {
      // console.log('action.payload.response.data.discounts', action.payload.response.data.discounts);
      return {
        ...state,
        spuDiscount: action.payload.response.data.discounts,
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
      console.log('pushKeyword',action);
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
    pushCreate(state, action) {
      console.log('action', action);
      // state.pushCreate.
      // state.pushCreate = action.payload.response.data.spuId;
      const resSpuId = action.payload.response.data.spu_id;
      const resSuccess = action.payload.response.status;
      state.data.spus.map((item) => {
        if ((item.spu_id === resSpuId) && (resSuccess === 200)) {
          item.isPush = true;
        }
        console.log('item', item);
        return true;
      });
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
        data: {},
        pushData: {
          filter: 1,
          keyword: '',
          page_num: 1,
          page_size: 20,
        },
      };
    },
  },
};
