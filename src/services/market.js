import request from '../utils/request';

// 营销商品列表
export async function getMarketings(params) {
  return request('/api/merchant/v1/marketing/getMarketings', {
    method: 'POST',
    body: params,
  });
}

// 营销任务更新
export async function update(params) {
  return request('/api/merchant/v1/marketing/update', {
    method: 'POST',
    body: params,
  });
}

// 新建营销任务
export async function create(params) {
  return request('/api/merchant/v1/marketing/create', {
    method: 'POST',
    body: params,
  });
}


// 可创建营销任务商品列表
export async function getMarketingSpus(params) {
  return request('/api/merchant/v1/marketing/getMarketingSpus', {
    method: 'POST',
    body: params,
  });
}

// 根据Spu获取优惠码
export async function spuDiscount(params) {
  return request('/api/merchant/v1/marketing/spuDiscount', {
    method: 'POST',
    body: params,
  });
}


// 上传
export async function upload(params) {
  return request('/api/merchant/v1/marketing/upload', {
    method: 'POST',
    body: params,
  });
}

// SPU搜索插件查询
export async function getDiscountBriefSpuList(params) {
  return request('/api/merchant/v1/marketing/getDiscountBriefSpuList', {
    method: 'POST',
    body: params,
  });
}
