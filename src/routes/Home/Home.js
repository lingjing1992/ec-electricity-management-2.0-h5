import React, { Component } from 'react';
import styles from './Home.less';
import { Redirect, Switch, routerRedux } from 'dva/router';
import { Row, Col, NumberInfo, Table, Modal } from 'antd';
import {Bar} from '../../components/Charts';
import { connect } from 'dva';
import echarts from 'echarts/lib/echarts';
import Supplier from './Supplier'
import Seller from './Seller'
import {setGa} from '../../utils/utils';
import Cookies from 'js-cookie';
// 引入折线图
import  'echarts/lib/chart/line';
// 引入柱状图
import  'echarts/lib/chart/bar';
// 引入提示框和标题组件
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';

@connect(state => ({
  global: state.global
}))

export default class Home extends Component {
  state = {
    roleType: this.props.global.rolePower.role  === 1 ? 'supplier' : 'seller',
    spuRanking:[],
    dataProfile:[],
    summary:{},
    modalVisible: false
  }
  componentWillMount () {
    this.props.dispatch({
      type: `dashboard/${this.state.roleType}`,
      payload: null,
      callback:  (rs) => {
        this.setState({
          summary: rs.data.summary,
          spuRanking: rs.data.spuRanking,
          dataProfile: rs.data.dataProfile,
        })
      }
    })
    if (this.state.roleType === 'seller') {
      this.init();
    }
  }
  init () {
    const firstLogin = Cookies.get('firstLogin')
    console.log(firstLogin)
    if (firstLogin === undefined) {
      this.setState({
        modalVisible: true
      })
    }else{
      this.setState({
        modalVisible: false
      })
    }
  }
  render() {
    const languageForIndex = this.props.global.languageDetails.index;
    const closeModle = () => {
      this.setState({
        modalVisible: false
      })
      Cookies.set('firstLogin', true, {expires: 99999})
    }
    const closeModleHendle = () => {
      closeModle()
      setGa({
        eventCategory: '全局',
        eventAction: '首次登录弹窗关闭',
        eventLabel: '商户后台首次登录弹窗关闭',
      });
      
    }
    const GoProductManagement = () => {
      closeModle()
      setGa({
        eventCategory: '全局',
        eventAction: '首次登录弹窗点击“去选品”',
        eventLabel: '商户后台首次登录弹窗点击“去选品”',
      });
      
      this.props.dispatch(routerRedux.push('/goods/distribution'));
    }
    return (
      <div style={{minWidth: 1010, padding:0}}>
        {
          this.state.roleType === 'supplier' ?
          (this.state.dataProfile.length > 0 && <Supplier summary={this.state.summary} spuRanking={this.state.spuRanking} dataProfile={this.state.dataProfile}></Supplier>)
          :(this.state.dataProfile.length > 0 && <Seller summary={this.state.summary} spuRanking={this.state.spuRanking} dataProfile={this.state.dataProfile}></Seller>)
        }
        <Modal
          className={styles.dialog}
          visible={this.state.modalVisible}
          footer={[]}
        >
          <p className={styles.dialogClose} onClick={closeModleHendle}></p>
          <p className={styles.hi}></p>
          <p className={styles.title}>
            <span>{Cookies.get('ELE_USERNAME_BRAND')}</span>
            {languageForIndex.WelcometoPearlgo}
          </p>
          <p className={styles.content}>
            {languageForIndex.Youcanselectitemsin1}<span>{languageForIndex.Distribution}</span>{languageForIndex.Youcanselectitemsin2}{languageForIndex.andpromotethe1}<span>{languageForIndex.ProductManagement}</span>{languageForIndex.andpromotethe2}
          </p>
          <p className={styles.button} onClick={GoProductManagement}>{languageForIndex.PickUpItems}</p>
        </Modal>
      </div>
    )
  }
}
