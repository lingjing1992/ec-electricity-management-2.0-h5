import request from '../utils/request';

export async function supplierBaseInfo() {
  return request('/api/merchant/v1/dashboard/supplierBaseInfo');
}

export async function sellerBaseInfo() {
  return request('/api/merchant/v1/dashboard/sellerBaseInfo');
}