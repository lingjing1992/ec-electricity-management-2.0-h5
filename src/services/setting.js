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
