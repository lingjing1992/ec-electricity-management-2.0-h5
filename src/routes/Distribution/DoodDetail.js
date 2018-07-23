import React, { Component } from 'react';
import styles from './SubSearch.less';
import { Redirect, Switch, routerRedux } from 'dva/router';
import {Input, Icon, Checkbox, Button} from 'antd';
import { connect } from 'dva';

@connect(state => ({
  global: state.global
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
      min: '',
      max: ''
    },
    referencePriceSection: {
      min: '',
      max: ''
    }
  }
  componentWillMount () {
  }
  init () {
  }
  render() {
    //初始数据，用于数据初始化
    const defSortData = [
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

    let {sortData, checkboxStatus} = this.state
    let sortIndex = -1

    //是否筛选未领取商品 点击事件
    const onChange = (e) => {
      this.setState({
        checkboxStatus: e.target.checked ? 0 : 1
      })
    }

    //排序点击事件
    const sortClick = (e,index) => {
      let data = sortData[index]
      // 改变顺序状态, 若无状态则默认正序，若有状态取反状态
      data.sort = data.sort === -1 ? 1 : data.sort === 0 ? 1 : 0
      data.selected = true

      sortData = [...defSortData]
      sortData.splice(index,1,data)
      this.setState({
        sortData
      })

      this.props.dispatch({
        type: 'distribution/sortClick',
        payload: {
          orderBy: index,
          sort: data.sort
        }
      })
      e.stopPropagation()
      return false
    }

    //价格区间更新事件
    const inputChangeHandle = (e, x, y) => {
      const val = e.target.value
      const {supplyPriceSection, referencePriceSection} = this.state
      let data = {
        supplyPriceSection,
        referencePriceSection
      }
      data[x][y] = val
      this.setState({
        ...data
      })
    }
    return (
      <div className={`${styles.subSearch} clearfix`}>  
        <div className="sort">
          {sortData.map((item, index) => {
            const selected = item.selected ? 'selected' : ''
            const up = item.sort === 0 ? 'up' : ''
            const down = item.sort === 1 ? 'down' : ''
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
            <Checkbox value={0} onChange={onChange} defaultChecked={checkboxStatus === 0}>未领取</Checkbox>
          </div>          
        </div>
        <Button className="reset">重置</Button>
        <Button type="primary" className="search">搜索</Button>
        <div className="ref-setion">
          <span>参考售价：</span>
          <Input className="input" onChange={(e) => {
            inputChangeHandle(e, 'supplyPriceSection', 'min')
          }}></Input>
          <span> - </span>
          <Input className="input" onChange={(e) => {
            inputChangeHandle(e, 'supplyPriceSection', 'max')
          }}></Input>
        </div>
        <div className="spu-setion">
          <span>供货成本：</span>
          <Input className="input" onChange={(e) => {
            inputChangeHandle(e, 'referencePriceSection', 'min')
          }}></Input>
          <span> - </span>
          <Input className="input" onChange={(e) => {
            inputChangeHandle(e, 'referencePriceSection', 'max')
          }}></Input>
        </div>
              
      </div>
    )
  }
}
