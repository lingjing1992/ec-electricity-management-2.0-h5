import React, { Component } from 'react';
import { Tabs, Spin, Pagination, Card } from 'antd';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
//import OrderPane from './OrderPane';
import NoticePane from './NoticePane';
import { setStateObjectKey, getQueryString } from '../../utils/utils';
import styles from './Notice.less';

const TabPane = Tabs.TabPane;

@connect(state => ({
  notice: state.notice,
  global: state.global,
}))
export default class Notice extends Component {
  state = {
    notices: [],
    //tab栏
    tabPanes: [
      {
        key: '3',
        tab: '商品',
      },
      {
        key: '2',
        tab: '订单',
      },
      {
        key: '1',
        tab: '公告',
      },
    ],
    //请求参数
    noticeQueryParams: {
      type: 2,
      isRead: 2,
      pageNum: 1,
      pageSize: 5,
      searchKey: 'orderNo',
      searchValue: '',
    },
    //搜索的类型
    searchKey: {
      '1': 'noticeTitle',
      '2': 'orderNo',
      '3': 'goods',
    },
    permission: this.props.global.rolePower.modules['1010'].moduleSubs, //权限值
    total: 0, //列表总条数
  };

  componentWillMount() {
    this.init();
    this.pemissonControl();
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.notice.type !== nextProps.notice.type ||
      (this.props.notice.isUpdate !== nextProps.notice.isUpdate && nextProps.notice.isUpdate)
    ) {
      this.init(nextProps.notice.type);
      this.props.dispatch({
        type: 'notice/setIsUpdate',
        payload: false,
      });
    }
  }

  init = type => {
    const tabId = type || getQueryString().tabId;
    if (tabId) {
      this.handelNoticeQueryParamsOnChange({
        type: parseInt(tabId),
        searchKey: this.state.searchKey[tabId],
      });
    }
    //页码变成1
    this.handelNoticeQueryParamsOnChange({
      pageNum: 1,
    });
    this.getNoticeQuery();
  };

  //tab权限控制
  pemissonControl = () => {
    let { permission, tabPanes } = this.state;
    const tabPermission = {
      '3': permission['10025'].status,
      '2': permission['10021'].status,
      '1': permission['10022'].status,
    };
    tabPanes = tabPanes.filter((item1, item2) => {
      return tabPermission[item1.key];
    });
    this.setState({
      tabPanes: tabPanes,
    });
  };

  //tab栏切换
  tabOnChange = key => {
    this.props.dispatch(routerRedux.replace('/notice?tabId=' + key));
    this.handelNoticeQueryParamsOnChange({
      type: parseInt(key),
      pageNum: 1,
      searchValue: '',
      isRead: 2,
      searchKey: this.state.searchKey[key],
    });
    this.getNoticeQuery();
  };

  //状态选择
  handleStatus = status => {
    this.handelNoticeQueryParamsOnChange({
      isRead: status,
    });
    this.getNoticeQuery();
  };

  //获取列表数据
  getNoticeQuery = () => {
    this.props.dispatch({
      type: 'notice/getNoticeQuery',
      payload: this.state.noticeQueryParams,
      callback: data => {
        if (data.status === 200) {
          this.setState({
            notices: data.data.notices,
            total: data.data.total,
          });
        }
      },
    });
  };

  //搜索
  handleSearch = params => {
    this.handelNoticeQueryParamsOnChange({
      isRead: params.searchStatus,
      searchValue: params.searchValue,
      searchKey: params.searchType,
      pageNum: 1,
    });
    this.getNoticeQuery();
  };

  //点击列表
  handleItemClick = id => {
    const { notices } = this.state;
    this.props.dispatch({
      type: 'notice/noticeUpdate',
      payload: {
        ids: [id],
      },
      callback: data => {
        if (data.status === 200) {
          const newArr = notices.forEach(item => {
            if (item.id === id) {
              item.isRead = 1;
            }
            return item;
          });
          this.setState({
            notices: Object.assign(notices, {
              ...newArr,
            }),
          });
          this.props.dispatch({
            type: 'notice/getSummaryInfo',
          });
        }
      },
    });
  };

  //列表请求参数修改
  handelNoticeQueryParamsOnChange = params => {
    setStateObjectKey(this, 'noticeQueryParams', params);
  };

  render() {
    const { notices, tabPanes, noticeQueryParams, total } = this.state;
    const { loading } = this.props.notice;
    const languageForProductNotice = this.props.global.languageDetails.notice;
    const languageForProductGlobal = this.props.global.languageDetails.global;
    //实现多语言
    const newTabPanes = tabPanes.map(item => {
      switch (item.key) {
        case '3':
          item.tab = languageForProductNotice.Product;
          break;
        case '2':
          item.tab = languageForProductNotice.Orders;
          break;
        case '1':
          item.tab = languageForProductNotice.notice;
          break;
      }
      return item;
    });
    //同步变更分页器
    const pagination = {
      pageSize: noticeQueryParams.pageSize,
      total: total,
      current: noticeQueryParams.pageNum,
      defaultPageSize: noticeQueryParams.pageSize,
      showSizeChanger: true,
      pageSizeOptions: ['5', '10', '20'],
      className: styles.pagintion,
      showTotal: total => {
        return `${languageForProductGlobal.total} ${total} ${languageForProductGlobal.items}`;
      },
      onShowSizeChange: (pageNum, pageSize) => {
        //页面数据为空时，切换每页数量，pageNum为0
        if (pageNum === 0) {
          pageNum = 1;
        }
        this.handelNoticeQueryParamsOnChange({
          pageNum: pageNum,
          pageSize: pageSize,
        });
        this.getNoticeQuery();
      },
      onChange: pageNum => {
        this.handelNoticeQueryParamsOnChange({
          pageNum: pageNum,
        });
        this.getNoticeQuery();
      },
    };
    return (
      <div id={styles.notice}>
        <Tabs
          activeKey={noticeQueryParams.type.toString()}
          onChange={this.tabOnChange}
          className={newTabPanes.length === 1 ? styles.aloneTab : ''}
        >
          {newTabPanes.map(item => {
            return <TabPane tab={item.tab} key={item.key} />;
          })}
        </Tabs>
        <Spin spinning={loading}>
          <Card>
            <NoticePane
              type={noticeQueryParams.type}
              resource={notices}
              pagination={pagination}
              onStatusChange={this.handleStatus}
              onSearch={this.handleSearch}
              onClick={this.handleItemClick}
            />
            <Pagination {...pagination} />
          </Card>
        </Spin>
      </div>
    );
  }
}
