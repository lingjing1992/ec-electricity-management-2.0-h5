import React, { Component } from 'react';
import styles from './Header.less';
import { routerRedux, Link } from 'dva/router';
import { Input, Icon, Radio, Badge } from 'antd';
import { connect } from 'dva';
import { getQueryString } from '../../utils/utils';
import Cookies from 'js-cookie';

const { Search } = Input;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@connect(state => ({
  global: state.global,
  distribution: state.distribution,
}))

export default class Header extends Component {
  state = {
    tabId: 0,
  };

  componentWillMount() {
    this.getTabId();
  }

  //获取tabId
  getTabId = () => {
    const tabId = getQueryString().tabId || 0;
    this.setState({
      tabId: parseInt(tabId)
    })
  }

  //搜索文字变化
  handleSearchChange = (e) => {
    this.props.dispatch({
      type: 'distribution/changeSearchData',
      payload: {
        keyword: e.target.value,
      },
    });
  }

  render() {
    /**
     * 头部搜索按钮、关键字点击事件
     * @param {string} value  搜索关键词
     */
    const searchHandle = (value) => {
      const { defSearchData } = this.props.distribution;
      const { location } = this.props;
      if(location.pathname !== '/goods/DistributionSearchList'){
        this.props.dispatch(routerRedux.push('/goods/DistributionSearchList'));
      }
      this.props.dispatch({
        type: 'distribution/changeSearchData',
        payload: {
          ...defSearchData,
          keyword: value,
        },
      });
    };
    /**
     *
     * @param {*} e 事件e
     * 分类选择事件
     */
    const categoryChangeHangle = (e) => {
      const { defSearchData } = this.props.distribution;
      const { location } = this.props;
      const val = e.target.value;
      if(val == 0){
        this.props.dispatch(routerRedux.push({
          pathname: '/goods/DistributionIndex'
        }))
      }else {

        this.props.dispatch({
          type: 'distribution/changeSearchData',
          payload: {
            ...defSearchData,
            categoryId: parseInt(val)
          }
        })
        console.log(location);
        //在搜索页切换tab,在其他页则跳转搜索页
        if(location.pathname === '/goods/DistributionSearchList'){
          this.setState({
            tabId: e.target.value,
          });
        }else {
          this.props.dispatch(routerRedux.push('/goods/DistributionSearchList?tabId='+val))
        }
      }
    };
    const { headerData  } = this.props;
    const { searchData } = this.props.distribution
    const tabId = this.state.tabId;
    return (
      <div>
        {/* logo  全局搜索框  商品变更 */}
        {
          headerData.hasOwnProperty('hotWords') ? (
            <div>
              <div className={styles.disHeader}>
                <div className="logo"></div>
                <div className="search">
                  <span className="search-title">商品名称</span>
                  <Search
                    className="search-input"
                    value={searchData.keyword}
                    placeholder="请输入搜索内容"
                    onChange={e => this.handleSearchChange(e)}
                    onSearch={value => searchHandle(value)}
                    enterButton
                  />
                  <div className="keyword">
                    {headerData.hotWords.map((item) => {
                      return (<span key={item} onClick={(e) => {
                        searchHandle(item);
                      }}>{item}</span>);
                    })}
                  </div>
                </div>
                <div className={styles.distributionChnage}>
                  <Badge count={headerData.changeQuantity}>
                    <Link className="changeTips" to="/goods/distributionCommodityChange">
                      <Icon type="mail" style={{ width: 24, marginRight: '5px' }}/>
                      <span>分销商品变更</span>
                    </Link>
                  </Badge>
                </div>
              </div>
              {/* 分类渲染 */}
              {
                !this.props.hideTab && <RadioGroup onChange={(e) => {
                  categoryChangeHangle(e);
                }} value={Number(tabId)} className={styles.tab}>
                  {
                    headerData.column.map(item => {
                      return (
                        <RadioButton key={item.categoryId} value={item.categoryId}>{item.name}</RadioButton>
                      );
                    })
                  }
                </RadioGroup>
              }
            </div>
          ) : null
        }
      </div>

    );
  }
}
