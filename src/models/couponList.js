import {routerRedux} from 'dva/router';
import {notification} from 'antd';

import {
  getDiscounts,
  createDiscount,
  updateExpireDate,
  updateEditProduct,
  deleteDiscount
} from '../services/coupon';

export default {
  namespace: 'couponList',

  state: {
    data: {},
    pushData: {
      disCodeSeller: '',
      pageNum: 1,
      pageSize: 20,
      orderBy: 0, // 0默认排序,1 佣金比例 2 库存,3 页面访问量,4成交数,5成交金额,6佣金成本
      sort: 0, // 0降序 1升序
      discountCodeType: 1,
    },
    // 缓存每一条的数据
    couponItem: {},
    loading: true,
  },

  effects: {
    // 获得优惠码列表
    * couponListGetDiscounts({payload, callback}, {call, put}) {
      console.log('payload', payload);
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(getDiscounts, payload);
      // if (response.status === 10002) {
      //   yield put(routerRedux.push('/user/login'));
      // }
      console.log('response', response);
      yield put({
        type: 'getDiscounts',
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
    //创建优惠码
    * couponListCreateDiscount({payload, callback}, {call, put, select}) {
      console.log('payload', payload);
      const languageDetails = yield select((store)=>{
        return store.global.languageDetails;
      })
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(createDiscount, payload);
      if (response.status === 200) {
        yield put(routerRedux.push('/marketing/couponList'));
        notification.success({
          message: languageDetails.message.KindlyReminder,
          description: languageDetails.message.Newpromo,
        });
      }
      console.log('response', response);
      yield put({
        type: 'createDiscount',
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
    //更新有效期
    * couponListUpdateExpireDate({payload, callback}, {call, put}) {
      console.log('payload', payload);
      const response = yield call(updateExpireDate, payload);
      yield put({
        type: 'updateExpireDate',
        payload: response,
      });
      if (callback) {
        callback();
      }
    },
    //更新编辑商品
    * couponListUpdateEditProduct({payload, callback}, {call, put}) {
      console.log('payload', payload);
      const response = yield call(updateEditProduct, payload);
      yield put({
        type: 'updateEditProduct',
        payload: response,
      });
      if (callback) {
        callback();
      }
    },

    // 关键字
    * couponListPushDisCodeSeller({payload, callback}, {put}) {
      yield put({
        type: 'pushDisCodeSeller',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 每条页数
    * couponListPushShowSize({payload, callback}, {put}) {
      yield put({
        type: 'pushShowSize',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 当前页码
    * couponListPushShowNum({payload, callback}, {put}) {
      yield put({
        type: 'pushShowNum',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    //删除优惠码
    * deleteDiscount({payload, callback}, {call, put}) {
      console.log('payload', payload);
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(deleteDiscount, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
  },
  reducers: {
    getDiscounts(state, action) {
      // console.log('state=>---3333', state);
      return {
        ...state,
        data: action.payload.data,
      };
    },
    pushShowSize(state, action) {
      state.pushData.pageNum = action.payload.pageNum;
      state.pushData.pageSize = action.payload.pageSize;
      return {
        ...state,
      };
    },
    updateExpireDate(state, action) {
      return {
        ...state,
        data: action.payload.data,
      };
    },
    updateEditProduct(state, action) {
      return {
        ...state,
        data: action.payload.data,
      };
    },
    pushShowNum(state, action) {
      state.pushData.pageNum = action.payload.pageNum;
      return {
        ...state,
      };
    },
    pushDisCodeSeller(state, action) {
      console.log('pushKeyword', action);
      state.pushData.disCodeSeller = action.payload;
      return {
        ...state,
      };
    },
    getCouponItem(state, action) {
      console.log('CouponItem', state, action);
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
    clear() {
      return {
        data: {},
        pushData: {
          disCodeSeller: '',
          pageNum: 1,
          pageSize: 20,
          orderBy: 0, // 0默认排序,1 佣金比例 2 库存,3 页面访问量,4成交数,5成交金额,6佣金成本
          sort: 0, // 0降序 1升序
          discountCodeType: 1,
        },
        // 缓存每一条的数据
        couponItem: {},
        loading: true,
      };
    },
  },
};
