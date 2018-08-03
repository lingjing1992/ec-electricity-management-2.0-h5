import React, { Component } from 'react';
import styles from './SubSearch.less';
// import { Redirect, Switch, routerRedux } from 'dva/router';
import {Input, Icon, Checkbox, Button} from 'antd';
import { connect } from 'dva';
import { getQueryString } from '../../utils/utils'

@connect(state => ({
  global: state.global,
  distribution: state.distribution
}))

export default class SubSearch extends Component {
  state = {
    sortData: [
      {
        name: '销量',
        selected: false,
        sort: -1
      },{
        name: '供货价',
        selected: false,
        sort: -1
      },{
        name: '上架时间',
        selected: false,
        sort: -1
      }
    ],
    checkboxStatus: 1,
    supplyPriceSection: {
      min: null,
      max: null
    },
    referencePriceSection: {
      min: null,
      max: null
    }
  }
  componentWillMount () {
    this.init()
  }
  componentWillReceiveProps (nextProps) {
    const {rankType} = nextProps.distribution.searchData
    if (rankType !== this.props.distribution.searchData.rankType || !rankType) {
      this.rankTypeInit();
    }
  }
  init () {
    //根据搜索条件判断初始排序选择的状态
    const searchData =  this.props.distribution.searchData;
    const {sort, orderBy, status, rankType} = searchData
    const {sortData} = this.state;

    if (orderBy !== -1) {
      sortData[orderBy].selected = true
      sortData[orderBy].sort= sort
      this.setState({
        sortData
      })
    }

    if (status !== '') {
      this.setState({
        checkboxStatus: status
      })
    }
    this.rankTypeInit();
  }
  //排行类型初始化
  rankTypeInit = () => {
    // const { rankType } = this.props.distribution.searchData;
    const { sortData } = this.state;
    const rankType = getQueryString().rankType || this.props.distribution.searchData.rankType;
    if(rankType){
      let index = -1;
      if (rankType == 101) {
        index = 0
      } else if (rankType == 102) {
        index = 2
      }
      let data = sortData[index]
      data.selected = true
      data.sort = 1
      this.setState({
        sortData: sortData
      })
    }else {
      this.setState({
        sortData: [
          {
            name: '销量',
            selected: false,
            sort: -1
          },{
            name: '供货价',
            selected: false,
            sort: -1
          },{
            name: '上架时间',
            selected: false,
            sort: -1
          }
        ]
      })
    }
  }

  //请求
  changeHandle = () => {
    setTimeout(()=>{
      this.props.changeHandle();
    },0)
  }
  render() {
    let {sortData, checkboxStatus, supplyPriceSection, referencePriceSection} = this.state;
    const languageForDistribution = this.props.global.languageDetails.goods.distribution;
    const {searchData} = this.props.distribution

    sortData[0].name = languageForDistribution.SalesVolume;
    sortData[1].name = languageForDistribution.SupplyCost;
    sortData[2].name = languageForDistribution.PublishedTime;
    //初始数据，用于数据初始化
    const defSortData = [
      {
        name: languageForDistribution.SalesVolume,
        selected: false,
        sort: -1
      },{
        name: languageForDistribution.SupplyCost,
        selected: false,
        sort: -1
      },{
        name: languageForDistribution.PublishedTime,
        selected: false,
        sort: -1
      }
    ]



    //是否筛选未领取商品 点击事件
    const onChange = (e) => {
      const status = e.target.checked ? 0 : null;

      this.setState({
        checkboxStatus: status
      })

      //在原搜索条件基础上增加是否未领取搜索条件
      this.props.dispatch({
        type: 'distribution/changeSearchData',
        payload: {
          ...searchData,
          status
        }
      })
      this.changeHandle();
    }

    //排序点击事件
    const sortClick = (e,index) => {
      let data = sortData[index]
      // 改变顺序状态, 若无状态则默认正序，若有状态取反状态
      data.sort = data.sort === -1 ? 1 : data.sort === 1 ? 0 : 1
      data.selected = true

      sortData = [...defSortData]
      sortData.splice(index,1,data)
      this.setState({
        sortData
      })

      //在原搜索条件基础上增加排序搜索条件
      this.props.dispatch({
        type: 'distribution/changeSearchData',
        payload: {
          ...searchData,
          orderBy: index,
          sort: data.sort,
          // rankType: null
        }
      })
      this.changeHandle();
    }
    //价格区间更新事件
    const inputChangeHandle = (e, x, y) => {
      const val = e.target.value
      let data = {
        supplyPriceSection,
        referencePriceSection
      }
      data[x][y] = val.trim() ? Number(val) : null;
      this.setState({
        ...data
      })
    }

    //子搜索点击事件
    const onSearchHandle = () => {

      //在原搜索条件基础上增加排序搜索条件
      this.props.dispatch({
        type: 'distribution/changeSearchData',
        payload: {
          ...searchData,
          supplyPriceSection,
          referencePriceSection
        }
      })
      this.changeHandle();
    }

    //重置点击事件
    const onResetHandel = () => {
      this.setState({
        supplyPriceSection: {
          min: null,
          max: null
        },
        referencePriceSection: {
          min: null,
          max: null
        }
      })
    }
    return (
      <div className={`${styles.subSearch} clearfix`}>
        <div className="sort">
          {sortData.map((item, index) => {
            const selected = item.selected ? 'selected' : ''
            const up = item.sort === 0 ? 'down' : ''
            const down = item.sort === 1 ? 'up' : ''
            const tdClassName = `${selected} ${up} ${down}`
            return (
              <div key={index} className={tdClassName} onClick={(e) => {sortClick(e, index)}}>
                <span className="name">{item.name}</span>
                <span className="down">↓</span>
                <span className="up">↑</span>
              </div>
            )
          })}
          <div>
            <Checkbox value={0} onChange={onChange} defaultChecked={checkboxStatus === 0}>{languageForDistribution.Unpick}</Checkbox>
          </div>
        </div>
        <Button className="reset" onClick = {() => {onResetHandel()}}>{languageForDistribution.Reset}</Button>
        <Button type="primary" className="search" onClick={()=>{onSearchHandle()}}>{languageForDistribution.Search}</Button>
        <div className="spu-setion">
          <span className={styles.fontsize}>{languageForDistribution.ReferencePrice}：</span>
          <Input type="number" className="input" value={referencePriceSection.min} onChange={(e) => {
            inputChangeHandle(e, 'referencePriceSection', 'min')
          }}></Input>
          <span> - </span>
          <Input type="number" className="input" value={referencePriceSection.max} onChange={(e) => {
            inputChangeHandle(e, 'referencePriceSection', 'max')
          }}></Input>
        </div>
        <div className="ref-setion">
          <span className={styles.fontsize}>{languageForDistribution.SupplyCost}：</span>
          <Input type="number" className="input" value={supplyPriceSection.min} onChange={(e) => {
            inputChangeHandle(e, 'supplyPriceSection', 'min')
          }}></Input>
          <span> - </span>
          <Input type="number" className="input" value={supplyPriceSection.max} onChange={(e) => {
            inputChangeHandle(e, 'supplyPriceSection', 'max')
          }}></Input>
        </div>
      </div>
    )
  }
}
