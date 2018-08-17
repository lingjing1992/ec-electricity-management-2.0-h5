import {
  orderLists,
  orderSellers,
  orderGetLocals,
  getPayTypes,
  updateSpuStatus,
  getOrderDetail,
  updateOrderAddress,
  getLocals,
  getShippingNames,
  updateSubOrderStatus,
  downloadOrders,
  getOrderSourceType,
  modifyOrderSub,
  getOrderRecord,
  modifyOrderGoods,
  updateRisk,
  getOrderShippingNo,
  updateShippingNo,
  downloadOrdersType
} from '../services/orders';
import {getQueryString} from '../utils/utils';
import {notification} from 'antd';

export default {
  namespace: 'orders',

  state: {
    loading: true,
    data: {},
    pushData: {
      tab_id: -1,
      filter: 1,
      page_num: 1,
      page_size: 20,
      keyword: '',
      pay_type: 0,
      start_time: '',
      end_time: '',
      supplier: 0,
      seller: 0,
      country: '',
      sourceType: 0, // 订单来源
    },
    // 订单搜索-供应商
    orderFupplier: '',
    // 订单搜索-商家
    orderSellers: '',
    // 订单搜索-国家
    orderLocalsData: '',
    // 订单搜索-支付方式
    orderpayTypes: '',
    // 国家列表
    countryList: [],
    // 详情
    orderDetail: {},
    // 详情item
    orderDetailItem: {},
    // 详情-日志
    orderDetailLog: [],
    // 物流列表
    logisticsList: [],
    // getProvinceList
    reviewProvinceList: null,
    // 订单搜索条件-来源类型列表接口 v1.3
    orderSourceTypeList: [],

    // 订单修改商品
    modifyOrderGoods: {
      original_info: {}, // 原sku信息
      others_info: [], // 同价格sku信息
    },
    ordersType: [],//导出订单类型
  },

  effects: {
    * orderGetOrderFupplier({payload, callback}, {call, put}) {
      const response = yield call(orderSellers, payload);
      yield put({
        type: 'getOrderFupplier',
        payload: response,
      });
      if (callback) {
        callback();
      }
    },
    * orderGetOrderSellers({payload, callback}, {call, put}) {
      const response = yield call(orderSellers, payload);
      yield put({
        type: 'getOrderSellers',
        payload: response,
      });
      if (callback) {
        callback();
      }
    },
    * orderGetLocals({payload, callback}, {call, put}) {
      const response = yield call(orderGetLocals, payload);
      yield put({
        type: 'orderLocals',
        payload: response,
      });
      if (callback) {
        callback();
      }
    },
    * orderGetPayTypes({payload, callback}, {call, put}) {
      const response = yield call(getPayTypes, payload);
      yield put({
        type: 'getPayTypes',
        payload: response,
      });
      if (callback) {
        callback();
      }
    },
    * orderGetList({payload, callback}, {call, put}) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(orderLists, payload);
      yield put({
        type: 'getList',
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
    * orderInitPage({payload, callback}, {put}) {
      yield put({
        type: 'initPage',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    * orderOperationItem({payload, callback}, {put}) {
      yield put({
        type: 'operationItem',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    * orderPushTabId({payload, callback}, {put}) {
      yield put({
        type: 'pushTabId',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    * orderPushFilter({payload, callback}, {put}) {
      yield put({
        type: 'pushFilter',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    * orderPushKeyword({payload, callback}, {put}) {
      yield put({
        type: 'pushKeyword',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    * orderPushShowSize({payload, callback}, {put}) {
      yield put({
        type: 'pushShowSize',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    * orderPushShowNum({payload, callback}, {put}) {
      yield put({
        type: 'pushShowNum',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    * orderPushSeller({payload, callback}, {put}) {
      yield put({
        type: 'pushSeller',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    * orderPushFupplier({payload, callback}, {put}) {
      yield put({
        type: 'pushFupplier',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    * orderPushSourceType({payload, callback}, {put}) {
      yield put({
        type: 'pushSourceType',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    * orderPushPayType({payload, callback}, {put}) {
      yield put({
        type: 'pushPayType',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    * orderPushLocal({payload, callback}, {put}) {
      yield put({
        type: 'pushLocal',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    * orderPushStartTime({payload, callback}, {put}) {
      yield put({
        type: 'pushStartTime',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    * orderPushEndTime({payload, callback}, {put}) {
      yield put({
        type: 'pushEndTime',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 修改主订单状态接口
    * orderPushUpdateSpuStatus({payload, callback}, {call, put}) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(updateSpuStatus, payload);
      yield put({
        type: 'updateSpuStatus',
        payload: response,
      });
      if (callback) {
        callback(response);
      }
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    // 详情 v1.4
    * orderPushGetOrderDetail({payload, callback}, {call, put}) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(getOrderDetail, payload);
      yield put({
        type: 'getOrderDetail',
        payload: response,
      });
      if (callback) {
        callback(response);
      }
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    // 订单详情-日志  v1.4
    * orderPushGetOrderRecord({payload, callback}, {call, put}) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(getOrderRecord, payload);
      yield put({
        type: 'getOrderRecord',
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
    // 订单详情-修改商品获取数据  v1.4
    * orderPushModifyOrderGoods({payload, callback}, {call, put}) {
      // yield put({
      //   type: 'changeLoading',
      //   payload: true,
      // });
      const response = yield call(modifyOrderGoods, payload);
      yield put({
        type: 'modifyOrderGoods',
        payload: response,
      });
      // yield put({
      //   type: 'changeLoading',
      //   payload: false,
      // });
      if (callback) {
        callback();
      }
    },
    // 退款申请  v1.4
    * orderPushModifyOrderSub({payload, callback}, {call, put, select}) {
      const languageDetails = yield select((store) => {
        return store.global.languageDetails;
      })
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(modifyOrderSub, payload);
      // 1-换货,2-退款
      if (response.status === 200) {
        if (payload.operation === 1) {
          notification.success({
            message: languageDetails.message.KindlyReminder,
            description: languageDetails.message.Productchanged,
          });
        } else if (payload.operation === 2) {
          notification.success({
            message: languageDetails.message.KindlyReminder,
            description: languageDetails.message.RefundedSuccessfully,
          });
        }
      }
      yield put({
        type: 'modifyOrderSub',
        payload: {
          response,
          payload,
        },
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
      if (callback) {
        callback();
      }
    },
    // 修改订单收货信息接口
    * orderPushUpdateOrderAddress({payload, callback}, {call, put}) {
      const response = yield call(updateOrderAddress, payload);
      yield put({
        type: 'updateOrderAddress',
        payload: response,
      });
      if (callback) {
        callback();
      }
    },
    // 获取国家列表
    * orderPushGetLocals({payload, callback}, {call, put}) {
      const response = yield call(getLocals, payload);
      yield put({
        type: 'getLocals',
        payload: response,
      });
      if (callback) {
        callback();
      }
    },
    // 获取物流公司接口
    * orderPushGetShippingNames({payload, callback}, {call, put}) {
      const response = yield call(getShippingNames, payload);
      yield put({
        type: 'getShippingNames',
        payload: response,
      });
      if (callback) {
        callback(response);
      }
    },
    // 订单搜索条件-来源类型列表接口 v1.3
    * orderGetOrderSourceType({payload, callback}, {call, put}) {
      const response = yield call(getOrderSourceType, payload);
      yield put({
        type: 'getOrderSourceType',
        payload: response,
      });
      if (callback) {
        callback();
      }
    },
    // 回选状态
    * orderReviewProvinceList({payload, callback}, {put}) {
      yield put({
        type: 'reviewProvinceList',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 商品信息获取编辑信息
    * orderGoodsEditor({payload, callback}, {put}) {
      yield put({
        type: 'goodsEditor',
        payload,
      });
      if (callback) {
        callback();
      }
    },
    // 商品信息编辑
    * orderPushUpdateSubOrderStatus({payload, callback}, {call, put}) {
      const response = yield call(updateSubOrderStatus, payload);
      yield put({
        type: 'updateSubOrderStatus',
        payload: response,
      });
      if (callback) {
        callback();
      }
    },
    // 订单批量导出
    * orderDownloadOrders({payload, callback}, {call, put}) {

      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(downloadOrders, payload);
      yield put({
        type: 'downloadOrders',
        payload: response,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
      if (callback) {
        callback(response);
      }
    },
    // 重置
    * orderReset({callback}, {put}) {
      yield put({
        type: 'reset',
      });
      if (callback) {
        callback();
      }
    },
    // 重置页码
    * orderResetPages({callback}, {put}) {
      yield put({
        type: 'resetPages',
      });
      if (callback) {
        callback();
      }
    },
    //标记为风险订单
    * updateRisk({payload, callback}, {call, put}) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(updateRisk, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    // 根据订单号获取物流号信息接口
    * getOrderShippingNo({payload, callback}, {call, put}) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(getOrderShippingNo, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    // 根据订单号获取物流号信息接口
    * updateShippingNo({payload, callback}, {call, put}) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(updateShippingNo, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    //获取ERP订单类型
    * downloadOrdersType({payload, callback}, {call, put, select}) {
      const ordersType = yield select((store) => {
        return store.orders.ordersType;
      })
      if (ordersType.length === 0) {
        const response = yield call(downloadOrdersType, payload);
        console.log(response);
        if (response.status === 200) {
          yield put({
            type: 'setOrdersType',
            payload: response.data.types
          })
        }
      }
      if (callback) {
        callback();
      }
    }
  },

  reducers: {
    getOrderFupplier(state, action) {
      return {
        ...state,
        orderFupplier: action.payload.data,
      };
    },
    getOrderSellers(state, action) {
      return {
        ...state,
        orderSellersData: action.payload.data,
      };
    },
    orderLocals(state, action) {
      const countriesData = action.payload.data;
      return countriesData ? {
        ...state,
        orderLocalsData: countriesData,
      } : {...state};
    },
    getPayTypes(state, action) {
      const payTypesData = action.payload.data;
      return payTypesData ? {
        ...state,
        orderpayTypes: payTypesData.pay_types,
      } : {...state};
    },
    getList(state, action) {
      return {
        ...state,
        data: action.payload.data,
      };
    },
    updateSpuStatus(state, action) {
      return {
        ...state,
      };
    },
    getOrderDetail(state, action) {
      return {
        ...state,
        orderDetail: action.payload.data,
      };
    },
    getOrderDetailItem(state, action) {
      return {
        ...state,
        orderDetailItem: action.payload,
      };
    },
    getOrderRecord(state, action) {
      return {
        ...state,
        orderDetailLog: action.payload.data.order_records,
      };
    },
    modifyOrderGoods(state, action) {
      return {
        ...state,
        modifyOrderGoods: action.payload.data,
      };
    },
    modifyOrderSub(state, action) {
      return {
        ...state,
      };
    },
    updateOrderAddress(state, action) {
      return {
        ...state,
      };
    },
    getLocals(state, action) {
      return {
        ...state,
        countryList: action.payload.data.countries,
      };
    },
    getShippingNames(state, action) {
      const ShippingNamesData = action.payload.data;
      return ShippingNamesData ? {
        ...state,
        logisticsList: action.payload.data.name,
      } : {...state};
    },
    getOrderSourceType(state, action) {
      return {
        ...state,
        orderSourceTypeList: action.payload.data.orderSourceTypes,
      };
    },
    reviewProvinceList(state, action) {
      return {
        ...state,
        reviewProvinceList: action.payload,
      };
    },
    goodsEditor(state, action) {
      state.orderDetail.goods_info.goods.map((item) => {
        if (item.sub_order_id === action.payload.record.sub_order_id) {
          item.status = parseInt(action.payload.value, 10);
        }
        return true;
      });
      return {
        ...state,
      };
    },
    updateSubOrderStatus(state, action) {
      return {
        ...state,
      };
    },
    initPage(state, action) {
      state.pushData.tab_id = action.payload.tab_id;
      state.pushData.page_num = action.payload.page_num;
      return {
        ...state,
      };
    },
    pushTabId(state, action) {
      state.pushData.tab_id = action.payload - 0;
      return {
        ...state,
      };
    },
    pushFilter(state, action) {
      state.pushData.filter = action.payload - 0;
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
    pushFupplier(state, action) {
      state.pushData.supplier = action.payload;
      return {
        ...state,
      };
    },
    // 订单来源
    pushSourceType(state, action) {

      state.pushData.sourceType = action.payload;
      return {
        ...state,
      };
    },
    pushSeller(state, action) {
      state.pushData.seller = action.payload;
      return {
        ...state,
      };
    },
    pushPayType(state, action) {
      state.pushData.pay_type = action.payload;
      return {
        ...state,
      };
    },
    pushLocal(state, action) {
      state.pushData.country = action.payload;
      return {
        ...state,
      };
    },
    pushStartTime(state, action) {
      state.pushData.start_time = action.payload;
      return {
        ...state,
      };
    },
    pushEndTime(state, action) {
      state.pushData.end_time = action.payload;
      return {
        ...state,
      };
    },
    operationItem(state, action) {
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
    downloadOrders(state, action) {
      return {
        ...state,
        loading: action.payload,
      };
    },
    setOrdersType(state, action){
      return {
        ...state,
        ordersType: action.payload,
      };
    },
    reset(state) {
      state.pushData.filter = 1;
      state.pushData.page_num = 1;
      state.pushData.page_size = 20;
      state.pushData.keyword = '';
      // 订单搜索-商家
      state.pushData.pay_type = 0;
      // 订单搜索-国家
      state.pushData.seller = 0;
      // 订单搜索-供应商
      state.pushData.supplier = 0;
      // 订单搜索-支付方式
      state.pushData.country = '';
      state.pushData.start_time = '';
      state.pushData.end_time = '';
      return {
        ...state,
      };
    },
    resetPages(state) {
      state.pushData.page_num = 1;
      state.pushData.page_size = 20;
      return {
        ...state,
      };
    },
    clear(state) {
      return {
        loading: true,
        data: {},
        pushData: {
          tab_id: (getQueryString().tab_id || -1) - 0,
          page_num: (getQueryString().page_num || 1) - 0,
          page_size: (getQueryString().page_size || 20) - 0,
          keyword: '',
          filter: 1,
          pay_type: 0,
          start_time: '',
          end_time: '',
          supplier: 0,
          seller: 0,
          country: '',
          sourceType: 0, // 订单来源
        },
        // 订单搜索-供应商
        orderFupplier: '',
        // 订单搜索-商家
        orderSellers: '',
        // 订单搜索-国家
        orderLocalsData: '',
        // 订单搜索-支付方式
        orderpayTypes: '',
        // // 国家列表
        countryList: state.countryList,
        // 详情
        orderDetail: {},
        // 物流列表
        logisticsList: [],
        // getProvinceList
        reviewProvinceList: null,

        ordersType: state.ordersType,
      };
    },
  },
};
