import request from '../utils/request';

// 获取列表页数据
export async function getSpuView(params) {
  return request('/api/merchant/v1/station/getSpuView', {
    method: 'POST',
    body: params,
  });
}

//新建列表
export async function createUpdateSpuView(params) {
  return request('/api/merchant/v1/station/createUpdateSpuView', {
    method: 'POST',
    body: params,
  });
}

//获取商品详情
export async function getSpuViewDetail(params) {
  return request('/api/merchant/v1/station/getSpuViewDetail', {
    method: 'POST',
    body: params,
  });
}

//删除
export async function delSpuView(params) {
  return request('/api/merchant/v1/station/delSpuView', {
    method: 'POST',
    body: params,
  });
}

//获取模板详情信息
export async function templateList(params) {
  return request('/api/merchant/v1/shop/m1/list', {
    method: 'POST',
    body: params,
  });
}

//获取模板详情信息
export async function templateDetail(params) {
  return request('/api/merchant/v1/shop/m1/detail', {
    method: 'POST',
    body: params,
  });
}

//保存模板详情信息
export async function updateTemplate(params) {
  return request('/api/merchant/v1/shop/m1/update', {
    method: 'POST',
    body: params,
  });
}

//使用模板
export async function useTemplate(params) {
  return request('/api/merchant/v1/shop/m1/enable', {
    method: 'POST',
    body: params,
  });
}

//获取退货地址接口
export async function getBackAddr(params) {
  return request('/api/merchant/v1/settings/getBackAddr', {
    method: 'POST',
    body: params,
  });
}

//保存&更新退货地址
export async function saveOrUpdateBackAddr(params) {
  return request('/api/merchant/v1/settings/saveOrUpdateBackAddr', {
    method: 'POST',
    body: params,
  });
}
