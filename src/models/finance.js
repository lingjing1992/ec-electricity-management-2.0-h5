import { getSupplierTradeReport, updateSupplierTradeReport, downloadDetails, downloadSupplierStatement } from '../services/finance';

export default {
  namespace: 'finance',
  state:{
    loading: false,
    confirmLoading: false,
  },
  effects: {
    // 商品更改信息
    * getSupplierTradeReport({payload, callback}, {call, put}) {
      yield put({
        type   : 'changeLoading',
        payload: true,
      });
      const response = yield call(getSupplierTradeReport, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type   : 'changeLoading',
        payload: false,
      });
    },
    // 商品更改信息
    * updateSupplierTradeReport({payload, callback}, {call, put}) {
      yield put({
        type   : 'setConfirmLoading',
        payload: true,
      });
      const response = yield call(updateSupplierTradeReport, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type   : 'setConfirmLoading',
        payload: false,
      });
    },
    // 下载明细
    * downloadDetails({payload, callback}, {call, put}) {
      yield put({
        type   : 'changeLoading',
        payload: true,
      });
      const response = yield call(downloadDetails, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type   : 'changeLoading',
        payload: false,
      });
    },
    // 下载对账单
    * downloadSupplierStatement({payload, callback}, {call, put}) {
      yield put({
        type   : 'changeLoading',
        payload: true,
      });
      const response = yield call(downloadSupplierStatement, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type   : 'changeLoading',
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
    setConfirmLoading(state, action) {
      return {
        ...state,
        confirmLoading: action.payload,
      };
    },
  }
}
