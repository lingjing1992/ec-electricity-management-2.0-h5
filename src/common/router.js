import React, { createElement } from 'react';
import { Spin } from 'antd';
import pathToRegexp from 'path-to-regexp';
import Loadable from 'react-loadable';
import { getMenuData } from './menu';

let routerDataCache;

const modelNotExisted = (app, model) =>
  // eslint-disable-next-line
  !app._models.some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => {
  // register models
  models.forEach(model => {
    if (modelNotExisted(app, model)) {
      // eslint-disable-next-line
      app.model(require(`../models/${model}`).default);
    }
  });

  // () => require('module')
  // transformed by babel-plugin-dynamic-import-node-sync
  if (component.toString().indexOf('.then(') < 0) {
    return props => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return createElement(component().default, {
        ...props,
        routerData: routerDataCache,
      });
    };
  }
  // () => import('module')
  return Loadable({
    loader: () => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return component().then(raw => {
        const Component = raw.default || raw;
        return props =>
          createElement(Component, {
            ...props,
            routerData: routerDataCache,
          });
      });
    },
    loading: () => {
      return <Spin size="large" className="global-spin" />;
    },
  });
};

function getFlatMenuData(menus) {
  let keys = {};
  menus.forEach(item => {
    if (item.children) {
      keys[item.path] = { ...item };
      keys = { ...keys, ...getFlatMenuData(item.children) };
    } else {
      keys[item.path] = { ...item };
    }
  });
  return keys;
}

export const getRouterData = app => {
  const routerConfig = {
    '/': {
      component: dynamicWrapper(app, ['user', 'login','global','notice'], () => import('../layouts/BasicLayout')),
    },
    '/home': {
      component: dynamicWrapper(app, ['dashboard'], () => import('../routes/Home/Home')),
      // authority: '1009'
    },
    '/notice': {
      component: dynamicWrapper(app, ['notice'], () => import('../routes/Notice/Notice')),
      // authority: '1009'
    },
    '/shop/PromoList': {
      component: dynamicWrapper(app, ['shop'], () => import('../routes/Shop/PromoList')),
    },
    '/shop/StyleTemplatesDetails': {
      component: dynamicWrapper(app, ['shop'], () => import('../routes/Shop/StyleTemplatesDetails')),
    },
    '/shop/shopLists': {
      component: dynamicWrapper(app, ['shop'], () => import('../routes/Shop/ShopLists')),
    },
    '/shop/shopDetails': {
      component: dynamicWrapper(app, ['shop','special'], () => import('../routes/Shop/ShopDetails')),
    },
    '/goods/goodsList': {
      component: dynamicWrapper(app, ['goods'], () => import('../routes/Goods/GoodsList')),
    },
    '/goods/goodsCreate': {
      component: dynamicWrapper(app, ['goods', 'shop', 'goodsCreate','setting', 'orders'], () => import('../routes/Goods/GoodsCreate_old')),
    },
    '/goods/distribution': {
      component: dynamicWrapper(app, ['distribution'], () => import('../routes/Distribution/DistributionMarket')),
    },
    '/goods/distributionIndex': {
      component: dynamicWrapper(app, ['distribution','goods'], () => import('../routes/Distribution/Index')),
    },
    '/goods/distributionActivity': {
      component: dynamicWrapper(app, ['distribution'], () => import('../routes/Distribution/Activity')),
    },
    '/goods/distributionSearchList': {
      component: dynamicWrapper(app, ['distribution'], () => import('../routes/Distribution/SearchList')),
    },
    '/goods/distributionCommodityChange': {
      component: dynamicWrapper(app, ['distribution'], () => import('../routes/Distribution/CommodityChange')),
    },
    '/order/orderList': {
      component: dynamicWrapper(app, ['orders','login'], () => import('../routes/Order/OrderList')),
    },
    '/order/orderDetail': {
      component: dynamicWrapper(app, ['orders'], () => import('../routes/Order/OrderDetail')),
    },
    '/data/dataGoodsSalesList': {
      component: dynamicWrapper(app, ['dataGoodsSales'], () => import('../routes/Data/DataGoodsSalesList')),
    },
    '/data/dataFlowAnalysisTime': {
      component: dynamicWrapper(app, ['dataFlowAnalysis'], () => import('../routes/Data/DataFlowAnalysisTabs')),
    },
    '/marketing/marketingList': {
      component: dynamicWrapper(app, ['marketing'], () => import('../routes/Marketing/MarketingList')),
    },
    '/marketing/marketingCreate': {
      component: dynamicWrapper(app, ['marketCreate'], () => import('../routes/Marketing/MarketingCreate')),
    },
    '/marketing/couponList': {
      component: dynamicWrapper(app, ['couponList'], () => import('../routes/Coupon/CouponList')),
    },
    '/marketing/couponCreate': {
      component: dynamicWrapper(app, ['couponList'], () => import('../routes/Coupon/CouponCreate')),
    },
    '/marketing/couponSubtractionList': {
      component: dynamicWrapper(app, ['couponSubtraction'], () => import('../routes/CouponSubtraction/CouponList')),
    },
    '/marketing/couponSubtractionCreate': {
      component: dynamicWrapper(app, ['couponSubtraction'], () => import('../routes/CouponSubtraction/CouponCreate')),
    },
    '/marketing/special': {
      component: dynamicWrapper(app, ['couponSubtraction'], () => import('../routes/Special/Special')),
    },
    '/marketing/specialList': {
      component: dynamicWrapper(app, ['couponSubtraction'], () => import('../routes/Special/SpecialList')),
    },
    '/marketing/specialCreate': {
      component: dynamicWrapper(app, ['couponSubtraction'], () => import('../routes/Special/SpecialCreate')),
    },
    '/finance/supplierSettlement': {
      component: dynamicWrapper(app, ['finance'], () => import('../routes/Finance/SupplierSettlement')),
    },
    '/setting/returnAddress': {
      component: dynamicWrapper(app, ['orders','shop'], () => import('../routes/ReturnAddress/ReturnAddress')),
    },
    '/user': {
      component: dynamicWrapper(app, [], () => import('../layouts/UserLayout')),
    },
    '/user/login': {
      component: dynamicWrapper(app, ['login','global'], () => import('../routes/User/Login')),
    },
  };
  // Get name from ./menu.js or just set it in the router data.
  const menuData = getFlatMenuData(getMenuData());

  // Route configuration data
  // eg. {name,authority ...routerConfig }
  const routerData = {};
  // The route matches the menu
  Object.keys(routerConfig).forEach(path => {
    // Regular match item name
    // eg.  router /user/:id === /user/chen
    const pathRegexp = pathToRegexp(path);
    const menuKey = Object.keys(menuData).find(key => pathRegexp.test(`${key}`));
    let menuItem = {};
    // If menuKey is not empty
    if (menuKey) {
      menuItem = menuData[menuKey];
    }
    let router = routerConfig[path];
    // If you need to configure complex parameter routing,
    // https://github.com/ant-design/ant-design-pro-site/blob/master/docs/router-and-nav.md#%E5%B8%A6%E5%8F%82%E6%95%B0%E7%9A%84%E8%B7%AF%E7%94%B1%E8%8F%9C%E5%8D%95
    // eg . /list/:type/user/info/:id
    router = {
      ...router,
      name: router.name || menuItem.name,
      authority: router.authority || menuItem.authority,
      hideInBreadcrumb: router.hideInBreadcrumb || menuItem.hideInBreadcrumb,
    };
    routerData[path] = router;
  });
  return routerData;
};
