/**
 * Created by dell on 2018/2/7.
 */
import request from '../utils/request';

// 获取专题样式
export async function getViewStyle(params) {
  return request('/api/merchant/v1/station/getViewStyle', {
    method: 'POST',
    body: params,
  });
}
// 创建或更新专题页
export async function createUpdateTopicView(params) {
  return request('/api/merchant/v1/station/createUpdateTopicView', {
    method: 'POST',
    body: params,
  });
}

// 获取专题列表页
export async function getSpuView(params) {
  return request('/api/merchant/v1/station/getSpuView', {
    method: 'POST',
    body: params,
  });
}

// 修改页面状态
export async function updateViewStatus(params) {
  return request('/api/merchant/v1/station/updateViewStatus', {
    method: 'POST',
    body: params,
  });
}

// 删除页面
export async function delSpuView(params) {
  return request('/api/merchant/v1/station/delSpuView', {
    method: 'POST',
    body: params,
  });
}

// 获取专题详情
export async function getTopicViewDetail(params) {
  return request('/api/merchant/v1/station/getTopicViewDetail', {
    method: 'POST',
    body: params,
  });
}

