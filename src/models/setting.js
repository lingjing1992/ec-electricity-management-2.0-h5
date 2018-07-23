import {
  getExchangeRate,
  setExchangeRate,
} from '../services/setting';

export default {
  namespace: 'setting',
  state:{
    loading: false,
  },
  effects: {
    // 列表
    * getExchangeRate({payload, callback}, {call, put}) {
      console.log('payload', payload);
      yield put({
        type   : 'changeLoading',
        payload: true,
      });
      const response = yield call(getExchangeRate, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type   : 'changeLoading',
        payload: false,
      });
    },
    // 设置
    * setExchangeRate({payload, callback}, {call, put}) {
      console.log('payload', payload);
      yield put({
        type   : 'changeLoading',
        payload: true,
      });
      const response = yield call(setExchangeRate, payload);
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
    changeLoading(state,action){
      return {
        ...state,
        loading: action.payload,
      };
    },
  }
}
