import request from '../utils/request';

// 优惠码列表
export async function getDiscounts(params) {
  return request('/api/merchant/v1/marketing/getDiscounts', {
    method: 'POST',
    body: params,
  });
}

// 新建优惠码
export async function createDiscount(params) {
  return request('/api/merchant/v1/marketing/createDiscount', {
    method: 'POST',
    body: params,
  });
}
// 更新过期时间
export async function updateExpireDate(params) {
  return request('/api/merchant/v1/marketing/updateDiscountTime', {
    method: 'POST',
    body: params,
  });
}
// 更新编辑商品
export async function updateEditProduct(params) {
  return request('/api/merchant/v1/marketing/updateDiscountSpu', {
    method: 'POST',
    body: params,
  });
}
// 删除优惠码
export async function deleteDiscount(params) {
  return request('/api/merchant/v1/marketing/deleteDiscount', {
    method: 'POST',
    body: params,
  });
}

// 获取优惠码详情
export async function getDiscountDetail(params) {
  return request('/api/merchant/v1/marketing/getDiscountDetail', {
    method: 'POST',
    body: params,
  });
}
