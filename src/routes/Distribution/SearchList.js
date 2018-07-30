import React, { Component } from 'react';
import styles from './Index.less';
import { Redirect, Switch, routerRedux } from 'dva/router';
import { Radio, Pagination, Spin, Card } from 'antd';
import { connect } from 'dva';
import Header from './Header'
import Goods from './Goods'
import SubSearch from './SubSearch'
import {  scrollToTop } from '../../utils/utils';

@connect(state => ({
  global: state.global,
  distribution: state.distribution
}))

export default class SearchList extends Component {
  state = {
    headerData:{
      hotWords: [],
      column: [],
      changeQuantity: 0
    },
    goods: [],
    pagination: {
      total: '',
      pageSize: 20,
      current: 1
    },
    url: ''
  }
  componentDidMount () {
    this.init();
    scrollToTop();
  }

  componentWillReceiveProps (nextProps) {
    // if (JSON.stringify(nextProps.distribution.searchData) !== JSON.stringify(this.props.distribution.searchData)) {
    //   // console.log('条件变更')
    //   this.getData(nextProps.distribution.searchData)
    // }
  }

  init () {
    // 头部数据请求
    this.props.dispatch({
      type:'distribution/common',
      payload:{},
    })

    const {searchData} = this.props.distribution
    this.getData (searchData);
  }
  /**
   *
   * @param {obj} param 搜索改变的参数
   */
  getData =  () => {
    const { searchData } = this.props.distribution
    this.props.dispatch({
      type:'distribution/getDistributionSpus',
      payload: searchData,
      callback: (data) => {
        const _this = this;
        if(data.status === 200){
          this.setState({
            goods: data.data.spus,
            pagination: {
              ...this.state.pagination,
              total: data.data.total
            }
          })
        }
      }
    })
  }

  render() {
    /**
     *
     * @param {Number} page  页码
     * 更换页码
     */
    const changePage = (page) => {
      const {pagination} = this.state
      const {searchData} = this.props.distribution
      this.setState({
        pagination: {
          ...pagination,
          current: page
        }
      })
      this.getData({...searchData, page})
    }

    const { goods, pagination, url} = this.state;
    const { distribution:{ headerData }  } = this.props;
    const langusgeForGlobal = this.props.global.languageDetails.global;

    const listPagination = {
      total: Number(pagination.total),
      current: pagination.current,
      pageSize: pagination.pageSize,
      showQuickJumper: true,
      showTotal: (total) => {
        return `${langusgeForGlobal.total} ${total} ${langusgeForGlobal.items}`;
      },
      onChange: (page) => {
        changePage(page)
      },
    };
    return (
      <Card>
        <div className={styles.distributionContent}>
          <Header onSearch={this.getData} location={this.props.location} headerData={headerData}></Header>
          <SubSearch changeHandle={
            () => {
              this.getData()
            }
          }></SubSearch>
          <Spin spinning={this.props.distribution.loading}>
            <Goods spus={goods}></Goods>
          </Spin>
          <Pagination
            {
              ...listPagination
            }
          />
        </div>
      </Card>
    )
  }
}
