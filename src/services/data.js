import request from '../utils/request';

// 数据-商品销售统计接口 v1.3
export async function bySpu(params) {
  return request('/api/merchant/v1/stat/bySpu', {
    method: 'POST',
    body: params,
  });
}

// 数据-查询广告来源接口 v1.3
export async function getUtmSource(params) {
  return request('/api/merchant/v1/stat/getUtmSource', {
    method: 'POST',
    body: params,
  });
}

// 数据-统计报表按utm参数查询接口 v1.3
export async function byUtmParams(params) {
  return request('/api/merchant/v1/stat/byUtmParams', {
    method: 'POST',
    body: params,
  });
}
