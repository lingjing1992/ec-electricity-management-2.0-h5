import React, { Component } from 'react';
import styles from './Index.less';
import { Redirect, Switch, routerRedux, Link } from 'dva/router';
import { Radio, Carousel, Spin, Card } from 'antd';
import { connect } from 'dva';
import { scrollToTop } from '../../utils/utils';
import Cookies from 'js-cookie';
import Header from './Header'
import Goods from './Goods'
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
@connect(state => ({
  global: state.global,
  distribution: state.distribution
}))

export default class Index extends Component {
  state = {
    tabId: 1,
    headerData:{
      hotWords: [],
      column: [],
      changeQuantity: 0
    },
    activitys: [],
    rankings: []
  }
  componentWillMount () {
    this.init()
  }
  componentDidMount(){
    scrollToTop();
  }
  init () {
    console.log(this.props.location)
    // 头部数据请求
    this.props.dispatch({
      type:'distribution/common',
      payload:{},
    })
    this.getHopmeData();
  }
  //获取首页数据
  getHopmeData = () =>{
    //首页广告and榜单数据请求
    this.props.dispatch({
      type:'distribution/home',
      payload:{},
      callback: (data) => {
        if(data.status === 200){
          this.setState({
            activitys: data.data.activitys,
            // activitys: [{
            //   bannerUrl:'//img1.360buyimg.com/pop/jfs/t24181/337/1413953680/175854/a52b2fd1/5b5fc564N7a40e506.jpg',
            //   activityId:1001,
            // }],
            rankings: data.data.rankings
          })
        }
      }
    })
  }
  render() {
    // router
    const { activitys, rankings} = this.state;
    const { distribution:{ headerData }  } = this.props;
    const languageForGlobal = this.props.global.languageDetails.global;
    const languageForDistribution = this.props.global.languageDetails.goods.distribution;
      // 分销商品详细资料弹窗
    const goodsItemHandle = (id) => {
      console.log(id)
    }
    // 榜单更多点击
    const moreClick = (id) => {
      const {defSearchData} = this.props.distribution
      this.props.dispatch({
        type: 'distribution/changeSearchData',
        payload: {
          ...defSearchData,
          rankType: parseInt(id)
        }
      })
    }

    return (
      <Card>
        <div className={styles.distributionContent}>
          <Header
            location={this.props.location}
            headerData={headerData}
            loadData={this.getHopmeData}
          ></Header>
          <Spin spinning={this.props.distribution.loading}>
          {/* 活动页轮播图 */}
          {
            activitys.length ? (
              <Carousel className={styles.slide} autoplay={activitys.length > 1}>
                {
                  activitys.map((item, i) => {
                    return (
                      <Link key={item.activityId} to={`/goods/distributionActivity?activityId=${item.activityId}`}>
                        <img  src={item.bannerUrl} />
                      </Link>
                    )
                  })}
              </Carousel>
            ) : null
          }
          {/* 排榜商品 */}
          {
            rankings.length ? (<div>
              {
                rankings.map((item, i) => {
                  return (
                    <div key={i} className="rankItem">
                      {
                        item.spus.length>0 ? (
                          <div>
                            <div className="title">
                              {item.rankName}
                              <Link to={`/goods/DistributionSearchList?rankType=${item.rankType}`} className="more" onClick={()=>{moreClick(item.rankType)}}>{languageForDistribution.More}>></Link>
                            </div>
                            <Goods
                              goodsItemHandle={goodsItemHandle}
                              spus={item.spus}
                            ></Goods>
                          </div>
                        ) : null
                      }

                    </div>
                  )
                })
              }
            </div>) : (
              <div className={styles.null}>
                {languageForGlobal.noData}
              </div>
            )
          }
          </Spin>
        </div>
      </Card>)
  }
}
