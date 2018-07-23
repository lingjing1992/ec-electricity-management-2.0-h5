import { supplierBaseInfo, sellerBaseInfo } from '../services/dashboard';

export default {
  namespace: 'dashboard',

  state: {
    list: [],
    loading: false
  },

  effects: {
    *supplier({payload, callback}, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(supplierBaseInfo);
      callback && callback (response)
      yield put({
        type: 'changeLoading',
        payload: false,
      });
      
    },
    *seller({payload, callback}, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(sellerBaseInfo);
      callback && callback (response)
      yield put({
        type: 'changeLoading',
        payload: false,
      });
      
    },
  },

  reducers: {
    changeLoading(state, action) {
      return {
        ...state,
        loading: action.payload,
      };
    },
  },
};
