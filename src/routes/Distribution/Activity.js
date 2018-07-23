import React, { Component } from 'react';
import styles from './Index.less';
import { Redirect, Switch, routerRedux } from 'dva/router';
import { Card, Pagination, Spin } from 'antd';
import { connect } from 'dva';
import Header from './Header';
import Goods from './Goods';
import { getQueryString } from '../../utils/utils';

@connect(state => ({
  global: state.global,
  distribution: state.distribution,
}))

export default class Activity extends Component {
  state = {
    activityId: getQueryString().activityId,
    headerData: {
      hotWords: [],
      column: [],
      changeQuantity: 0,
    },
    goods: [],
    bannerUrl: '',
    pagination: {
      total: '',
      pageSize: 20,
      current: 1,
    },
  };

  componentWillMount() {
    this.init();
  }

  init() {
    // 头部数据请求
    this.props.dispatch({
      type: 'distribution/common',
      payload: {}
    });

    // 活动业商品数据请求
    this.getData();
  }

  /**
   *
   * @param {number} page  页码, def: 1
   * 获取活动页信息
   */
  getData(page = 1) {
    const { pagination } = this.state;

    this.props.dispatch({
      type: 'distribution/getActivity',
      payload: {
        activityId: this.state.activityId,
        pageNum: page,
        pageSize: pagination.pageSize,
      },
      callback: (data) => {
        const _this = this;
        if (data.status === 200) {
          this.setState({
            bannerUrl: data.data.bannerUrl,
            goods: data.data.spus,
            pagination: {
              ...this.state.pagination,
              total: data.data.total,
            },
          });
        }
      },
    });
  }

  render() {
    /**
     *
     * @param {Number} page  页码
     * 更换页码
     */
    const changePage = (page) => {
      const { pagination } = this.state;

      this.setState({
        pagination: {
          ...this.state.pagination,
          current: page,
        },
      });
      this.getData(page);
    };
    const { goods, bannerUrl, pagination } = this.state;
    const { distribution:{ headerData }  } = this.props;
    return (
      <Card>
        <div>
          <div className={styles.distributionContent}>
            <Header headerData={headerData} hideTab></Header>
            <Spin spinning={this.props.distribution.loading}>
              <img src={bannerUrl} className={styles.banner}/>
              <Goods spus={goods}></Goods>
              <Pagination
                total={pagination.total}
                pageSize={pagination.pageSize}
                current={pagination.current}
                onChange={
                  (page) => {
                    changePage(page);
                  }
                }
                showTotal={(total) => {
                  // return `${languageForGlobal.total} ${total} ${languageForGlobal.items}`;
                  return total;
                }}
              />
            </Spin>
          </div>
        </div>
      </Card>
    );
  }
}
