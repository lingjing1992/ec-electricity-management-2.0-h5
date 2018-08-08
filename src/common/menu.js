import { isUrl } from '../utils/utils';

const menuData = [
  {
    name: '概况',
    path: 'home',
    icon: 'home',
    disabled: true,
    id: 1009,
    key: 'dashboard',
    // authority:'admin',
    // authority:'/',
  },
  {
    name: 'update',
    path: 'update',
  },
  {
    name: '店铺',
    path: 'shop',
    icon: 'shop',
    id: 1006,
    key: 'shop',
    children: [
      {
        name: '模板',
        path: 'PromoList',
        disabled: false,
        id: 10011,
        key: 'template',
      }, {
        name: '列表页',
        path: 'shopLists',
        disabled: false,
        id: 10012,
        key: 'listPages',
      }, {
        name: '列表详情',
        path: 'shopDetails',
        disabled: false,
        // id: 10012,
      }],
  },
  {
    name: '测试',
    path: 'test',
    disabled: true,
  },
  {
    name: '商品',
    path: 'goods',
    icon: 'appstore-o',
    id: 1001,
    key: 'product',
    children: [
      {
        name: '商品管理',
        path: 'goodsList',
        id: 10001,
        key: 'productManagement',
      },
      // {
      //   name: '分销市场',
      //   path: 'distribution',
      //   id: 10003,
      //   key: 'distribution',
      // },
      {
        name: '分销市场',
        path: 'distributionIndex',
        id: 10003,
        key:'distribution',
      },
      {
        name: '活动页',
        path: 'distributionActivity',
        // id: 100051,
        key:'distributionActivity',
      },
      {
        name: '搜索结果页',
        path: 'distributionSearchList',
        // id: 100051,
        key:'distributionSearchList',
      },
      {
        name: '分销市场商品变更',
        path: 'distributionCommodityChange',
        // id: 100051,
        key:'distributionCommodityChange',
      },
      {
        name: '新建/编辑商品',
        path: 'goodsCreate',
        disabled: true,
        // id: 10019,
        key: 'productManagement',
      },
    ],
  },
  {
    name: '订单',
    path: 'order',
    icon: 'file',
    id: 1002,
    key: 'order',
    children: [{
      name: '订单管理',
      path: 'orderList',
      id: 10004,
      key: 'orderManagement',
    },
      {
        name: '订单详情',
        path: 'orderDetail',
        disabled: true,
        // id: 10014,
      }],
  },
  {
    name: '数据',
    path: 'data',
    icon: 'dot-chart',
    id: 1004,
    key: 'data',
    children: [{
      name: '商品销售',
      path: 'dataGoodsSalesList',
      id: 10005,
      key: 'commoditySales',
    },
      {
        name: '流量分析',
        path: 'dataFlowAnalysisTime',
        id: 10006,
        key: 'flowAnalysis',
      },
      {
        name: '流量分析-来源',
        path: 'dataFlowAnalysisSource',
      },
      {
        name: '流量分析-广告系列',
        path: 'dataFlowAnalysisAdvertising',
      },
      {
        name: '流量分析-关键字',
        path: 'dataFlowAnalysisKeyword',
      },
    ],
  },
  {
    name: '营销',
    path: 'marketing',
    icon: 'barcode',
    id: 1005,
    key: 'marketing',
    children: [
      {
        name: '营销商品列表',
        path: 'marketingList',
        id: 10007,
        key: 'marketingProductList',
      },
      {
        name: '新建营销商品',
        path: 'marketingCreate',
      },
      {
        name: '优惠码',
        path: 'couponList',
        id: 10008,
        key: 'promoCode',
      }, {
        name: '新建优惠码',
        path: 'couponCreate',
      },
      {
        name: '满减送',
        path: 'couponSubtractionList',
        id: 10009,
        key: 'specialOffers',
      }, {
        name: '新建满减送',
        path: 'couponSubtractionCreate',
      },
      {
        name: '专题页',
        path: 'special',
        disabled: false,
        id: 10010,
        key: 'promoPage',
      },
      {
        name: '专题列表页',
        path: 'specialList',
      },
      {
        name: '新建专题页',
        path: 'specialCreate',
      }],
  },
  {
    name: '财务',
    path: 'finance',
    icon: 'pay-circle-o',
    id: 1008,
    key: 'financing',
    children: [
      {
        name: '结算汇总',
        path: 'supplierSettlement',
        id: 10017,
        key: 'financeSettlement',
      }],
  },
  {
    name: '设置',
    path: 'setting',
    icon: 'setting',
    key: 'setting',
    id: 1007,
    children: [
      {
        name: '退货地址',
        path: 'returnAddress',
        disabled: false,
        key: 'returnAddress',
        id: 10023,
      },
      {
        name: '基本设置',
        path: 'basicSetting',
        disabled: false,
        key: 'basicSetting',
        id: 10024,
      },
    ],
  },
  {
    name: '通知',
    path: 'notice',
    key: 'setting',
  },
  {
    name: '账户',
    icon: 'user',
    path: 'user',
    authority: 'guest',
    children: [
      {
        name: '登录',
        path: 'login',
      },
    ],
  },
];

function formatter(data, parentPath = '/', parentAuthority) {
  return data.map(item => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}

export const getMenuData = () => formatter(menuData);
