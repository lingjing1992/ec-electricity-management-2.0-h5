import request from '../utils/request';

export async function query() {
  return request('/api/users');
}

// 登录
export async function signIn(params) {
  return request('/api/merchant/v1/user/login', {
    method: 'POST',
    body: params,
  });
}
// 登出
export async function signOut(params) {
  return request('/api/merchant/v1/user/logout', {
    method: 'POST',
    body: params,
  });
}
// 品牌站列表-权限
export async function brand(params) {
  return request('/api/merchant/v1/seller/brand', {
    method: 'POST',
    body: params,
  });
}
// 切换品牌站-权限
export async function switchBrand(params) {
  return request('/api/merchant/v1/seller/switchBrand', {
    method: 'POST',
    body: params,
  });
}
