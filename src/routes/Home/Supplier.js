import React, { Component } from 'react';
import styles from './Home.less';
import { Redirect, Switch, Link, routerRedux } from 'dva/router';
import { Row, Col, NumberInfo, Tooltip, Icon, notification, Card  } from 'antd';
import { connect } from 'dva';
import echarts from 'echarts/lib/echarts';
// 引入折线图
import  'echarts/lib/chart/line';
// 引入柱状图
import  'echarts/lib/chart/bar';
// 引入提示框和标题组件
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/title';
@connect((state)=>({
  global: state.global
}))
export default class Supplier extends Component {
  componentDidMount () {
    const myChart = echarts.init(document.getElementById('charts'));
    window.onresize = function () {
      myChart.resize()
    }
    const colors = ['#4291f7', '#7c4cd8', '#59bfc0', '#de5567']
    const chartData = this.props.dataProfile
    let option = {
      color: ['#4291f7', '#59bfc0'],
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data:[],
        top: 25,
        itemHeight: '8'
      },
      grid: {
        left: '75px'
      },
      xAxis: [
        {
          type: 'category',
          data: [],
          axisPointer: {
              type: 'line'
          },
          axisLine: {
            lineStyle: {
                color: '#666'
            }
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '',
          min: 0,
          axisPointer: {
            show: false
          },
          axisLabel: {
              formatter: '{value}'
          },
          axisLine: {
            lineStyle: {
                color: colors[0]
            }
          }
        }
      ],
      series: []
    };

    for (let i = 0, len=chartData.length; i < len ; i++) {
      //legend配置
      option.legend.data.push(chartData[i].title)
      //Y轴数据
      let yValue = {
        name: '',
        type: '',
        yAxisIndex: 0,
        data: []
      }
      yValue.name = chartData[i].title
      yValue.type = chartData[i].type
      for (let unitData of chartData[i].data) {
        if (i === 0) {
          //x轴配置
          option.xAxis[0].data.push(unitData.xValue)
        }
        yValue.data.push(unitData.yValue)
      }
      option.series.push(yValue)
    }
    myChart.setOption(option)
  }

  linkClick = (item) => {
    const languageForGlobal = this.props.global.languageDetails.global;
    if(item.link === '') {
      notification.info({
        message: languageForGlobal.developingPromit
      });
    } else {
      this.props.dispatch(routerRedux.push({
        pathname: item.link,
        search: item.search ? item.search : ''
      }))
    }
  }

  render() {
    let tableData = this.props.spuRanking
    let summary = this.props.summary
    const languageForIndex = this.props.global.languageDetails.index;
    const colors = ['#4291f7', '#7c4cd8', '#59bfc0', '#de5567']

    const summaryRander = () => {
      let dealSummary = [
        {
          cnName: languageForIndex.awaitingShippingOrders,
          value: summary.waitingShipOrders
        },{
          cnName: languageForIndex.yesterdayOrders,
          value: summary.yesterdayOrders
        },{
          cnName: languageForIndex.yesterdayEarnings,
          value: summary.yesterdayIncome
        },{
          cnName: languageForIndex.withdrawableBalance,
          value: summary.balance
        }
      ]
      const colors = ['#4291f7', '#7c4cd8', '#59bfc0', '#de5567']
      const listItem = dealSummary.map((item, index) => {
        if (/^US\$/.test(item.value)) {
          item.value = (<span><span className={styles.unit}>US$</span><span>{item.value.split('US$')[1]}</span></span>)
        }
        if (index === 2) {
          console.log(index)
          return (<div key={index}>
            <span style={{background: colors[index]}}></span>
            <div style={{paddingTop: 25}}>
              <span> {item.cnName}</span>
              <Tooltip placement="bottom" title={languageForIndex.Dueto}>
                <Icon type="info-circle" style={{fontSize:14, color:'#4496f9', marginLeft:10, cursor: 'pointer'}}/>
              </Tooltip>
            </div>
            <strong>{item.value}</strong>
          </div>)
        }
        return (<div key={index}>
          <span style={{background: colors[index]}}></span>
          <div style={{paddingTop: 25}}>{item.cnName}</div>
          <strong>{item.value}</strong>
        </div>)
      })
      return listItem
    }

    const tableRander = () => {
      return tableData.map((item, index) => {
        if (index < 3) {
          return (<li key={index}>
            <span><span className={styles.rank} >{item.sequence}</span></span>
            <span>{item.spuId}</span>
            <span>{item.salesCount}</span>
          </li>)
        }
        return (<li key={index}>
          <span><span>{item.sequence}</span></span>
          <span>{item.spuId}</span>
          <span>{item.salesCount}</span>
        </li>)
      })
    }

    const routerLink = () => {
      let linkData = [
        {
          name: languageForIndex.productManagement,
          link: '/goods/goodsList'
        },
        {
          name: languageForIndex.OrderShipment,
          link: '/order/orderList',
          search: '?tab_id=1'
        },
        {
          name: languageForIndex.salesAnalysis,
          link: ''
        },
        {
          name: languageForIndex.narningOrWithdrawal,
          link: '/finance/supplierSettlement',
          link: ''
        }
      ]
      return linkData.map((item, index) => {
        return (<div className={styles.linkbox} to={item.link} key={index} onClick={this.linkClick.bind(this, item)}>
          <div className={styles[`father${index+1}`]}>
            <p className={styles[`child${index+1}`]}>{item.name}</p>
          </div>
        </div>)
      })
    }
    return (
      <div>
        <Row type="flex" justify="space-between" className={styles.totalBox}>
          {summaryRander()}
        </Row>
        <Card>
          <Row className={styles.subtitle}>{languageForIndex.dataOverview}</Row>
          <Row type="flex" justify="space-between">
            <Col span="16">
              <div id="charts" style={{width:'100%', height: 350}}></div>
            </Col>
            <Col span="7">
              <div>
                <p style={{fontSize: 14, color:'#212121', lineHeight: '50px', fontWeight: '600'}}>
                  <span style={{width:'33%', textAlign:'center', display:'block'}}>{languageForIndex.top5Sales}</span>
                </p>
                <ul className={styles.rankList}>
                  <li className={styles.listHead}><span>{languageForIndex.ranking}</span><span>SPU</span><span>{languageForIndex.order}</span></li>
                  {tableRander()}
                </ul>
              </div>
            </Col>
          </Row>
        </Card>
        <Row type="flex" justify="space-between" style={{paddingTop: 24,paddingBottom: 40, background:'#f5f5f5'}}>
          {routerLink()}
        </Row>
      </div>
    )
  }
}
