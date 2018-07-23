import request from '../utils/request';

// 订单搜索条件-商家列表接口
export async function orderSellers(params) {
  return request('/api/merchant/v1/order/getOrderSellers', {
    method: 'POST',
    body: params,
  });
}
// 订单搜索条件-国家列表接口
export async function orderGetLocals(params) {
  return request('/api/merchant/v1/order/getOrderCountry', {
    method: 'POST',
    body: params,
  });
}
// 订单搜索条件-支付方式列表接口
export async function getPayTypes(params) {
  return request('/api/util/v1/base/getPayTypes', {
    method: 'POST',
    body: params,
  });
}

// 订单列表
export async function orderLists(params) {
  return request('/api/merchant/v1/order/getOrders', {
    method: 'POST',
    body: params,
  });
}

// 修改商品状态接口
export async function updateSpuStatus(params) {
  return request('/api/merchant/v1/order/updateOrderStatus', {
    method: 'POST',
    body: params,
  });
}

// 修改商品状态接口
export async function getOrderDetail(params) {
  return request('/api/merchant/v1/order/getOrderDetail', {
    method: 'POST',
    body: params,
  });
}

// 修改商品状态接口
export async function updateOrderAddress(params) {
  return request('/api/merchant/v1/order/updateOrderAddress', {
    method: 'POST',
    body: params,
  });
}

// 获取国家列表
export async function getLocals(params) {
  return request('/api/util/v1/base/getLocals', {
    method: 'POST',
    body: params,
  });
}


// 获取物流公司接口
export async function getShippingNames(params) {
  return request('/api/util/v1/base/getShippingNames', {
    method: 'POST',
    body: params,
  });
}

// 修改子订单状态接口
export async function updateSubOrderStatus(params) {
  return request('/api/merchant/v1/order/updateSubOrderStatus', {
    method: 'POST',
    body: params,
  });
}
// 修改子订单状态接口
export async function downloadOrders(params) {
  return request('/api/merchant/v1/order/downloadOrders', {
    method: 'POST',
    body: params,
  });
}

// 订单搜索条件-来源类型列表接口 v1.3
export async function getOrderSourceType(params) {
  return request('/api/merchant/v1/order/getOrderSourceType', {
    method: 'POST',
    body: params,
  });
}

// 子订单修改-换货-退货 v1.4
export async function modifyOrderSub(params) {
  return request('/api/merchant/v1/order/modifyOrderSub', {
    method: 'POST',
    body: params,
  });
}
// 订单详情-日志 v1.4
export async function getOrderRecord(params) {
  return request('/api/merchant/v1/order/getOrderRecord', {
    method: 'POST',
    body: params,
  });
}
// 订单详情-订单修改商品 v1.4
export async function modifyOrderGoods(params) {
  return request('/api/merchant/v1/order/modifyOrderGoods', {
    method: 'POST',
    body: params,
  });
}

//标记为风险订单
export async function updateRisk(params) {
  return request('/api/merchant/v1/order/updateRisk', {
    method: 'POST',
    body: params,
  });
}

//根据订单号获取物流号信息接口
export async function getOrderShippingNo(params) {
  return request('/api/merchant/v1/order/getOrderShippingNo', {
    method: 'POST',
    body: params,
  });
}

//更新订单物流号
export async function updateShippingNo(params) {
  return request('/api/merchant/v1/order/updateShippingNo', {
    method: 'POST',
    body: params,
  });
}


//导出订单类型
export async function downloadOrdersType(params) {
  return request('/api/merchant/v1/order/downloadOrdersType', {
    method: 'POST',
    body: params,
  });
}

