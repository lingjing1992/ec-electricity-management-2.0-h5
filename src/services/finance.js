import request from '../utils/request';
// 供销商结算（周）
export async function getSupplierTradeReport(params) {
  return request('/api/merchant/v1/financial/getSupplierTradeReport', {
    method: 'POST',
    body: params,
  });
}

// 申请提现
export async function updateSupplierTradeReport(params) {
  return request('/api/merchant/v1/financial/updateSupplierTradeReport', {
    method: 'POST',
    body: params,
  });
}

// 供应商提现明细下载
export async function downloadDetails(params) {
  return request('/api/merchant/v1/financial/downloadDetails', {
    method: 'POST',
    body: params,
  });
}
// 供应商对账单下载
export async function downloadSupplierStatement(params) {
  return request('/api/merchant/v1/financial/downloadSupplierStatement', {
    method: 'POST',
    body: params,
  });
}

