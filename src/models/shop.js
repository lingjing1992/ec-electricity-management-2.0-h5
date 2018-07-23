import {
  createUpdateSpuView,
  getSpuView,
  getSpuViewDetail,
  delSpuView,
  templateDetail,
  updateTemplate,
  templateList,
  useTemplate,
  saveOrUpdateBackAddr,
  getBackAddr
} from '../services/shop';

import {
  getLanguage
} from '../services/utils';

export default {
  namespace: 'shop',
  state:{
    loading: false,
    bannerLoading: false,//banner上传动画控制
    storeLogoLoing: false,//店铺logo上传动画控制
    language:[],
  },
  effects: {
    // 列表
    * getSpuView({payload, callback}, {call, put}) {
      yield put({
        type   : 'changeLoading',
        payload: true,
      });
      const response = yield call(getSpuView, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type   : 'changeLoading',
        payload: false,
      });
    },
    // 创建和更新
    * createUpdateSpuView({payload, callback}, {call, put}) {
      yield put({
        type   : 'changeLoading',
        payload: true,
      });
      const response = yield call(createUpdateSpuView, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type   : 'changeLoading',
        payload: false,
      });
    },
    // 删除页面
    * delSpuView({payload, callback}, {call, put}) {
      yield put({
        type   : 'changeLoading',
        payload: true,
      });
      const response = yield call(delSpuView, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type   : 'changeLoading',
        payload: false,
      });
    },
    // 获取语言
    * getSpuViewDetail({payload, callback}, {call, put}) {
      yield put({
        type   : 'changeLoading',
        payload: true,
      });
      const response = yield call(getSpuViewDetail, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type   : 'changeLoading',
        payload: false,
      });
    },

    // 获取语言
    * getLanguage({payload, callback}, {call, put}) {
      const response = yield call(getLanguage, payload);
      yield put({
        type   : 'setLanguage',
        payload: response.data ? response.data.language : [],
      });
      if (callback) {
        callback(response);
      }
    },

    //获取模板列表
    * templateList({payload, callback}, {call, put}) {
      const response = yield call(templateList, payload)
      if (callback) {
        callback(response);
      }
    },
    //获取模板详情
    * templateDetail({payload, callback}, {call, put}) {
      const response = yield call(templateDetail, payload)
      if (callback) {
        callback(response);
      }
    },

    //保存模板
    * updateTemplate({payload, callback}, {call, put}) {
      const response = yield call(updateTemplate, payload)
      if (callback) {
        callback(response);
      }
    },

    //使用模板
    * useTemplate({payload, callback}, {call, put}) {
      const response = yield call(useTemplate, payload)
      if (callback) {
        callback(response);
      }
    },

    // 保存&更新退货地址
    * saveOrUpdateBackAddr({payload, callback}, {call, put}) {
      yield put({
        type   : 'changeLoading',
        payload: true,
      });
      const response = yield call(saveOrUpdateBackAddr, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type   : 'changeLoading',
        payload: false,
      });
    },

    // 获取退货地址接口
    * getBackAddr({payload, callback}, {call, put}) {
      yield put({
        type   : 'changeLoading',
        payload: true,
      });
      const response = yield call(getBackAddr, payload);
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
    changeBannerLoading(state,action){
      return {
        ...state,
        bannerLoading: action.payload,
      };
    },
    changeStoreLogoLoing(state,action){
      return {
        ...state,
        storeLogoLoing: action.payload,
      };
    },
    setLanguage(state,action){
      return {
        ...state,
        language: action.payload,
      };
    }
  }
}
