import React, { Component } from 'react';
import styles from './Header.less';
import { routerRedux, Link } from 'dva/router';
import { Input, Icon, Radio, Badge } from 'antd';
import { connect } from 'dva';
import { getQueryString } from '../../utils/utils';
import pearlgoLogo from '../../assets/pearlgo-logo.svg';
import Cookies from 'js-cookie';

const { Search } = Input;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@connect(state => ({
  global: state.global,
  distribution: state.distribution,
}))

export default class Header extends Component {

  static defaultProps = {
    onSearch: () => {}
  }

  state = {
    tabId: -100,
    preTabId: null,
  };

  componentWillMount() {
    this.getTabId();
  }

  //获取tabId
  getTabId = () => {
    const tabId = getQueryString().tabId || -100;
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

  onSearch = () => {
    setTimeout( () => {
      this.props.onSearch();
    },0)
  }

  render() {
    const languageForDistribution = this.props.global.languageDetails.goods.distribution;
    const language = this.props.global.language;
    const { headerData  } = this.props;
    const { searchData } = this.props.distribution
    const tabId = getQueryString().tabId || -100;
    /**
     * 头部搜索按钮、关键字点击事件
     * @param {string} value  搜索关键词
     */
    const searchHandle = (value) => {
      const { defSearchData } = this.props.distribution;
      const { location } = this.props;
      this.props.dispatch(routerRedux.push('/goods/distributionSearchList'));
      this.props.dispatch({
        type: 'distribution/changeSearchData',
        payload: {
          ...defSearchData,
          keyword: value,
          categoryId: null,
          rankType: null,
        },
      });
      this.onSearch();
    };
    /**
     *
     * @param {*} e 事件e
     * 分类选择事件
     */
    const categoryChangeHangle = (val) => {
      const { searchData } = this.props.distribution;

      const { location } = this.props;
      const { preTabId } = this.state;
      // const val = e.target.value;
      const searchPathName = '/goods/distributionSearchList';
      const tabId = parseInt(val);
      if(val == '-100'){
        this.props.dispatch(routerRedux.push({
          pathname: '/goods/distributionIndex'
        }))
      }else {
        this.props.dispatch({
          type: 'distribution/changeSearchData',
          payload: {
            ...searchData,
            categoryId: tabId,
            rankType: null,
            keyword: null
          }
        })

        console.log(location);
        //在搜索页切换tab,在其他页则跳转搜索页

        if(location.pathname === searchPathName){
          this.setState({
            tabId: val,
          });
          this.props.dispatch(routerRedux.replace({
            pathname: searchPathName,
            search: '?tabId='+tabId
          }))
        }else {
          this.props.dispatch(routerRedux.push(searchPathName + '?tabId='+tabId))
        }
        this.onSearch();
      }
      this.setState({
        preTabId :searchData.categoryId,
      })
    };
    return (
      <div>
        {/* logo  全局搜索框  商品变更 */}
        {
          headerData.hasOwnProperty('hotWords') ? (
            <div>
              <div className={`${styles.disHeader} clearfix`}>
                <div className="logo">
                  <Link to={`/goods/distributionIndex`}><img src={pearlgoLogo}/></Link>
                </div>
                <div className={`search ${language=== 'en' ? 'English' : ''}`}>
                  <span className="search-title">{languageForDistribution.ProductName}</span>
                  <Search
                    className="search-input"
                    value={searchData.keyword}
                    placeholder={languageForDistribution.SearchContent}
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
                      <span>{languageForDistribution.ProductsChange}</span>
                    </Link>
                  </Badge>
                </div>
              </div>
              {/* 分类渲染 */}
              {
                !this.props.hideTab && (
                  <div
                    className={styles.tab}>
                    {
                      headerData.column.map(item => {
                        return (
                          <label
                            className={`${ Number(tabId) === item.categoryId ? 'ant-radio-button-wrapper-checked' : null} ant-radio-button-wrapper`}
                            key={item.categoryId}
                            value={item.categoryId}
                            onClick={()=>{
                              categoryChangeHangle(item.categoryId);
                            }}
                          >
                            {item.name}
                            </label>
                        );
                      })
                    }
                  </div>
                )
              }
            </div>
          ) : null
        }
      </div>

    );
  }
}
