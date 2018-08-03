import { notification } from 'antd';
import { routerRedux } from 'dva/router';
import { getQueryString } from '../utils/utils';
import {
  createRequest,
  spuAttributesList,
  createGoods,
  uploadImg,
  propertyAssemble,
  getgoods,
  createDefinedAttr,
  deleteDefinedAttr,
} from '../services/goods';


export default {
  namespace: 'goodsCreate',

  state: {
    loading: false,
    data: {},
    // 初始化数据
    createRequest: {
      country: [],
      goods_type: [],
      language: [],
      currency: [],
    },
    // 获取SPU属性列表
    spuAttributesList: [],
    // 获取自定义SPU属性列表 v1.4 数据格式跟SPU不一样。后端建议保留之前格式。
    createDefinedAttr: [],
    // 新建商品-属性组装接口
    propertyAssemble: {
      sales_info: [],
      others_info: [],
    },
    // 获取回选信息
    getgoods: {
      goods_details: {},
      goods_name: {},
      promote_country: [],
      goods_type_id: null,
      is_distribution: 1,
      brand_name: null,
      goods_icons: [],
      property_config: [],
      spu_attr: [],
      definedAttr: [],
    },

  },

  effects: {
    // 新建商品-信息请求接口
    * goodsCreateCreateRequest({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(createRequest, payload);
      // if (response.status === 10002) {
      //   yield put(routerRedux.push('/user/login'));
      // }
      yield put({
        type: 'createRequest',
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
    * goodsCreateSpuAttributesList({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(spuAttributesList, payload);
      // if (response.status === 10002) {
      //   yield put(routerRedux.push('/user/login'));
      // }
      yield put({
        type: 'spuAttributesList',
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
    // 获取自定义SPU属性列表 v1.4
    * goodsCreateCreateDefinedAttr({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(createDefinedAttr, payload);
      // if (response.status === 10002) {
      //   yield put(routerRedux.push('/user/login'));
      // }
      yield put({
        type: 'createDefinedAttr',
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
    // 获取自定义SPU属性删除 v1.4
    * goodsCreateDeleteDefinedAttr({ payload, callback }, { call, put, select }) {
      const languageDetails = yield select((store)=>{
        return store.global.languageDetails;
      })
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(deleteDefinedAttr, payload);
      if (response.status === 200) {
        notification.success({
          message: languageDetails.message.KindlyReminder,
          description: languageDetails.message.DeletedSuccessfully,
        });
      }
      yield put({
        type: 'deleteDefinedAttr',
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
    * goodsCreateCreateGoods({ payload, callback }, { call, put }) {
      const action = getQueryString().action;
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(createGoods, payload);
      // if (response.status === 10002) {
      //   yield put(routerRedux.push('/user/login'));
      // }
      yield put({
        type: 'createGoods',
        payload: response,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
      if (response.status === 200) {
        if (callback) {
          callback(response);
        }
      }
    },
    * goodsCreatePropertyAssemble({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(propertyAssemble, payload);
      yield put({
        type: 'propertyAssemble',
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
    * goodsCreateGetgoods({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(getgoods, payload);
      yield put({
        type: 'getgoods',
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
  },

  reducers: {
    createRequest(state, action) {

      // const country = state.createRequest.country.unshift({
      //   code: 'Global',
      //   name: 'Global',
      // });

      // console.log('country',state.createRequest.country)

      const arr = [];
      arr.unshift({
        code: 'Global',
        name: 'Global',
      });


      return {
        ...state,
        createRequest: Object.assign(
          state.createRequest,
          {
            ...action.payload.data,
            country: [
              ...arr,
              ...action.payload.data.country,
            ],
          }),
      };
    },
    setCurrencys(state,action){
      return {
        ...state,
        createRequest: Object.assign(state.createRequest,{
          currencys: action.payload
        })
      }
    },
    propertyAssemble(state, action) {
      return {
        ...state,
        propertyAssemble: Object.assign(
          state.propertyAssemble,
          {
            ...action.payload.data,
          }),
      };
    },
    getgoods(state, action) {
      const goods_icons = action.payload.data.goods_icons.map((item, index) => {
        return {
          uid: -(index + 1),
          name: `${index + 1}`,
          status: 'done',
          url: item,
          thumbUrl: item,
        };
      });

      return {
        ...state,
        getgoods: Object.assign(
          state.getgoods,
          {
            ...action.payload.data,
            goods_icons,
          }),
        spuAttributesList: action.payload.data.spu_attr, // 编辑商品的时候，走后门
        createDefinedAttr: action.payload.data.definedAttr, // 编辑商品的时候，走后门 v1.4
      };
    },
    spuAttributesList(state, action) {
      return {
        ...state,
        spuAttributesList: action.payload.data.goods_type_attr,
      };
    },
    // 获取自定义SPU属性列表 v1.4
    createDefinedAttr(state, action) {
      if(action.payload.data.definedAttr){
        state.createDefinedAttr.push(action.payload.data.definedAttr);
      }
      return {
        ...state,
      };
    },
    // 获取自定义SPU属性删除 v1.4
    deleteDefinedAttr(state, action) {

      if (action.payload.response.status === 200) {
        const newData = state.createDefinedAttr.filter(item => item.id !== action.payload.payload.definedAttrId);
        // this.setState({ data: newData });
        // state.createDefinedAttr.filter(item => item.id !== action.payload.definedAttrId)[0];
        return {
          ...state,
          createDefinedAttr: newData,
        };
      }
      return {
        ...state,
      };
    },
    changgeSpuAttributesList(state, action) {
      return {
        ...state,
        // spuAttributesList: action.payload,
        spuAttributesList: Object.assign(
          state.spuAttributesList,
          {
            ...action.payload,
          }),
      };
      //   spuAttributesList: Object.assign(
      //     state.spuAttributesList,
      //     {
      //       ...action.payload.data.goods_type_attr,
      //     }),
      // };
    },
    createGoods(state, action) {
      return {
        ...state,
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
        // 初始化数据
        createRequest: {
          country: [],
        },
        // 获取SPU属性列表
        spuAttributesList: [],
        // 获取自定义SPU属性列表 v1.4 数据格式跟SPU不一样。后端建议保留之前格式。
        createDefinedAttr: [],
        // 新建商品-属性组装接口
        propertyAssemble: {
          sales_info: [],
          others_info: [],
        },
        // 获取回选信息
        getgoods: {
          goods_details: {},
          goods_name: {},
          promote_country: [],
          goods_type_id: null,
          is_distribution: 1,
          brand_name: null,
          goods_icons: [],
          property_config: [],
          spu_attr: [],
          definedAttr: [],
        },
      };
    },
  },
};
