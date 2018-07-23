import request from '../utils/request';

// 商品列表
export async function list(params) {
  return request('/api/merchant/v1/spu/getSpus', {
    method: 'POST',
    body: params,
  });
}

// sku列表
export async function skulist(params) {
  return request('/api/merchant/v1/sku/getSkus', {
    method: 'POST',
    body: params,
  });
}

// sku列表
export async function Auditing(params) {
  return request('/api/merchant/v1/spu/auditingSpu', {
    method: 'POST',
    body: params,
  });
}

// SKU属性
export async function skuProperty(params) {
  return request('/api/merchant/v1/spu/getSkuProperty', {
    method: 'POST',
    body: params,
  });
}

// 供应商列表接口
export async function getSpusSuppliers(params) {
  return request('/api/merchant/v1/spu/getSpusSuppliers', {
    method: 'POST',
    body: params,
  });
}



// 修改商品状态接口-上架下架
export async function updateSpuStatus(params) {
  return request('/api/merchant/v1/spu/updateSpuStatus', {
    method: 'POST',
    body: params,
  });
}


// 新建商品-信息请求接口
export async function createRequest(params) {
  return request('/api/merchant/v1/goods/createRequest',{
    method: 'POST',
    body: params,
  });
}

// 新建商品-信息请求接口
// export async function createRequest() {
//   return request('http://tstation.batmobi.net/api/v1/view/getView',{
//     method: 'POST',
//     body: {viewId:10001},
//   });
// }



// 新建商品-spu属性列表
export async function spuAttributesList(params) {
  return request('/api/merchant/v1/goods/spuAttributesList', {
    method: 'POST',
    body: params,
  });
}
// 新建商品-spu自定义属性列表 v1.4
export async function createDefinedAttr(params) {
  return request('/api/merchant/v1/spu/createDefinedAttr', {
    method: 'POST',
    body: params,
  });
}
// 新建商品-spu自定义属性删除 v1.4
export async function deleteDefinedAttr(params) {
  return request('/api/merchant/v1/spu/deleteDefinedAttr', {
    method: 'POST',
    body: params,
  });
}

// 新建商品-信息上传接口
export async function createGoods(params) {
  return request('/api/merchant/v1/goods/createGoods', {
    method: 'POST',
    body: params,
  });
}

// 新建商品-spu属性列表
export async function uploadImg(params) {
  return request('/api/merchant/v1/goods/uploadImg', {
    method: 'POST',
    body: params,
  });
}

// 新建商品-属性组装接口
export async function propertyAssemble(params) {
  return request('/api/merchant/v1/goods/propertyAssemble', {
    method: 'POST',
    body: params,
  });
}
// 新建商品-属性创建
export async function createProperty(params) {
  return request('/api/merchant/v1/goods/createProperty', {
    method: 'POST',
    body: params,
  });
}

// 编辑商品-获取商品详情
export async function getgoods(params) {
  return request('/api/merchant/v1/goods/getGoods', {
    method: 'POST',
    body: params,
  });
}

// 商品导出erp接口
export async function downloadSpuInfo(params) {
  return request('/api/merchant/v1/spu/downloadSpuInfo', {
    method: 'POST',
    body: params,
  });
}
