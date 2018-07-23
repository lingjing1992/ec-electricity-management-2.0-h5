/**
 * Created by dell on 2018/2/6.
 */
import request from '../utils/request';
//获取支持语言
export async function getLanguage(params) {
  return request('/api/merchant/v1/station/getLanguage', {
    method: 'POST',
    body: params,
  });
}


//获取SPU简略信息
export async function getDiscountBriefSpuList(params) {
  return request('/api/merchant/v1/marketing/getDiscountBriefSpuList', {
    method: 'POST',
    body: params,
  });
}

//获取权限列表
export async function getRolePower(params) {
  return request('/api/merchant/v1/user/getRolePower', {
    method: 'POST',
    body: params,
  });
}