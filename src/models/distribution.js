import {
  getDistributionSpuDetail,
  applyDistributionSpu,
  supplierChanges,
  syncSupplierChange,
  common,
  home,
  getDistributionSpus,
  getActivity
} from '../services/distribution';

export default {
  namespace: 'distribution',
  state:{
    loading: false,
    popLoading: false,
    //管理搜索条件状态
    searchData: {
      filter: 1,
      keyword: null,
      pageNum: 1,
      pageSize: 20,
      categoryId: null,
      rankType: null,
      sort: -1,
      orderBy: -1,
      status: null,
      supplyPriceSection: {
        min: null,
        max: null
      },
      referencePriceSection: {
        min: null,
        max: null
      }
    },
    // 初始搜索条件，用于重置搜索条件
    defSearchData: {
      filter: 1,
      keyword: null,
      pageNum: 1,
      pageSize: 20,
      categoryId: null,
      rankType: null,
      sort: null,
      orderBy: -1,
      status: null,
      supplyPriceSection: {
        min: null,
        max: null
      },
      referencePriceSection: {
        min: null,
        max: null
      }
    },
    //头部数据，包括类别
    headerData: {

    },
  },
  effects: {
    * getDistributionSpuDetail({payload, callback}, {call, put}) {

      yield put({
        type   : 'changePopLoading',
        payload: true,
      });
      const response = yield call(getDistributionSpuDetail, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type   : 'changePopLoading',
        payload: false,
      });
    },
    * applyDistributionSpu({payload, callback}, {call, put}) {

      yield put({
        type   : 'changePopLoading',
        payload: true,
      });
      const response = yield call(applyDistributionSpu, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type   : 'changePopLoading',
        payload: false,
      });
    },
    // 商品更改信息
    * supplierChanges({payload, callback}, {call, put}) {

      yield put({
        type   : 'changeLoading',
        payload: true,
      });
      const response = yield call(supplierChanges, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type   : 'changeLoading',
        payload: false,
      });
    },
    // 同步商品信息
    * syncSupplierChange({payload, callback}, {call, put}) {

      yield put({
        type   : 'changeLoading',
        payload: true,
      });
      const response = yield call(syncSupplierChange, payload);
      if (callback) {
        callback(response);
      }
    },
    // // 更新分销搜索条件
    // * changeSearchData({payload, callback}, {call, put}) {
    //   yield put({
    //     type   : 'changesearchData',
    //     payload: payload
    //   });
    // },
    // 分销搜索
    * getDistributionSpus({payload, callback}, {call, put}) {

      yield put({
        type   : 'changeLoading',
        payload: true,
      });
      const response = yield call(getDistributionSpus, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type   : 'changeLoading',
        payload: false,
      });
    },
    // 分销首页  公共数据接口
    * common({payload, callback}, {call, put, select}) {
      let response;
      const headerData = yield select((store)=>{
        return store.distribution.headerData;
      })
      if(!headerData.hasOwnProperty('hotWords')){
        yield put({
          type   : 'changeLoading',
          payload: true,
        });
        response = yield call(common, payload);
        yield put({
          type   : 'setHeaderData',
          payload: response.data,
        });
        yield put({
          type   : 'changeLoading',
          payload: false,
        });
      }
      if (callback) {
        callback();
      }
    },
    // 分销首页  栏目数据接口
    * home({payload, callback}, {call, put}) {
      yield put({
        type   : 'changeLoading',
        payload: true,
      });
      const response = yield call(home, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type   : 'changeLoading',
        payload: false,
      });
    },
    // 分销  活动专题详情接口
    * getActivity({payload, callback}, {call, put}) {

      yield put({
        type   : 'changeLoading',
        payload: true,
      });
      const response = yield call(getActivity, payload);
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
    changePopLoading(state, action) {
      return {
        ...state,
        popLoading: action.payload,
      };
    },
    changeSearchData (state, action) {
      return {
        ...state,
        searchData: {
          ...state.searchData,
          ...action.payload
        }
      }
    },
    setHeaderData (state, action){
      return {
        ...state,
        headerData: action.payload,
      }
    }
  }

}
