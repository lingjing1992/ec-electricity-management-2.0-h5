import request from '../utils/request';

// 导航栏概要通知接口
export async function getSummaryInfo(params) {
  return request('/api/merchant/v1/notice/summaryInfo', {
    method: 'POST',
    body: params,
  });
}

// 通知中心查询接口
export async function getNoticeQuery(params) {
  return request('/api/merchant/v1/notice/query', {
    method: 'POST',
    body: params,
  });
}

// 通知更新读取状态接口
export async function noticeUpdate(params) {
  return request('/api/merchant/v1/notice/update', {
    method: 'POST',
    body: params,
  });
}
