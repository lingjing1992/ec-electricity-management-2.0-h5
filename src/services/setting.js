import request from '../utils/request';

// 获取列表页数据
export async function getExchangeRate(params) {
  return request('/api/merchant/v1/settings/getExchangeRate', {
    method: 'POST',
    body: params,
  });
}

// 更新汇率数据
export async function setExchangeRate(params) {
  return request('/api/merchant/v1/settings/setExchangeRate', {
    method: 'POST',
    body: params,
  });
}

// 预警获取接口
export async function getWarning(params) {
  return request('/api/merchant/v1/settings/getWarning', {
    method: 'POST',
    body: params,
  });
}

// 预警设置接口
export async function setWarning(params) {
  return request('/api/merchant/v1/settings/setWarning', {
    method: 'POST',
    body: params,
  });
}
