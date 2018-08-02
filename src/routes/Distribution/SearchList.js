import React, { Component } from 'react';
import styles from './Index.less';
import { Redirect, Switch, routerRedux } from 'dva/router';
import { Radio, Pagination, Spin, Card } from 'antd';
import { connect } from 'dva';
import Header from './Header'
import Goods from './Goods'
import SubSearch from './SubSearch'
import {  scrollToTop, getQueryString } from '../../utils/utils';

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

    // const {searchData} = this.props.distribution
    this.getData ();
  }
  /**
   *
   * @param {obj} param 搜索改变的参数
   */
  getData =  (pageNum) => {
    const { searchData } = this.props.distribution
    pageNum = pageNum ? pageNum : 1;
    const tabId = getQueryString().tabId;
    this.props.dispatch({
      type:'distribution/getDistributionSpus',
      payload: {
        ...searchData,
        pageNum: pageNum,
        categoryId: parseInt(tabId),
      },
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
    const changePage = (pageNum) => {
      const {pagination} = this.state
      pageNum = pageNum ? pageNum : 1;
      this.props.dispatch({
        type: 'distribution/changeSearchData',
        payload: {
          pageNum: pageNum,
        },
      });
      this.setState({
        pagination: {
          ...pagination,
          current: pageNum
        }
      })
      this.getData(pageNum)
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
            {
              goods.length>0 ? (
                <Goods spus={goods}></Goods>
              ) : (
                <div className={styles.null}>
                  {langusgeForGlobal.noData}
                </div>
              )
            }
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
