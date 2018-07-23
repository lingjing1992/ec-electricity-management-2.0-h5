import request from '../utils/request';
// // 分销市场列表
// export async function getDistributionSpus(params) {
//   return request('/api/merchant/v1/spu/getDistributionSpus', {
//     method: 'POST',
//     body: params,
//   });
// }

// 商品详情
export async function getDistributionSpuDetail(params) {
  return request('/api/merchant/v1/spu/getDistributionSpuDetail', {
    method: 'POST',
    body: params,
  });
}

// 领取商品
export async function applyDistributionSpu(params) {
  return request('/api/merchant/v1/spu/applyDistributionSpu', {
    method: 'POST',
    body: params,
  });
}

// 商品更改信息
export async function supplierChanges(params) {
  return request('/api/merchant/v1/spu/supplierChanges', {
    method: 'POST',
    body: params,
  });
}

// 同步商品信息
export async function syncSupplierChange(params) {
  return request('/api/merchant/v1/spu/syncSupplierChange', {
    method: 'POST',
    body: params,
  });
}

//分销首页公共数据接口
export async function common(params) {
  return request('/api/merchant/v1/distribution/common', {
    method: 'POST',
    body: params,
  });
}

//分销首页栏目数据接口
export async function home(params) {
  return request('/api/merchant/v1/distribution/home', {
    method: 'POST',
    body: params,
  });
}

//分销搜索接口  -- 参数巨多
export async function getDistributionSpus(params) {

  return request('/api/merchant/v1/spu/getDistributionSpus', {
    // return request('/merchant/v1/spu/getDistributionSpus', {
    method: 'POST',
    body: params,
  });
}

//分销活动专题详情接口
export async function getActivity(params) {
  return request('/api/merchant/v1/distribution/getActivity', {
    method: 'POST',
    body: params,
  });
}
